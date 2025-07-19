import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import crypto from "crypto";
import { fileTypeFromBuffer } from "file-type";

const luffyEmoji = "🍖🏴‍☠️";
const luffyPhrase1 = "¡Oye, Nakama! ¡Responde a una imagen para que la vuelva más épica!";
const luffyPhrase2 = "¡Eso no es una imagen válida! Usa formato JPG o PNG, ¿vale?";
const luffyPhrase3 = "¡Vamos a hacerla más HD que una fruta del diablo brillante!";
const luffyError = "¡Maldita sea! ¡La imagen se nos escapó como un Pacifista! 😤";

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || "";

    if (!mime) return m.reply(`${luffyEmoji} ${luffyPhrase1}`);
    if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`${luffyEmoji} ${luffyPhrase2}`);

    await m.reply(`${luffyEmoji} ${luffyPhrase3} ¡Activando el Haki del Rey!...`);

    const buffer = await q.download();
    if (!buffer) return m.reply(`${luffyError} No pude descargar la imagen.`);

    const imageUrl = await catbox(buffer);
    const apiKey = "stellar-o7UYR5SC";
    const upscaleUrl = `https://api.stellarwa.xyz/tools/upscale?url=${encodeURIComponent(imageUrl)}&apikey=${apiKey}`;

    const response = await fetch(upscaleUrl);
    const json = await response.json();

    if (!json.status || !json.result?.url) {
      return m.reply(`${luffyError} No pudimos encontrar el One Piece (la imagen HD) 😞`);
    }

    await conn.sendMessage(m.chat, {
      image: { url: json.result.url },
      caption: `🏴‍☠️ ¡Aquí está tu imagen en modo HD épico, Nakama!`,
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply(`${luffyError} Llama a Franky, ¡esto necesita reparaciones!`);
  }
};

handler.help = ["remini", "hd", "enhance"];
handler.tags = ["ai", "tools"];
handler.command = ["luffyhd", "hd", "onepiecehd"];
handler.group = true;
handler.register = true;

export default handler;

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

  const url = await response.text();
  if (!url.startsWith("http")) throw new Error("Error subiendo a Catbox");
  return url;
}
