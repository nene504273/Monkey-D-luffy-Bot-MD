// Importa las librerías necesarias
import fetch from "node-fetch";
import { ogmp3 } from '../lib/youtubedl.js';
import yts from "yt-search";
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Reemplaza 'TU_CLAVE_API' con tu clave real de la API de Nevi.
const NEVI_API_KEY = 'ellen'; // Cambia esto por tu clave real

const SIZE_LIMIT_MB = 100;
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏ𝐭';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender);
  args = args.filter(v => v?.trim());

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

  const isMode = ["audio", "video"].includes(args[0].toLowerCase());
  const queryOrUrl = isMode ? args.slice(1).join(" ") : args.join(" ");
  const isInputUrl = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/.+$/i.test(queryOrUrl);

  let video;

  // Si ya se especifica el modo y el enlace, va directo a la descarga
  if (isMode && isInputUrl) {
    await m.react("📥");
    const mode = args[0].toLowerCase();

    // Función auxiliar para enviar el archivo
    const sendMediaFile = async (downloadUrl, title, currentMode) => {
      try {
        const response = await axios.head(downloadUrl);
        const contentLength = response.headers['content-length'];
        const fileSizeMb = contentLength / (1024 * 1024);

        if (fileSizeMb > SIZE_LIMIT_MB) {
          await conn.sendMessage(m.chat, {
            document: { url: downloadUrl },
            fileName: `${title}.${currentMode === 'audio' ? 'mp3' : 'mp4'}`,
            mimetype: currentMode === 'audio' ? 'audio/mpeg' : 'video/mp4',
            caption: `⚠️ *El archivo es muy grande (${fileSizeMb.toFixed(2)} MB), así que lo envío como documento. Puede tardar más en descargar.*
🖤 *Título:* ${title}`
          }, { quoted: m });
          await m.react("📄");
        } else {
          const mediaOptions = currentMode === 'audio'
            ? { audio: { url: downloadUrl }, mimetype: "audio/mpeg", fileName: `${title}.mp3` }
            : { video: { url: downloadUrl }, caption: `🎬 *¡Ahí tienes tu video, ${name}!*\n🦴 *Título:* ${title}`, fileName: `${title}.mp4`, mimetype: "video/mp4" };

          await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
          await m.react(currentMode === 'audio' ? "🎧" : "📽️");
        }
      } catch (error) {
        console.error("Error al obtener el tamaño del archivo o al enviarlo:", error);
        throw new Error("No se pudo obtener el tamaño del archivo o falló el envío. Se intentará de nuevo.");
      }
    };

    // --- Intento 1: API de Nevi (principal) ---
    try {
      if (!NEVI_API_KEY || NEVI_API_KEY === 'ellen') {
        throw new Error("API Key de Nevi no configurada o es la predeterminada.");
      }

      const neviApiUrl = `http://neviapi.ddns.net:5000/download`;
      const format = mode === "audio" ? "mp3" : "mp4";
      const res = await fetch(neviApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': NEVI_API_KEY,
        },
        body: JSON.stringify({
          url: queryOrUrl,
          format: format
        }),
      });

      const json = await res.json();

      if (json.status === "success" && json.download_link) {
        const titleFromApi = json.title || 'Título Desconocido';
        await sendMediaFile(json.download_link, titleFromApi, mode);
        return;
      }
      throw new Error("NEVI API falló.");
    } catch (e) {
      console.error("Error con NEVI API:", e);

      await conn.reply(m.chat, `💔 *¡Fallé al procesar tu capricho, nakama!*
El servicio principal no está disponible, intentando con un servicio de respaldo...`, m);

      // --- Intento 2: ogmp3 (fallback) ---
      try {
        const tempFilePath = path.join(process.cwd(), './tmp', `${Date.now()}_${mode === 'audio' ? 'audio' : 'video'}.tmp`);
        await m.react("🔃"); 
        const downloadResult = await ogmp3.download(queryOrUrl, tempFilePath, mode);

        if (downloadResult.status && fs.existsSync(tempFilePath)) {
          const stats = fs.statSync(tempFilePath);
          const fileSizeMb = stats.size / (1024 * 1024);

          let mediaOptions;
          const fileBuffer = fs.readFileSync(tempFilePath);

          if (fileSizeMb > SIZE_LIMIT_MB) {
              mediaOptions = {
                  document: fileBuffer,
                  fileName: `${downloadResult.result.title}.${mode === 'audio' ? 'mp3' : 'mp4'}`,
                  mimetype: mode === 'audio' ? 'audio/mpeg' : 'video/mp4',
                  caption: `⚠️ *El archivo es muy grande (${fileSizeMb.toFixed(2)} MB), lo envío como documento. Puede tardar más en descargar.*
🖤 *Título:* ${downloadResult.result.title}`
              };
              await m.react("📄");
          } else {
              mediaOptions = mode === 'audio'
                  ? { audio: fileBuffer, mimetype: 'audio/mpeg', fileName: `${downloadResult.result.title}.mp3` }
                  : { video: fileBuffer, caption: `🎬 *¡Ahí tienes tu video, ${name}!*\n🦴 *Título:* ${downloadResult.result.title}`, fileName: `${downloadResult.result.title}.mp4`, mimetype: 'video/mp4' };
              await m.react(mode === 'audio' ? "🎧" : "📽️");
          }

          await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
          fs.unlinkSync(tempFilePath);
          return;
        }
        throw new Error("ogmp3 no pudo descargar el archivo.");

      } catch (e2) {
        console.error("Error con ogmp3:", e2);

        const tempFilePath = path.join(process.cwd(), './tmp', `${Date.now()}_${mode === 'audio' ? 'audio' : 'video'}.tmp`);
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        await conn.reply(m.chat, `💔 *¡Rayos! No pude traerte nada, ni siquiera con mis puños de goma...*`, m);
        await m.react("❌");
      }
    }
    return;
  }

  // --- Lógica de búsqueda y botones (modo no especificado) ---
  if (isInputUrl) {
    try {
      const urlObj = new URL(queryOrUrl);
      const videoID = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
      const searchResult = await yts({ videoId: videoID });
      video = searchResult.videos?.[0];
    } catch (e) {
      console.error("Error al obtener info de la URL:", e);
      return conn.reply(m.chat, `💔 *Fallé al procesar tu capricho.*
Esa URL me da un dolor de cabeza, ¿estás seguro de que es una URL de YouTube válida?`, m, { contextInfo });
    }
  } else {
    try {
      const searchResult = await yts(queryOrUrl);
      video = searchResult.videos?.[0];
    } catch (e) {
      console.error("Error durante la búsqueda en Youtube:", e);
      return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${queryOrUrl}"`, m, { contextInfo });
    }
  }

  if (!video) {
    return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${queryOrUrl}"`, m, { contextInfo });
  }

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
    headerType: 4,
    contextInfo
  }, { quoted: m });
};

handler.help = ['play'].map(v => v + ' <texto o URL>');
handler.tags = ['descargas'];
handler.command = ['play'];
handler.register = true;
handler.prefix = /^[./#]/;

export default handler;
