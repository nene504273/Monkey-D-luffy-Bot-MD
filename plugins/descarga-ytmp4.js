//código creado por Dioneibi-rip
//modificado por nevi-dev y actualizado para Alyabot API

import fetch from 'node-fetch';

// --- Constantes y Configuración de Transmisión ---
const ALYA_API_KEY = 'stellar-LarjcWHD'; 
const newsletterJid = '120363447935700207@newsletter'; 
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️ 』࿐⟡';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🏴‍☠️';
  const namebotLuffy = 'Sombrero de Paja Bot';
  const devLuffy = '¡Por el Rey de los Piratas!';

  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    },
    externalAdReply: {
      title: namebotLuffy,
      body: devLuffy,
      thumbnail: global.icons, // Asegúrate de que 'icons' esté definido
      sourceUrl: global.redes,  // Asegúrate de que 'redes' esté definido
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `${emoji} *¡Oye, nakama!* Necesito un enlace de YouTube para descargar ese video.\n\nEjemplo:\n*${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ*`,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    const url = args[0];

    // Validación de URL
    if (!url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/)) {
        return conn.reply(
            m.chat,
            `❌ *¡Rayos! Ese no parece un enlace de YouTube válido, nakama.*`,
            m,
            { contextInfo, quoted: m }
        );
    }

    await conn.reply(
      m.chat,
      `🍖 *¡Gomu Gomu no... Descarga!* (Usando Alya API)\n- 🏴‍☠️ ¡Trayendo el video del Grand Line!`,
      m,
      { contextInfo, quoted: m }
    );

    // *** CAMBIO: Nueva API de Alyabot ***
    const alyaApiUrl = `https://rest.alyabotpe.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&apikey=${ALYA_API_KEY}`;
    
    const res = await fetch(alyaApiUrl);
    const jsonResponse = await res.json().catch(() => null);

    if (!jsonResponse || !jsonResponse.status) {
      return conn.reply(
        m.chat,
        `❌ *¡Rayos! La API no respondió correctamente, nakama.*`,
        m,
        { contextInfo, quoted: m }
      );
    }

    // Adaptación a la estructura de Alyabot
    // Nota: Alyabot suele devolver los datos dentro de un objeto 'data' o directamente
    const data = jsonResponse.data || jsonResponse.result;
    const downloadURL = data?.url || data?.download || data?.dl_url;
    const { title, duration, author, views, thumbnail, quality } = data || {};

    if (!downloadURL) {
      return conn.reply(
        m.chat,
        `❌ *Error:* No se encontró un enlace de descarga válido en la respuesta.`,
        m,
        { contextInfo, quoted: m }
      );
    }

    const filename = `${title || 'video'}.mp4`;

    await conn.sendMessage(
      m.chat,
      {
        video: { url: downloadURL },
        caption: 
`╭━━━━[ 🏴‍☠️ YTMP4 ALYA API 🏴‍☠️ ]━━━━⬣
📹 *Título:* ${title || 'Desconocido'}
🧑‍💻 *Canal:* ${author || 'Desconocido'}
🕒 *Duración:* ${duration || 'Desconocida'}
👁️ *Vistas:* ${views || 'Desconocidas'}
🎞️ *Calidad:* ${quality || 'Auto'}
╰━━━━━━━━━━━━━━━━━━⬣`,
        mimetype: 'video/mp4',
        fileName: filename
      },
      { contextInfo, quoted: m }
    );

  } catch (e) {
    console.error(e);
    await conn.reply(
      m.chat,
      `❌ *¡Error fatal!* ${e.message}`,
      m,
      { contextInfo, quoted: m }
    );
  }
};

handler.help = ['ytmp4'].map(v => v + ' <enlace>');
handler.tags = ['descargas'];
handler.command = ['ytmp4', 'ytvideo', 'ytmp4dl'];
handler.register = true;
handler.limit = true;
handler.coin = 3;

export default handler;