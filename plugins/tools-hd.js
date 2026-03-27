import fetch from 'node-fetch';
import FormData from 'form-data';

const handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  // Validación de la imagen
  if (!mime) {
    return conn.reply(m.chat, `🍒 Envía una *imagen* junto al *comando* ${usedPrefix + command}`, m);
  }
  if (!/image\/(jpe?g|png)/.test(mime)) {
    return conn.reply(m.chat, `🌾 El formato *${mime}* no es compatible`, m);
  }

  await m.react("⏳"); // Reacción de espera inicial

  try {
    // 1. Descarga de la imagen
    const buffer = await q.download();
    if (!buffer) throw new Error("No se pudo descargar la imagen original.");

    // 2. Subida a Uguu para obtener una URL pública
    const uploadedUrl = await uploadToUguu(buffer);
    if (!uploadedUrl) {
      return conn.reply(m.chat, '🌱 No se pudo *subir* la imagen al servidor.', m);
    }

    // 3. Procesamiento con la API de Siputzx
    let upscaleApi = `https://api.siputzx.my.id/api/iloveimg/upscale?image=${encodeURIComponent(uploadedUrl)}&scale=2`;
    let res = await fetch(upscaleApi);
    let data = await res.json();

    if (!data.status || !data.result) {
      throw new Error(data.message || "La API no pudo mejorar la imagen.");
    }

    // 4. Enviar el resultado final
    await conn.sendMessage(m.chat, { 
      image: { url: data.result }, 
      caption: '✅ *Imagen mejorada con éxito*\n\n🔗 *Enlace:* ' + data.result
    }, { quoted: m });
    
    await m.react("✅"); // Reacción de éxito

  } catch (err) {
    console.error(err);
    await m.react("❌");
    return conn.reply(m.chat, `❌ *Error:* ${err.message}`, m);
  }
};

// ─── Configuración del Plugin ───
handler.help = ['hd', 'upscale'];
handler.tags = ['utils'];
handler.command = ['hd', 'mejorar', 'upscale']; 
handler.register = true;
handler.limit = true;

export default handler;

// ─── Funciones auxiliares ───
async function uploadToUguu(buffer) {
  const body = new FormData();
  body.append('files[]', buffer, 'image.jpg');

  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    body,
    headers: body.getHeaders(),
  });

  const json = await res.json();
  return json.files?.[0]?.url;
}