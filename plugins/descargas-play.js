import fetch from "node-fetch";
import { ogmp3 } from '../lib/youtubedl.js';
import yts from "yt-search";
import axios from 'axios';

const SIZE_LIMIT_MB = 100;
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧𝐤𝐞y 𝐃 𝐁ᴏ𝐭';

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
      thumbnail: global.icons || 'https://i.imgur.com/JP52fdP.jpg',
      sourceUrl: global.redes || 'https://www.youtube.com/',
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué canción o video estás buscando?\n\nEjemplo:\n${usedPrefix}play Binks no Sake`, m, { contextInfo });
  }

  const isMode = args[0].toLowerCase() === "audio" || args[0].toLowerCase() === "video";
  const queryOrUrl = isMode ? args.slice(1).join(" ") : args.join(" ");

  const search = await yts(queryOrUrl);
  const video = search.videos?.[0];

  if (!video) {
    return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${queryOrUrl}"`, m, { contextInfo });
  }

  if (isMode) {
    const mode = args[0].toLowerCase();
    await m.react("📥");

    // Función auxiliar con verificación de tipo MIME
    const sendMediaFile = async (downloadUrl, title) => {
      try {
        const head = await axios.head(downloadUrl);
        const mime = head.headers['content-type'] || '';
        const sizeMB = parseInt(head.headers['content-length'] || "0") / (1024 * 1024);

        if (mode === "audio" && !mime.includes("audio")) {
          throw new Error('La URL no apunta a un archivo de audio válido.');
        }
        if (mode === "video" && !mime.includes("video")) {
          throw new Error('La URL no apunta a un archivo de video válido.');
        }

        const fileOptions = {
          mimetype: mode === "audio" ? "audio/mpeg" : "video/mp4",
          fileName: `${title}.${mode === "audio" ? "mp3" : "mp4"}`,
          ...(mode === "video" && sizeMB > SIZE_LIMIT_MB && { asDocument: true })
        };

        await conn.sendMessage(m.chat, {
          [mode]: { url: downloadUrl },
          ...(mode === "video" ? { caption: `📹 *¡Ahí tienes tu video, ${name}!*\n🦴 *Título:* ${title}` } : {}),
          ...fileOptions
        }, { quoted: m });

        await m.react(mode === "audio" ? "🎧" : "📽️");

      } catch (err) {
        console.error(`❌ Error al enviar ${mode}:`, err.message);
        return m.reply(`❌ Error al procesar el ${mode}. El archivo podría no ser válido o estar caído.`);
      }
    };

    // --- Intento 1: API principal ---
    try {
      const endpoint = mode === "audio" ? "ytmp3" : "ytmp4";
      const dlApi = `https://api.vreden.my.id/api/${endpoint}?url=${encodeURIComponent(video.url)}`;
      const res = await fetch(dlApi);
      const json = await res.json();

      if (json.status === 200 && json.result?.download?.url) {
        console.log("✅ Descarga desde API principal exitosa.");
        await sendMediaFile(json.result.download.url, json.result.metadata.title || video.title);
        return;
      }

      throw new Error("Respuesta inválida de la API principal.");
    } catch (e) {
      console.warn("⚠️ Fallback a ogmp3: ", e.message);
    }

    // --- Intento 2: ogmp3 ---
    try {
      const downloadResult = await ogmp3.download(video.url, null, mode);
      if (downloadResult.status && downloadResult.result?.download) {
        console.log("✅ Descarga desde ogmp3 exitosa.");
        await sendMediaFile(downloadResult.result.download, downloadResult.result.title);
        return;
      }
      throw new Error("ogmp3 falló.");
    } catch (e) {
      console.error("❌ Todos los métodos de descarga fallaron:", e.message);
      return m.react("❌");
    }
  }

  // --- Botones interactivos (modo no especificado) ---
  let thumbnail = video.thumbnail;
  try {
    const head = await axios.head(thumbnail);
    if (!head.headers['content-type'].startsWith('image/')) throw new Error();
  } catch {
    thumbnail = 'https://i.imgur.com/JP52fdP.jpg';
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
    image: { url: thumbnail },
    caption,
    footer: '¡Elige lo que quieres, nakama!',
    buttons,
    headerType: 4
  }, { quoted: m });
};

handler.help = ['play'].map(v => v + ' <texto o URL>');
handler.tags = ['descargas'];
handler.command = ['play'];
handler.register = true;

export default handler;