import fetch from "node-fetch";
import yts from "yt-search";
// 1. IMPORTAMOS LAS NUEVAS FUNCIONES DESDE TU ARCHIVO
import { yta, ytv } from '../lib/y2mate.js';

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

  // --- SECCIÓN DE DESCARGA MODIFICADA ---
  if (isMode) {
    // --- MÉTODO 1: API Principal (Stellar) ---
    try {
      const apiBase = "https://api.stellarwa.xyz/dow";
      const dlApi = isMode === "audio"
        ? `${apiBase}/ytmp3?url=${encodeURIComponent(video.url)}`
        : `${apiBase}/ytmp4?url=${encodeURIComponent(video.url)}`;

      const res = await fetch(dlApi);
      const json = await res.json();

      // Si la API principal falla, lanzamos un error para activar el `catch`
      if (!json.status || !json.data?.dl) {
        throw new Error(json.message || 'No se recibió un enlace válido de la API principal');
      }

      const fileSize = isMode === "video"
        ? parseInt((await fetch(json.data.dl, { method: "HEAD" })).headers.get("content-length") || "0") / (1024 * 1024)
        : 0;
      const asDocument = fileSize > SIZE_LIMIT_MB;

      if (isMode === "audio") {
        await conn.sendMessage(m.chat, { audio: { url: json.data.dl }, mimetype: "audio/mpeg", fileName: json.data.title + ".mp3" }, { quoted: m });
        return m.react("🎧");
      } else {
        await conn.sendMessage(m.chat, { video: { url: json.data.dl }, caption: `📹 *¡Ahí tienes tu video, ${name}!*`, fileName: json.data.title + ".mp4", mimetype: "video/mp4", ...(asDocument ? { asDocument: true } : {}) }, { quoted: m });
        return m.react("📽️");
      }
    } catch (e) {
      // Si el MÉTODO 1 falla, se ejecuta este bloque
      console.error(`Error en el método principal: ${e.message}`);
      await conn.reply(m.chat, `⚠️ *El primer método de descarga falló.*\n\nIntentando con el método de respaldo...`, m);

      // --- MÉTODO 2: Respaldo (y2mate.js) ---
      try {
        const downloader = isMode === 'audio' ? yta : ytv;
        const result = await downloader(video.url);

        if (!result || !result.link) {
          throw new Error('No se pudo obtener un enlace de descarga del método de respaldo.');
        }

        if (isMode === 'audio') {
          await conn.sendMessage(m.chat, { audio: { url: result.link }, mimetype: 'audio/mpeg', fileName: `${result.title}.mp3` }, { quoted: m });
          return m.react("🎧");
        } else {
          await conn.sendMessage(m.chat, { video: { url: result.link }, caption: `📹 *¡Ahí tienes tu video, ${name}!*`, fileName: `${result.title}.mp4`, mimetype: 'video/mp4' }, { quoted: m });
          return m.react("📽️");
        }
      } catch (err) {
        // Si el MÉTODO 2 también falla, se notifica el error final
        console.error(`Error en el método de respaldo: ${err.message}`);
        await conn.reply(m.chat, `❌ *Lo siento, ambos métodos de descarga han fallado.*\n\n*Razón del último fallo:* ${err.message}`, m, { contextInfo });
      }
    }
    return; // Finaliza la ejecución si estaba en modo descarga
  }

  // --- Lógica para mostrar los botones (sin cambios) ---
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
