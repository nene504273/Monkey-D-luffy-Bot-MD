import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

// --- CONSTANTES ---
// ¡Los colores de la aventura!
const rwait = "🗺️"; // Mapa para empezar la búsqueda
const done = "🎉"; // ¡Tesoro encontrado!
const error = "🏴‍☠️"; // ¡Bandera de peligro!
const emoji = "⚓"; // Ancla, ¡listos para zarpar!
const luffy = "🍖 ¡Soy Luffy! ¿Buscas la imagen más grande del mundo? ¡Genial!";

// --- URLS DE LA API ---
const VREDEN_API_URL = "https://api.vreden.my.id/api/v1/artificial/imglarger/upscale";
const CATBOX_API_URL = "https://catbox.moe/user/api.php"; // El puerto seguro para dejar la carga

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  // ¡Como las porciones de carne!
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

// Función para subir imagen a Catbox para obtener URL pública (¡Dejándola en el puerto!)
async function uploadToCatbox(buffer, mimeType, ext) {
    const blob = new Blob([buffer], { type: mimeType }); 
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    // ¡El nombre del archivo!
    formData.append("fileToUpload", blob, `image.${ext}`);

    try {
        const response = await fetch(CATBOX_API_URL, {
            method: "POST",
            body: formData,
        });

        const result = await response.text();

        if (result.startsWith("https://files.catbox.moe/")) {
            return result; // ¡El mapa del tesoro!
        }
        // ¡Algo falló en el muelle!
        throw new Error(`El barco de Catbox no zarpó bien. ¡Maldición, necesito un cocinero!`); 

    } catch (e) {
        throw new Error(`¡Fallo al cargar las provisiones! ${e.message}`);
    }
}


let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : null;
  if (!q)
    return conn.reply(
      m.chat,
      `${luffy}\n${emoji} ¡Oye! ¿Dónde está el tesoro? ¡Necesito una imagen para empezar la búsqueda! Responde a una.`,
      m
    );
  let mime = (q.msg || q).mimetype || "";
  if (!mime || !mime.startsWith("image/"))
    return conn.reply(
      m.chat,
      `${luffy}\n${emoji} ¡Eh! ¡Eso no es un cofre! ¡Quiero una IMAGEN! Si no, me da hambre.`,
      m
    );

  await m.react(rwait); // ¡Zarpando!
  const scaleFactor = 4; // ¡Multiplicamos la recompensa!

  try {
    let media = await q.download();
    if (!media || media.length === 0)
      throw new Error("¡El cofre estaba vacío! ¡Qué decepción!");

    const { ext, mime: fileMime } = (await fileTypeFromBuffer(media)) || {};

    // ----------------------------------------------------
    // [PASO 1] SUBIR IMAGEN A CATBOX (¡Dejamos la imagen en el barco de al lado!)
    // ----------------------------------------------------
    const publicImageUrl = await uploadToCatbox(media, fileMime, ext);

    // ----------------------------------------------------
    // [PASO 2] LLAMAR A LA API DE VREDEN (¡El Gran Capitán de la escala!)
    // ----------------------------------------------------
    const vredenUrl = `${VREDEN_API_URL}?url=${encodeURIComponent(publicImageUrl)}&scale=${scaleFactor}`;

    const upscaleResponse = await fetch(vredenUrl);

    // ¡Problemas con la Marina!
    if (!upscaleResponse.ok) {
        throw new Error(`¡El Capitán Vreden nos atacó! HTTP ${upscaleResponse.status}.`);
    }

    // Intentar parsear JSON (¡Leemos el cartel de recompensa!)
    let upscaleData;
    try {
        upscaleData = await upscaleResponse.json();
    } catch (e) {
        // ¡El mapa se rompió!
        throw new Error(`El Capitán Vreden escribió su respuesta con jeroglíficos raros.`);
    }

    // Verificar el status de la API dentro del JSON (¡Chequeamos si es el tesoro real!)
    if (upscaleData.status !== true || !upscaleData.result?.download) {
        throw new Error(`¡No es el One Piece! El mensaje es: ${upscaleData.creator || "¡Error interno del mapa!"}`);
    }

    // ----------------------------------------------------
    // [PASO 3] DESCARGAR IMAGEN ESCALADA (¡Tomamos el tesoro!)
    // ----------------------------------------------------
    const downloadUrl = upscaleData.result.download;

    const downloadResponse = await fetch(downloadUrl);

    if (!downloadResponse.ok) {
        throw new Error(`¡Fallo al agarrar el tesoro final! ¡Se cayó al mar! HTTP ${downloadResponse.status}.`);
    }

    const bufferHD = Buffer.from(await downloadResponse.arrayBuffer());

    let textoLuffy = `
🎉 *¡El One Piece... digo, la imagen HD, es tuya!*
> *Recompensa (Tamaño):* ${formatBytes(bufferHD.length)}
> ¡Ahora es tan grande que podrías comerla! (Aunque no lo hagas, sabe a pixeles).

🍖 *¡Ahora a celebrar con carne! ¡Shishishi!*
`;

    await conn.sendMessage(
      m.chat,
      {
        image: bufferHD,
        caption: textoLuffy.trim(),
      },
      { quoted: m }
    );

    await m.react(done); // ¡Fiesta!

  } catch (e) {
    // ¡Alguien se comió mi carne o me dio un golpe!
    await m.react(error);
    return conn.reply(
      m.chat,
      `${luffy}\n⚠️ ¡Rayos! ¡La aventura se puso difícil! ¡Perdimos el mapa o algo así!\n\n*Error de la Marina:* ${e.message}`,
      m
    );
  }
};

handler.help = ["hd"];
handler.tags = ["ai"];
handler.command = ["hd"];
export default handler;