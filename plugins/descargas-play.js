import fetch from 'node-fetch';
import yts from 'yt-search';

const newsletterJid  = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 Ruby-Hoshino-Channel 』࿐⟡';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender);
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
      title: packname,
      body: dev,
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };


  if (args[0] === 'audio' || args[0] === 'video') {
    const mode = args[0];                  
    const url  = args.slice(1).join(' ');   
    if (!url) return conn.reply(m.chat, `⚠️ Uso: ${usedPrefix}play ${mode} <url>`, m, { contextInfo });

    
    const apiUrl = mode === 'video'
      ? `https://api.vreden.my.id/api/ytplaymp4?query=${encodeURIComponent(url)}`
      : `https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(url)}`;

   
    await conn.reply(m.chat, `⏳ *Procesando ${mode} para ti, ${name}-chan...*`, m, { contextInfo });

    try {
      const res  = await fetch(apiUrl);
      const jsn  = await res.json();
      const meta = jsn.result.metadata;
      const dl   = jsn.result.download;

      if (!jsn.status === 200 || !dl?.url) {
        throw new Error('No se obtuvo enlace de descarga.');
      }

      const dataBuffer = await (await fetch(dl.url)).buffer();
      const title      = meta.title;
      const caption    = mode === 'video'
        ? `📹 *${title}*\n🎞 Calidad: ${dl.quality}`
        : `🎵 *${title}*\n🔊 Calidad: ${dl.quality}`;

      await conn.sendMessage(
        m.chat,
        mode === 'video'
          ? { video: dataBuffer, mimetype: 'video/mp4', fileName: dl.filename, caption }
          : { audio: dataBuffer, mimetype: 'audio/mpeg', fileName: dl.filename, ptt: false, caption },
        { quoted: m, contextInfo }
      );
    } catch (e) {
      console.error(e);
      await conn.reply(m.chat, `❌ Oops, ocurrió un error: ${e.message}`, m, { contextInfo });
    }
    return;
  }


  if (!args[0]) {
    return conn.reply(m.chat,
      `🌸 *Konnichiwa ${name}-chan!* ¿Qué quieres escuchar o ver? 🎶📹\n\n` +
      `Ejemplo:\n${usedPrefix}play Goku conoce a Bills`,
      m, { contextInfo }
    );
  }

  
  const query = args.join(' ');
  await conn.reply(m.chat, `🔎 *Buscando "${query}" para ti, ${name}-chan...*`, m, { contextInfo });

  const search = await yts(query);
  const video  = search.videos?.[0];
  if (!video) {
    return conn.reply(m.chat, `😿 Lo siento ${name}-chan, no encontré nada con "${query}".`, m, { contextInfo });
  }

  
  const buttons = [
    { buttonId: `${usedPrefix}play audio ${video.url}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
    { buttonId: `${usedPrefix}play video ${video.url}`, buttonText: { displayText: '📹 Vídeo' }, type: 1 }
  ];

  
  const caption = 
`╭─ꨪᰰ━۪  ࣪ ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ 🍵᮫໋⃨𝆬 ࣪ ⏜ׄ᷼⌒╼࡙֟፝͝ ╾ 
> 𑁯᧙  🍓 *Título:* ${video.title}
> 𑁯᧙  📏 *Duración:* ${video.timestamp}
> 𑁯᧙  👁️ *Vistas:*  ${video.views.toLocaleString()}
> 𑁯᧙  🎨 *Autor:* ${video.author.name}
> 𑁯᧙  🕰️ *Publicado:* ${video.ago}
> 𑁯᧙  📝 *vídeo url:* ${video.url}
╰─ꨪᰰ━۪  ࣪ ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ 🍵᮫໋⃨𝆬 ࣪ ⏜ׄ᷼⌒╼࡙֟፝͝ ╾
💌 Arigatou por usarme, siempre estaré aquí para ti~ ✨`;

  await conn.sendMessage(
    m.chat,
    {
      image: { url: video.thumbnail },
      caption,
      footer: 'Elige Audio o Vídeo ↓',
      buttons,
      headerType: 4
    },
    { quoted: m, contextInfo }
  );
};

handler.help = ['play'].map(v => v + ' <texto>');
handler.tags = ['descargas'];
handler.command = ['play'];
handler.register = true;

export default handler;
