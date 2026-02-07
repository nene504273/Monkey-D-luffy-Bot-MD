import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

// --- CONSTANTES ---
const rwait = "🗺️"; 
const done = "🎉"; 
const error = "🏴‍☠️"; 
const emoji = "⚓"; 
const luffy = "🍖 ¡Soy Luffy! ¿Quieres que esta imagen sea tan grande como el Gear 5? ¡VAMOS!";

// --- CONFIGURACIÓN DE API ---
const ALYA_API_URL = "https://rest.alyabotpe.xyz/tools/upscale";
const ALYA_KEY = "LUFFY-GEAR5";

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!/image\/(jpe?g|png)/.test(mime)) {
    return conn.reply(
      m.chat,
      `${luffy}\n${emoji} ¡Oye! ¡Necesito una imagen (JPG/PNG) para usar el Gomu Gomu no Upscale!`,
      m
    );
  }

  await m.react(rwait);

  try {
    // 1. Descargamos la imagen del chat
    let media = await q.download();
    if (!media) throw new Error("¡El cofre estaba vacío! No pude descargar la imagen.");

    const { ext, mime: fileMime } = (await fileTypeFromBuffer(media)) || { ext: "jpg", mime: "image/jpeg" };

    // 2. Preparamos el FormData para la API de Alyabot
    const formData = new FormData();
    const blob = new Blob([media], { type: fileMime });
    
    formData.append("image", blob, `image.${ext}`);
    // Nota: Si la API requiere la key por header o query, aquí la enviamos
    // Según el estándar de Alyabot, suele ir como parámetro en la URL o en el Body

    // 3. Llamada a la API
    const response = await fetch(`${ALYA_API_URL}?apikey=${ALYA_KEY}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error(`La Marina bloqueó el paso (HTTP ${response.status})`);

    const resJson = await response.json();

    // 4. Verificamos la respuesta (Ajustado a la estructura común de Alyabot)
    // Usualmente: { status: true, result: "url_de_la_imagen" }
    const resultUrl = resJson.result || resJson.url || (resJson.data && resJson.data.url);

    if (!resultUrl) {
      throw new Error(resJson.message || "¡No encontré el tesoro en la respuesta de la API!");
    }

    // 5. Descargamos el resultado final
    const finalImageRes = await fetch(resultUrl);
    if (!finalImageRes.ok) throw new Error("¡La imagen HD se perdió en el Grand Line!");
    
    const bufferHD = Buffer.from(await finalImageRes.arrayBuffer());

    let textoLuffy = `
🎉 *¡GOMU GOMU NO... SUPER ESCALA!*
> *Tamaño final:* ${formatBytes(bufferHD.length)}
> ¡Tu imagen ahora tiene el poder de un Yonko! 

🍖 *¡Shishishi! ¡A disfrutar del banquete visual!*
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
    console.error(e);
    await m.react(error);
    return conn.reply(
      m.chat,
      `${luffy}\n⚠️ ¡Rayos! Algo salió mal en la travesía...\n\n*Error:* ${e.message}`,
      m
    );
  }
};

handler.help = ["hd"];
handler.tags = ["ai"];
handler.command = ["hd", "upscale", "remini"];
export default handler;