//código creado por Dioneibi-rip
import fetch from 'node-fetch';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️ 』࿐⟡'; // Ya está temático de Luffy

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🏴‍☠️'; // Emoji temático de Luffy
  const namebotLuffy = 'Sombrero de Paja Bot'; // Nombre del bot temático de Luffy
  const devLuffy = '¡Por el Rey de los Piratas!'; // Frase del desarrollador temático de Luffy
  const iconsLuffy = 'https://i.imgur.com/your_luffy_icon.jpg'; // Placeholder para ícono de Luffy
  const redesLuffy = 'https://one-piece.com/'; // Placeholder para URL de One Piece

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
      title: namebotLuffy, // Usando el nombre temático de Luffy
      body: devLuffy, // Usando la frase temática de Luffy
      thumbnail: iconsLuffy, // Usando el placeholder para el ícono de Luffy
      sourceUrl: redesLuffy, // Usando el placeholder para la URL de One Piece
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `${emoji} *¡Oye, nakama!* Necesito un enlace de YouTube para descargar ese video. ¡Vamos, no perdamos el tiempo!\n\nEjemplo de uso:\n*${usedPrefix + command} https://youtu.be/3vWtHIA2b7c*`,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    await conn.reply(
      m.chat,
      `🍖 *¡Gomu Gomu no... Descarga!*
- 🏴‍☠️ ¡Estoy en ello, nakama! Dame un segundo para traer ese video.`,
      m,
      { contextInfo, quoted: m }
    );

    const url = args[0];
    const api = `https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(url)}`;
    const res = await fetch(api);
    const json = await res.json();

    if (json.status !== 200 || !json.result?.download?.url) {
      return conn.reply(
        m.chat,
        `❌ *¡Rayos! No pude descargar el video, nakama.*\nRazón: ${json.message || 'La respuesta no es la que esperaba. ¡Quizás el Grand Line es más difícil de lo que pensaba!'}.`,
        m,
        { contextInfo, quoted: m }
      );
    }

    const {
      title,
      description,
      timestamp,
      views,
      image,
      author,
      url: videoURL
    } = json.result.metadata;

    const {
      url: downloadURL,
      quality,
      filename
    } = json.result.download;

    const videoRes = await fetch(downloadURL);
    const videoBuffer = await videoRes.buffer();

    await conn.sendMessage(
      m.chat,
      {
        video: videoBuffer,
        caption:
`╭━━━━[ 🏴‍☠️ YTMP4 del Rey de los Piratas 🏴‍☠️ ]━━━━⬣
📹 *Título:* ${title}
🧑‍💻 *Tripulación:* ${author?.name || 'Desconocido'}
🕒 *Duración de la Aventura:* ${timestamp}
📅 *Fecha de Zarpe:* ${json.result.metadata.ago}
👁️ *Vistas por la Tripulación:* ${views.toLocaleString()}
🎞️ *Calidad de la Aventura:* ${quality}
📄 *Bitácora del Capitán:*
${description}
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
      `❌ *¡Problemas en el Grand Line!* Ocurrió un error al procesar el video, nakama.\nDetalles: ${e.message}. ¡Necesitamos más carne para esto!`,
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