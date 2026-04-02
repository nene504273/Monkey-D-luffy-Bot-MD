import fetch from 'node-fetch';

// --- Constantes y Configuración ---
const CAUSA_API_KEY = 'LUFFY-GEAR5'; // Tu API Key de Causa
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
      thumbnail: global.icons, 
      sourceUrl: global.redes,  
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
      `🍖 *¡Gomu Gomu no... Descarga!*\n- 🏴‍☠️ ¡Buscando el tesoro en los servidores!`,
      m,
      { contextInfo, quoted: m }
    );

    // *** CAMBIO: URL y Parámetros para Apicausas ***
    // La API de Causa usa: type=video, url=URL, apikey=KEY
    const causaApiUrl = `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(url)}&type=video&apikey=${CAUSA_API_KEY}`;

    const res = await fetch(causaApiUrl);
    const jsonResponse = await res.json().catch(() => null);

    // Validación de estado de Causa API (usualmente devuelve { status: true, data: {...} })
    if (!jsonResponse || !jsonResponse.status || !jsonResponse.data) {
      return conn.reply(
        m.chat,
        `❌ *¡Rayos! La API de Causa no respondió correctamente o el enlace falló.*`,
        m,
        { contextInfo, quoted: m }
      );
    }

    // Estructura de Causa API: jsonResponse.data contiene el título y el objeto download
    const { title, download } = jsonResponse.data;
    const downloadURL = download?.url; 

    if (!downloadURL) {
      return conn.reply(
        m.chat,
        `❌ *Error:* No se obtuvo un enlace de descarga directo.`,
        m,
        { contextInfo, quoted: m }
      );
    }

    await conn.sendMessage(
      m.chat,
      {
        video: { url: downloadURL },
        caption: 
`╭━━━━[ 🏴‍☠️ YTMP4 CAUSA API 🏴‍☠️ ]━━━━⬣
📹 *Título:* ${title || 'Video de YouTube'}
⚓ *Estado:* ¡Descargado con éxito!
🏴‍☠️ *Bot:* ${namebotLuffy}
╰━━━━━━━━━━━━━━━━━━⬣`,
        mimetype: 'video/mp4',
        fileName: `${title || 'video'}.mp4`
      },
      { contextInfo, quoted: m }
    );

  } catch (e) {
    console.error(e);
    await conn.reply(
      m.chat,
      `❌ *¡Error fatal en el Grand Line!* ${e.message}`,
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
