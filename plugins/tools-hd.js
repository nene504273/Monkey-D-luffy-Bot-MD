import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

// --- CONSTANTES ESTILO LUFFY ---
const rwait = "⚔️"; // Preparando el ataque
const done = "🍖"; // Celebración con carne
const error = "🔥"; // ¡Fallo de un puñetazo!
const emoji = "🏴‍☠️";
const luffy = "👑 ¡Soy Luffy, el que va a ser el Rey de los Piratas!";

// --- URLS DE LA API ---
const VREDEN_API_URL = "https://api.vreden.my.id/api/v1/artificial/imglarger/upscale";
const CATBOX_API_URL = "https://catbox.moe/user/api.php"; // Endpoint de subida de Catbox

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

// Función para subir imagen a Catbox para obtener URL pública
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
        // Error simple si Catbox no devuelve la URL esperada
        throw new Error(`El barco de Catbox falló al zarpar. ¡Necesito un carpintero!`); 

    } catch (e) {
        throw new Error(`¡Fallo en el salto temporal! ${e.message}`);
    }
}


let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : null;
  if (!q)
    return conn.reply(
      m.chat,
      `${luffy}\n${emoji} ¡Oye! ¿Dónde está mi mapa? ¡Necesito una imagen para zarpar! Responde a una imagen.`,
      m
    );
  let mime = (q.msg || q).mimetype || "";
  if (!mime || !mime.startsWith("image/"))
    return conn.reply(
      m.chat,
      `${luffy}\n${emoji} ¡Esto no es comida ni un tesoro! ¡No es una imagen! ¡Dame una imagen!`,
      m
    );

  await m.react(rwait);
  const scaleFactor = 4;

  try {
    let media = await q.download();
    if (!media || media.length === 0)
      throw new Error("¡El Sunny no pudo descargar el cofre del tesoro!");

    const { ext, mime: fileMime } = (await fileTypeFromBuffer(media)) || {};

    // ----------------------------------------------------
    // [PASO 1] SUBIR IMAGEN A CATBOX (El puerto temporal)
    // ----------------------------------------------------
    const publicImageUrl = await uploadToCatbox(media, fileMime, ext);

    // ----------------------------------------------------
    // [PASO 2] LLAMAR A LA API DE VREDEN (GET) (El Gear 5)
    // ----------------------------------------------------
    const vredenUrl = `${VREDEN_API_URL}?url=${encodeURIComponent(publicImageUrl)}&scale=${scaleFactor}`;

    const upscaleResponse = await fetch(vredenUrl);

    // Verificar el estado HTTP y lanzar error simple
    if (!upscaleResponse.ok) {
        throw new Error(`¡Un Almirante (HTTP ${upscaleResponse.status}) bloqueó el camino!`);
    }

    // Intentar parsear JSON
    let upscaleData;
    try {
        upscaleData = await upscaleResponse.json();
    } catch (e) {
        // Si falla el parseo, el error original es suficiente
        throw new Error(`¡El mensaje del log pose se rompió!`);
    }

    // Verificar el status de la API dentro del JSON
    if (upscaleData.status !== true || !upscaleData.result?.download) {
        throw new Error(`¡Kizaru nos golpeó! La API rechazó el Gear. Mensaje: ${upscaleData.creator || "Error interno."}`);
    }

    // ----------------------------------------------------
    // [PASO 3] DESCARGAR IMAGEN ESCALADA (El One Piece)
    // ----------------------------------------------------
    const downloadUrl = upscaleData.result.download;

    const downloadResponse = await fetch(downloadUrl);

    if (!downloadResponse.ok) {
        throw new Error(`¡Fallo al reclamar el tesoro! HTTP ${downloadResponse.status}.`);
    }

    const bufferHD = Buffer.from(await downloadResponse.arrayBuffer());

    let textoLuffy = `
🍖 *¡LO CONSEGUÍ! ¡SOY EL REY DE LA MEJORA DE IMÁGENES!*
> *Detalles:* La imagen se mejoró ${scaleFactor} veces.
> *Tamaño final:* ${formatBytes(bufferHD.length)}
>
> ¡Mira ese detalle! ¡Ahora dame carne, Sanji!
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
    // El bloque catch al estilo Luffy (pero manteniendo el error original)
    await m.react(error);
    return conn.reply(
      m.chat,
      `${luffy}\n${emoji} ¡Ugh! ¡Me golpearon! Algo salió mal, pero ¡NO ME RENDÍ!
\n*Mira, es culpa de ese pirata:* ${e.message}`,
      m
    );
  }
};

handler.help = ["hd"];
handler.tags = ["ai"];
handler.command = ["hd"];
export default handler;