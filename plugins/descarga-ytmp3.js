import fetch from 'node-fetch';

// --- Constantes y Configuración de Transmisión ---
const CAUSA_API_KEY = 'LUFFY-GEAR5';
const newsletterJid  = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙:🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️』࿐⟡';

// --- VALORES POR DEFECTO (Agregados para evitar ReferenceError) ---
const wm = 'Monkey D. Luffy Bot';   // Watermark
const dev = 'Piratas del Sombrero de Paja';
const redes = 'https://github.com';
const icons = 'https://i.imgur.com/0qK4X5P.jpeg'; // Imagen por defecto
// -----------------------------------------------------------------

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
      thumbnail: icons,   // Solo se usa para el mensaje de texto, no para el audio
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
      console.error(`[ERROR] No se pudo parsear JSON: ${e.message}`);
      return null;
    });

    if (!json || !json.status || !json.data) {
      return conn.reply(
        m.chat,
        `❌ *¡Error!* La API no respondió correctamente.`,
        m,
        { contextInfo, quoted: m }
      );
    }

    const data = json.data;
    const title = data.title || 'Audio de YouTube';
    const downloadURL = data.download?.url;

    // Miniatura: primero intentamos la que da la API, luego el fallback
    const thumbUrl = data.thumbnail || icons;

    if (!downloadURL) {
      throw new Error('No se encontró enlace de descarga.');
    }

    // --- Descarga segura de la miniatura (evita el error "invalid encoding") ---
    let thumbBuffer = null;
    try {
      const thumbRes = await fetch(thumbUrl);
      const contentType = thumbRes.headers.get('content-type') || '';
      if (thumbRes.ok && contentType.startsWith('image/')) {
        thumbBuffer = await thumbRes.buffer();
      } else {
        console.warn('[YTMP3] La URL de miniatura no es una imagen válida:', thumbUrl);
      }
    } catch (thumbErr) {
      console.warn('[YTMP3] No se pudo descargar la miniatura, se enviará sin ella:', thumbErr.message);
    }

    // --- Envío del audio ---
    const audioMessage = {
      audio: { url: downloadURL },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false
    };

    // Solo agregamos contextInfo con thumbnail si el buffer es válido
    if (thumbBuffer) {
      audioMessage.contextInfo = {
        ...contextInfo,
        externalAdReply: {
          ...contextInfo.externalAdReply,
          title: title,
          body: 'Descarga vía Causa API',
          thumbnail: thumbBuffer
        }
      };
    } else {
      // Si no hay thumbnail, igual podemos enviar el audio con contextInfo simple
      audioMessage.contextInfo = contextInfo;
    }

    await conn.sendMessage(m.chat, audioMessage, { quoted: m });

  } catch (e) {
    console.error('[YTMP3] Error general:', e);
    await conn.reply(
      m.chat,
      `❌ *Error al procesar el audio.*\n${e.message}`,
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