import fetch from "node-fetch";
import yts from "yt-search";

const SIZE_LIMIT_MB = 100;
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧𝐤𝐞𝐲 𝐃 𝐁ᴏ𝐭';

const handler = async (m, { conn, args, usedPrefix, command }) => {
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
      title: '¡El Rey de los Piratas te trae música! 🎶',
      body: `¡Vamos a buscar eso, ${name}!`,
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué canción o video estás buscando?\n\nEjemplo:\n${usedPrefix}play Binks no Sake`, m, { contextInfo });
  }

  const isMode = args[0] === "audio" || args[0] === "video";
  const query = isMode ? args.slice(1).join(" ") : args.join(" ");

  const search = await yts(query);
  const video = search.videos?.[0];

  if (!video) {
    return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${query}"`, m, { contextInfo });
  }

  if (isMode) {
    const apiBase = "https://api.stellarwa.xyz/dow";
    const dlApi = isMode === "audio"
      ? `${apiBase}/ytmp3?url=${encodeURIComponent(video.url)}`
      : `${apiBase}/ytmp4?url=${encodeURIComponent(video.url)}`;

    try {
      const res = await fetch(dlApi);
      const json = await res.json();

      if (!json.status || !json.data?.dl) {
        return conn.reply(m.chat, `❌ *Error descargando ${isMode}:* ${json.message || 'Sin enlace válido'}`, m, { contextInfo });
      }

      const fileSize = isMode === "video"
        ? parseInt((await fetch(json.data.dl, { method: "HEAD" })).headers.get("content-length") || "0") / (1024 * 1024)
        : 0;

      const asDocument = fileSize > SIZE_LIMIT_MB;

      if (isMode === "audio") {
        await conn.sendMessage(m.chat, {
          audio: { url: json.data.dl },
          mimetype: "audio/mpeg",
          fileName: json.data.title + ".mp3",
          ptt: false
        }, { quoted: m });
        return m.react("🎧");
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: json.data.dl },
          caption: `📹 *¡Ahí tienes tu video, ${name}!*\n🦴 ¡Ese se ve genial!`,
          fileName: json.data.title + ".mp4",
          mimetype: "video/mp4",
          ...(asDocument ? { asDocument: true } : {})
        }, { quoted: m });
        return m.react("📽️");
      }
    } catch (e) {
      console.error(e);
      return conn.reply(m.chat, `❌ *Fallo inesperado:* ${e.message}`, m, { contextInfo });
    }
  }

  const buttons = [
    { buttonId: `${usedPrefix}play audio ${video.url}`, buttonText: { displayText: '🎵 ¡Solo el audio!' }, type: 1 },
    { buttonId: `${usedPrefix}play video ${video.url}`, buttonText: { displayText: '📹 ¡Quiero ver eso!' }, type: 1 }
  ];

  const caption = `
╭───🍖 *¡YOSHI! Encontré esto para ti, ${name}* 🍖───
│🍓 *Título:* ${video.title}
│⏱️ *Duración:* ${video.timestamp}
│👁️ *Vistas:* ${video.views.toLocaleString()}
│🎨 *Autor:* ${video.author.name}
│🗓️ *Publicado:* ${video.ago}
│🔗 *Enlace:* ${video.url}
╰───────────────────────────────`;

  await conn.sendMessage(m.chat, {
    image: { url: video.thumbnail },
    caption,
    footer: '¡Elige lo que quieres, nakama!',
    buttons,
    headerType: 4
  }, { quoted: m });
};

handler.help = ['play'].map(v => v + ' <texto>');
handler.tags = ['descargas'];
handler.command = ['play'];
handler.register = true;

export default handler;
