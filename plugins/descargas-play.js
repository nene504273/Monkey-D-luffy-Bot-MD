import fetch from "node-fetch"; // Necesario para la API principal
import { ogmp3 } from '../lib/youtubedl.js'; // Importando tu librería de respaldo
import yts from "yt-search";
import axios from 'axios'; // Necesario para la librería y la comprobación de tamaño

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
      thumbnail: icons, // Asegúrate de que la variable 'icons' esté definida globalmente
      sourceUrl: redes, // Asegúrate de que la variable 'redes' esté definida globalmente
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

    // --- Función auxiliar para enviar el medio y no repetir código ---
    const sendMediaFile = async (downloadUrl, title) => {
      if (mode === "audio") {
        await conn.sendMessage(m.chat, {
          audio: { url: downloadUrl },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
        }, { quoted: m });
        await m.react("🎧");
      } else {
        const headRes = await axios.head(downloadUrl);
        const fileSize = parseInt(headRes.headers['content-length'] || "0") / (1024 * 1024);
        const asDocument = fileSize > SIZE_LIMIT_MB;
        await conn.sendMessage(m.chat, {
          video: { url: downloadUrl },
          caption: `📹 *¡Ahí tienes tu video, ${name}!*\n🦴 *Título:* ${title}`,
          fileName: `${title}.mp4`,
          mimetype: "video/mp4",
          ...(asDocument && { asDocument: true })
        }, { quoted: m });
        await m.react("📽️");
      }
    };


    // --- Intento 1: API Principal (api.vreden.my.id) ---
    try {
      const endpoint = mode === "audio" ? "ytmp3" : "ytmp4";
      const dlApi = `https://api.vreden.my.id/api/${endpoint}?url=${encodeURIComponent(video.url)}`;
      const res = await fetch(dlApi);
      const json = await res.json();
      if (json.status === 200 && json.result?.download?.url) {
        console.log("Descarga exitosa con la API principal.");
        await sendMediaFile(json.result.download.url, json.result.metadata.title || video.title);
        return; // Termina la ejecución si tuvo éxito
      }
      throw new Error("La API principal no devolvió un enlace válido.");
    } catch (e) {
      console.log(`Fallo de la API principal: ${e.message}. Intentando con el método de respaldo (ogmp3)...`);
    }

    // --- Intento 2: Fallback con ogmp3 ---
    try {
      const downloadResult = await ogmp3.download(video.url, null, mode);
      if (downloadResult.status && downloadResult.result?.download) {
        console.log("Descarga exitosa con el método de respaldo (ogmp3).");
        await sendMediaFile(downloadResult.result.download, downloadResult.result.title);
        return; // Termina la ejecución si tuvo éxito
      }
      throw new Error("El método de respaldo (ogmp3) tampoco funcionó.");
    } catch (e) {
      console.error(`Ambos métodos de descarga fallaron: ${e.message}`);
      return m.react("❌"); // Si ambos fallan, reacciona y termina
    }
  }

  // El menú de botones interactivo se mantiene sin cambios
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

handler.help = ['play'].map(v => v + ' <texto o URL>');
handler.tags = ['descargas'];
handler.command = ['play'];
handler.register = true;

export default handler;
