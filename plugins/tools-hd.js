import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

const luffyEmoji = "🍖🏴‍☠️";
const luffyPhrase1 = "¡Oye, Nakama! ¡Responde a una imagen para que la vuelva más épica!";
const luffyPhrase2 = "¡Eso no es una imagen válida! Usa formato JPG o PNG, ¿vale?";
const luffyPhrase3 = "¡Vamos a hacerla más HD que una fruta del diablo brillante!";
const luffyError = "¡Maldita sea! ¡La imagen se nos escapó como un Pacifista! 😤";

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || "";

    if (!mime) return m.reply(`${luffyEmoji} ${luffyPhrase1}`);
    if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`${luffyEmoji} ${luffyPhrase2}`);

    await conn.reply(m.chat, `${luffyEmoji} ${luffyPhrase3} ¡Activando el Haki del Rey!...`, m);

    const imgBuffer = await q.download?.();
    if (!imgBuffer) return m.reply(`${luffyError} No pude descargar la imagen.`);

    const imgUrl = await catbox(imgBuffer);

    if (!imgUrl) return m.reply(`${luffyError} No pude subir la imagen a catbox.`);

    const apiUrl = `https://api.stellarwa.xyz/tools/upscale?url=${encodeURIComponent(imgUrl)}&apikey=stellar-o7UYR5SC`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.result) {
      return m.reply(`${luffyError} No se pudo mejorar la imagen. El Going Merry se hundió 🥲`);
    }

    const improvedUrl = json.result; // URL de la imagen mejorada

    await conn.sendMessage(m.chat, {
      image: { url: improvedUrl },
      caption: "✨ Aquí tienes tu imagen mejorada con Haki del Rey! " + luffyEmoji,
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    return m.reply(`${luffyError} Ocurrió un error inesperado. ¡Llama a Franky para arreglar esto!`);
  }
};

handler.help = ["hd", "enhance", "remini"];
handler.tags = ["tools", "ai"];
handler.command = ["hd", "enhance", "remini"];
handler.group = true;
handler.register = true;

export default handler;

// Función para subir a catbox.moe
async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  if (!ext || !mime) throw new Error("No se pudo determinar el tipo de archivo.");

  const blob = new Blob([content], { type: mime });
  const formData = new FormData();

  const randomName = crypto.randomBytes(5).toString("hex") + "." + ext;
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomName);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  const text = await response.text();

  if (!text.startsWith("https://")) {
    throw new Error("Error al subir a catbox: " + text);
  }

  return text.trim();
}
