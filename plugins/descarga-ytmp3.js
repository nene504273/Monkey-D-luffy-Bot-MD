import fetch from 'node-fetch';

const newsletterJid  = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡';

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
      `🌸 *Procesando tu petición...*\nUn momento, senpai~ 🎧`,
      m,
      { contextInfo, quoted: m }
    );

    const url = args[0];
    const apiUrl = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`;
    const res     = await fetch(apiUrl);
    const json    = await res.json();

    if (json.status !== 200 || !json.result?.download?.url) {
      return conn.reply(
        m.chat,
        `❌ *No pude descargar el audio.*\nRazón: ${json.message || 'Respuesta inválida.'}`,
        m,
        { contextInfo, quoted: m }
      );
    }

    // Metadata
    const meta = json.result.metadata;
    const title       = meta.title;
    const description = meta.description;
    const timestamp   = meta.timestamp;
    const views       = meta.views.toLocaleString();
    const ago         = meta.ago;
    const authorName  = meta.author?.name || 'Desconocido';
    // Download info
    const downloadURL = json.result.download.url;
    const quality     = json.result.download.quality;
    const filename    = json.result.download.filename;

    const audioRes    = await fetch(downloadURL);
    const audioBuffer = await audioRes.buffer();

    // Caption con separadores
    const caption = `
╭───[ 𝚈𝚃𝙼𝙿𝟹 • 🎶 ]───⬣
📌 *Título:* ${title}
👤 *Autor:* ${authorName}
⏱️ *Duración:* ${timestamp}
📅 *Publicado:* ${ago}
👁️ *Vistas:* ${views}
🎚️ *Calidad:* ${quality}
📄 *Descripción:*
${description}
╰────────────────⬣`;

    // Enviar audio
    await conn.sendMessage(
      m.chat,
      {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: filename,
        ptt: false,
        caption
      },
      { contextInfo, quoted: m }
    );

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
