import fetch from "node-fetch";
import yts from "yt-search";
import { yta, ytv } from '../lib/y2mate.js';
import { ogmp3 } from '../lib/youtubedl.js';

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

  const mode = (args[0] || '').toLowerCase();
  const isDownloadMode = mode === 'audio' || mode === 'video';
  const query = isDownloadMode ? args.slice(1).join(" ") : args.join(" ");

  const search = await yts(query);
  const video = search.videos?.[0];

  if (!video) {
    return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${query}"`, m, { contextInfo });
  }

  if (isDownloadMode) {
    // MÉTODO 1: API Principal (Stellar)
    try {
      const apiBase = "https://api.stellarwa.xyz/dow";
      const dlApi = mode === "audio" ? `${apiBase}/ytmp3?url=${encodeURIComponent(video.url)}` : `${apiBase}/ytmp4?url=${encodeURIComponent(video.url)}`;
      const res = await fetch(dlApi);
      const json = await res.json();
      if (!json.status || !json.data?.dl) throw new Error(json.message || 'La API principal no devolvió un enlace válido');
      
      const fileUrl = json.data.dl;
      const fileName = json.data.title;
      if (mode === "audio") {
        await conn.sendMessage(m.chat, { audio: { url: fileUrl }, mimetype: "audio/mpeg", fileName: `${fileName}.mp3`, ptt: false }, { quoted: m });
        return m.react("🎧");
      } else {
        await conn.sendMessage(m.chat, { video: { url: fileUrl }, caption: `📹 *¡Ahí tienes tu video, ${name}!*`, fileName: `${fileName}.mp4`, mimetype: 'video/mp4' }, { quoted: m });
        return m.react("📽️");
      }
    } catch (e) {
      console.error(`Error en Método 1 (Stellar): ${e.message}`);
      await m.reply(`⚠️ *Método 1 (API Principal) falló.*\n*Razón:* ${e.message}\n\nIntentando con el método 2...`);

      // MÉTODO 2: Respaldo (y2mate.js)
      try {
        const downloader = mode === 'audio' ? yta : ytv;
        const result = await downloader(video.url);
        if (!result || !result.link) throw new Error('y2mate no devolvió un enlace válido');

        const fileUrl = result.link;
        const fileName = result.title;
        if (mode === 'audio') {
          await conn.sendMessage(m.chat, { audio: { url: fileUrl }, mimetype: 'audio/mpeg', fileName: `${fileName}.mp3`, ptt: false }, { quoted: m });
          return m.react("🎧");
        } else {
          await conn.sendMessage(m.chat, { video: { url: fileUrl }, caption: `📹 *¡Ahí tienes tu video, ${name}!*`, fileName: `${fileName}.mp4`, mimetype: 'video/mp4' }, { quoted: m });
          return m.react("📽️");
        }
      } catch (err) {
        console.error(`Error en Método 2 (y2mate): ${err.message}`);
        await m.reply(`⚠️ *Método 2 (Respaldo y2mate) falló.*\n*Razón:* ${err.message}\n\nIntentando con el último recurso...`);

        // MÉTODO 3: Último Recurso (ogmp3)
        try {
          const result = await ogmp3.download(video.url, null, mode);
          if (!result.status || !result.result?.download) {
            throw new Error(result.error || 'ogmp3 no devolvió un enlace válido o lanzó un error');
          }

          const fileUrl = result.result.download;
          const fileName = result.result.title;
          if (mode === 'audio') {
            await conn.sendMessage(m.chat, { audio: { url: fileUrl }, mimetype: 'audio/mpeg', fileName: `${fileName}.mp3`, ptt: false }, { quoted: m });
            return m.react("🎧");
          } else {
            await conn.sendMessage(m.chat, { video: { url: fileUrl }, caption: `📹 *¡Ahí tienes tu video, ${name}!*`, fileName: `${fileName}.mp4`, mimetype: 'video/mp4' }, { quoted: m });
            return m.react("📽️");
          }
        } catch (errorFinal) {
          console.error(`Error en Método 3 (ogmp3): ${errorFinal.message}`);
          await conn.reply(m.chat, `❌ *Lo siento, todos los métodos de descarga han fallado.*\n\n*Razón del último fallo:* ${errorFinal.message}`, m, { contextInfo });
        }
      }
    }
    return;
  }

  // --- Presentación de Resultados con Botones ---
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
handler.command = ['play', 'yt'];
handler.register = true;

export default handler;
