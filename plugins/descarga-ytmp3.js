import fetch from 'node-fetch';

// --- Constantes y Configuración de Transmisión ---
const ALYA_API_KEY = 'estellar-LarjcWHD'; // Tu nueva clave de API
const newsletterJid  = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙:🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️』࿐⟡';

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

    // --- CAMBIO: Usando la API de AlyaBot ---
    // Se construye la URL con los parámetros necesarios: url y apikey
    const alyaApiUrl = `https://rest.alyabotpe.xyz/dl/ytmp3?url=${encodeURIComponent(url)}&apikey=${ALYA_API_KEY}`;
    
    const res = await fetch(alyaApiUrl);
    const json = await res.json().catch(e => {
        console.error(`[ERROR] No se pudo parsear la respuesta JSON: ${e.message}`);
        return null;
    });

    if (!json || !json.status) {
        return conn.reply(
            m.chat,
            `❌ *¡Error!* La API no respondió correctamente o el enlace es inválido.`,
            m,
            { contextInfo, quoted: m }
        );
    }

    // --- Adaptando la extracción de datos de AlyaBot ---
    // Nota: Se asume que la API devuelve { status: true, result: { title, download_url, ... } }
    const result = json.result;
    const title = result.title || 'Audio de YouTube';
    const downloadURL = result.download_url || result.url; // Ajustar según la respuesta real del JSON
    const thumb = result.thumbnail || icons;

    const caption = `
╭───[ 𝚈𝚃𝙼𝙿𝟹 • 🎶 ]───⬣
📌 *Título:* ${title}
🎚️ *Calidad:* 128kbps
🎧 *Enviando audio...*
╰────────────────⬣`;

    if (downloadURL) {
      // Enviar el archivo de audio
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
               body: 'Descarga Completada',
               thumbnail: await (await fetch(thumb)).buffer() 
            }
          }
        },
        { quoted: m }
      );
    } else {
      throw new Error('No se encontró un enlace de descarga válido en la respuesta.');
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
handler.command = ['ytmp3', 'ytaudio', 'mp3'];
handler.register = true;
handler.limit = true;
handler.coin = 2;

export default handler;