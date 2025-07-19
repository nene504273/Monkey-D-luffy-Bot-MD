import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomBytes + "." + ext);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  return await response.text();
}

const rwait = '⏳';   // Emoji esperando
const done = '✅';   // Emoji hecho
const error = '❌';  // Emoji error

let handler = async (m, { conn }) => {
  if (!m.quoted) return conn.reply(m.chat, '🦴 *¡Oye! Responde a una imagen para mejorarla en HD, nakama!*', m);
  let q = m.quoted;
  let mime = (q.msg || q).mimetype || '';
  if (!mime.includes('image')) return conn.reply(m.chat, '☠️ *¡Solo funciona respondiendo imágenes, amigo!*', m);

  await m.react(rwait);

  try {
    // Descarga la imagen original
    let media = await q.download();
    // Sube la imagen original a catbox para obtener URL (opcional, pero sirve para fallback)
    let originalUrl = await catbox(media);

    // Llama la API de Stellar para mejorar imagen en HD
    const apiUrl = `https://api.stellarwa.xyz/tools/upscale?url=${encodeURIComponent(originalUrl)}&apikey=stellar-o7UYR5SC`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('API no respondió bien.');
    const json = await res.json();

    if (!json.status || !json.result) throw new Error('No se pudo mejorar la imagen.');

    const hdUrl = json.result;

    // Envía la imagen mejorada
    let caption = `
🚀 *¡Aumentando la potencia, nakama!*
👊 Imagen mejorada en HD lista para ti, ¡disfrútala con toda la fuerza! 💥`;

    await conn.sendMessage(m.chat, {
      image: { url: hdUrl },
      caption,
    }, { quoted: m });

    await m.react(done);

  } catch (e) {
    console.error(e);
    await m.react(error);
    return conn.reply(m.chat, '💀 *¡Ugh, algo falló mientras mejoraba la imagen, intenta otra vez!*', m);
  }
};

handler.help = ['he'];
handler.tags = ['transformador', 'imagen'];
handler.command = ['hd'];
export default handler;
