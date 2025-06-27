import fetch from 'node-fetch';
import sharp from 'sharp';  // Necesitas instalar esta librería

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, '❗ Ingresa una descripción para generar el sticker.\n\nEjemplo:\n*.stickergen cat eat banana*', m);

  await m.react('🪄');
  conn.reply(m.chat, '🪄 Generando tu sticker...\nPor favor espera un momento...', m);

  try {
    const url = `https://api.neoxr.eu/api/sticker-gen?q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const json = await res.json();

    if (!json.status || !json.data?.image?.length) {
      return conn.reply(m.chat, '❌ Ocurrió un error al generar el sticker.\nIntenta con otra descripción o más tarde.', m);
    }

    const imageUrl = json.data.image[0];
    const imageBuffer = await fetch(imageUrl).then(res => res.buffer());

    // Convertimos la imagen a WebP con sharp
    const webpBuffer = await sharp(imageBuffer)
      .webp({ quality: 90 })  // Ajustamos la calidad si es necesario
      .toBuffer();

    await conn.sendMessage(m.chat, {
      sticker: webpBuffer
    }, { quoted: m });

  } catch (err) {
    console.error('[ERROR]', err);
    conn.reply(m.chat, '⚠️ Ocurrió un error inesperado al procesar tu solicitud.', m);
  }
};

handler.help = ['stickergen'];
handler.tags = ['fun', 'tools'];
handler.command = ['stickergen'];
handler.register = true;

export default handler;
