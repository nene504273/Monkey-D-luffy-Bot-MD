import fetch from 'node-fetch';

// --- Constantes y Configuración de Transmisión ---
const CAUSA_API_KEY = 'LUFFY-GEAR5'; // Tu clave de Causa API
const newsletterJid  = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙:🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️』࿐⟡';

// --- VALORES POR DEFECTO (Agregados para evitar ReferenceError) ---
const wm = 'Monkey D. Luffy Bot';   // Watermark
const dev = 'Equipo Pirata';        // Nombre del dev
const redes = 'https://github.com'; // URL de redes
const icons = 'https://i.imgur.com/0qK4X5P.jpeg'; // URL de una imagen por defecto (puedes cambiarla)
// ----------------------------------------------------------------

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🎵';
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
      title: wm, 
      body: dev, 
      thumbnail: icons, 
      sourceUrl: redes, 
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `${emoji} *¡Oh no~!* pásame un enlace de YouTube para traer el audio.\n\nUso:\n\`${usedPrefix + command} https://youtu.be/KHgllosZ3kA\``,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    await conn.reply(
      m.chat,
      `📌 *Procesando tu petición...*\nUn momento, senpai~ 🎧`,
      m,
      { contextInfo, quoted: m }
    );

    const url = args[0];

    const causaApiUrl = `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(url)}&type=audio&apikey=${CAUSA_API_KEY}`;

    const res = await fetch(causaApiUrl);
    const json = await res.json().catch(e => {
        console.error(`[ERROR] No se pudo parsear la respuesta JSON: ${e.message}`);
        return null;
    });

    if (!json || !json.status || !json.data) {
        return conn.reply(
            m.chat,
            `❌ *¡Error!* La API de Causa no respondió correctamente o el enlace es inválido.`,
            m,
            { contextInfo, quoted: m }
        );
    }

    const data = json.data;
    const title = data.title || 'Audio de YouTube';
    const downloadURL = data.download?.url; 

    // Intentamos obtener la miniatura que devuelve la API (si existe), sino usamos la por defecto
    const thumbUrl = data.thumbnail || icons;

    if (downloadURL) {
      let thumbBuffer = null;
      try {
        const thumbRes = await fetch(thumbUrl);
        thumbBuffer = await thumbRes.buffer();
      } catch (thumbErr) {
        console.error('No se pudo descargar la miniatura, se omite.', thumbErr);
      }

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: downloadURL },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          ptt: false,
          contextInfo: {
            ...contextInfo,
            externalAdReply: {
               ...contextInfo.externalAdReply,
               title: title,
               body: 'Descarga Completada vía Causa API',
               thumbnail: thumbBuffer
            }
          }
        },
        { quoted: m }
      );
    } else {
      throw new Error('No se encontró un enlace de descarga válido en la respuesta de Causa.');
    }

  } catch (e) {
    console.error(e);
    await conn.reply(
      m.chat,
      `❌ *Ocurrió un error al procesar el audio.*\nDetalles: ${e.message}`,
      m,
      { contextInfo, quoted: m }
    );
  }
};

handler.help = ['ytmp3'].map(v => v + ' <link>');
handler.tags = ['descargas'];
handler.command = ['ytmp3', 'ytaudio'];
handler.register = true;
handler.limit = true;
handler.coin = 2;

export default handler;