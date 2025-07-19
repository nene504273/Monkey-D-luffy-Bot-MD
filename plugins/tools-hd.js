import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

const rwait = "⏳";  // Emoji espera
const done = "✅";   // Emoji listo
const error = "❌";  // Emoji error
const emoji = "❕";  // Emoji info
const dev = "👑 luffy-sama te cuida ~";

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

let handler = async (m, { conn }) => {
  // Revisar si el mensaje es respuesta a imagen
  let q = m.quoted ? m.quoted : null;
  if (!q) return conn.reply(m.chat, `${emoji} ¡Oye, responde a una imagen, no seas lento!`, m);
  let mime = (q.msg || q).mimetype || '';
  if (!mime || !mime.startsWith("image/")) return conn.reply(m.chat, `${emoji} ¡Eso no es una imagen, responde a una imagen!`, m);

  await m.react(rwait);

  try {
    // Descargar imagen original
    let media = await q.download();
    if (!media || media.length === 0) throw new Error("No pude descargar la imagen :(");

    // Subir imagen a Catbox para obtener link accesible públicamente
    let urlCatbox = await catbox(media);

    if (!urlCatbox || !urlCatbox.startsWith("http")) throw new Error("No pude subir la imagen a Catbox, falla de servidor.");

    // Construir URL de upscale HD con la API de Stellar
    let apiUpscaleUrl = `https://api.stellarwa.xyz/tools/upscale?url=${encodeURIComponent(urlCatbox)}&apikey=stellar-o7UYR5SC`;

    // Llamar API para obtener la imagen en HD
    let resUpscale = await fetch(apiUpscaleUrl);
    if (!resUpscale.ok) throw new Error("Upscale API falló, intenta luego.");

    let jsonUpscale = await resUpscale.json();

    if (!jsonUpscale || !jsonUpscale.result || !jsonUpscale.result.url) {
      throw new Error("No recibí la imagen HD de la API, intenta otra vez.");
    }

    let urlHD = jsonUpscale.result.url;

    // Descargar la imagen HD para enviarla como buffer
    let resHD = await fetch(urlHD);
    if (!resHD.ok) throw new Error("No pude descargar la imagen HD :(");

    let bufferHD = Buffer.from(await resHD.arrayBuffer());

    // Enviar la imagen HD con texto estilo Luffy
    let textoLuffy = `
🐒 *¡Oye, mira! Aquí tienes la imagen en HD que me pediste, ¡más clara que el agua del Grand Line!*

🔥 _¡Disfrútala, nakama!_ 💥
`;

    await conn.sendMessage(m.chat, {
      image: bufferHD,
      caption: textoLuffy.trim()
    }, { quoted: m });

    await m.react(done);
  } catch (e) {
    console.error(e);
    await m.react(error);
    return conn.reply(m.chat, `⚠️ ¡Uuups! Algo salió mal, intenta de nuevo o dime a Rem-chan qué pasó.\n\n*Error:* ${e.message}`, m);
  }
};

handler.help = ['he'];
handler.tags = ['transformador', 'imagen'];
handler.command = ['hd'];
export default handler;
