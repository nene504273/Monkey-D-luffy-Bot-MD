import fetch from "node-fetch";
import { FormData, Blob } from "form-data-node";
import { fileTypeFromBuffer } from "file-type";

// --- CONSTANTES ---
const rwait = "⌛";
const done = "🍖";
const error = "☠️";
const emoji = "✨";
const luffy = "*🏴‍☠️ ¡Yo soy Luffy, el hombre que se convertirá en el Rey de los Piratas!*";

// --- URLS DE LA API ---
const VREDEN_API_URL = "https://api.vreden.my.id/api/v1/artificial/imglarger/upscale";
const CATBOX_API_URL = "https://catbox.moe/user/api.php"; 

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function uploadToCatbox(buffer, mimeType, ext) {
    const blob = new Blob([buffer], { type: mimeType }); 
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", blob, `image.${ext}`);

    try {
        const response = await fetch(CATBOX_API_URL, {
            method: "POST",
            body: formData,
        });
        const result = await response.text();
        if (result.startsWith("https://files.catbox.moe/")) {
            return result;
        }
        throw new Error(`¡El cofre de Catbox está vacío! No pude subir la imagen.`); 
    } catch (e) {
        throw new Error(`¡Hubo un problema en el barco!: ${e.message}`);
    }
}

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : null;
  if (!q)
    return conn.reply(
      m.chat,
      `${luffy}\n${emoji} ¡Oye! Necesito que me des una imagen para mejorarla. ¡No puedo estirarme sin ver qué hay!`,
      m
    );
    
  let mime = (q.msg || q).mimetype || "";
  if (!mime || !mime.startsWith("image/"))
    return conn.reply(
      m.chat,
      `${luffy}\n${emoji} ¡Eso no es un tesoro! Por favor, responde a una imagen de verdad.`,
      m
    );

  await m.react(rwait);
  const scaleFactor = 4;

  try {
    let media = await q.download();
    if (!media || media.length === 0)
      throw new Error("¡No pude atrapar la imagen, se escapó!");

    const { ext, mime: fileMime } = (await fileTypeFromBuffer(media)) || {};

    // [PASO 1] SUBIR IMAGEN A CATBOX
    const publicImageUrl = await uploadToCatbox(media, fileMime, ext);

    // [PASO 2] LLAMAR A LA API DE VREDEN
    const vredenUrl = `${VREDEN_API_URL}?url=${encodeURIComponent(publicImageUrl)}&scale=${scaleFactor}`;
    const upscaleResponse = await fetch(vredenUrl);

    if (!upscaleResponse.ok) {
        throw new Error(`¡La Marina bloqueó el paso! (Error HTTP ${upscaleResponse.status})`);
    }

    let upscaleData;
    try {
        upscaleData = await upscaleResponse.json();
    } catch (e) {
        throw new Error(`¡La respuesta de la API parece un mapa roto!`);
    }

    if (upscaleData.status !== true || !upscaleData.result?.download) {
        throw new Error(`¡No pudimos mejorar la imagen! Algo salió mal en el Grand Line.`);
    }

    // [PASO 3] DESCARGAR IMAGEN ESCALADA
    const downloadUrl = upscaleData.result.download;
    const downloadResponse = await fetch(downloadUrl);

    if (!downloadResponse.ok) {
        throw new Error(`¡No pude recoger el botín final! HTTP ${downloadResponse.status}.`);
    }

    const bufferHD = Buffer.from(await downloadResponse.arrayBuffer());

    let textoLuffy = `
🌟 *¡Gomu Gomu no... HD!*
> *Escala:* ${scaleFactor}x
> *Peso del tesoro:* ${formatBytes(bufferHD.length)}

🔥 ¡Mira qué increíble se ve ahora! ¡Vamos por más aventuras! 🍖
`;

    await conn.sendMessage(
      m.chat,
      {
        image: bufferHD,
        caption: textoLuffy.trim(),
      },
      { quoted: m }
    );

    await m.react(done);

  } catch (e) {
    await m.react(error);
    return conn.reply(
      m.chat,
      `${luffy}\n⚠️ ¡Uf! Algo salió muy mal... ¡seguro fue culpa de Buggy!\n\n*Error:* ${e.message}`,
      m
    );
  }
};

handler.help = ["hd"];
handler.tags = ["ai"];
handler.command = ["hd"];
export default handler;