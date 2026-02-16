// Importa las librerías necesarias
import fetch from "node-fetch";
import { ogmp3 } from '../lib/youtubedl.js';
import yts from "yt-search";
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';
import os from 'os';
import fs from 'fs';

// --- CONFIGURACIÓN DE APIs ---
const APICAUSAS_KEY = 'causa-f8289f3a4ffa44bb'; 
const NEVI_API_KEY = 'luffy'; 

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
      thumbnail: icons, // Asegúrate que 'icons' esté definido en tu proyecto
      sourceUrl: redes, // Asegúrate que 'redes' esté definido en tu proyecto
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

  // --- LÓGICA DE DESCARGA DIRECTA ---
  if (isMode && isInputUrl) {
    await m.react("📥");
    const mode = args[0].toLowerCase();
    const typeApi = mode === 'audio' ? 'audio' : 'video';

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
        console.error("Error al enviar el archivo:", error);
        throw new Error("Fallo en el envío.");
      }
    };

    // --- INTENTO 1: API APICAUSAS (Principal) ---
    try {
      const apiCausasUrl = `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(queryOrUrl)}&type=${typeApi}&apikey=${APICAUSAS_KEY}`;
      const res = await fetch(apiCausasUrl);
      const json = await res.json();

      if (json.status && json.result?.url_download) {
        await sendMediaFile(json.result.url_download, json.result.title || 'YouTube Media', mode);
        return;
      }
      throw new Error("API Causas falló.");
    } catch (e) {
      console.error("Error con API Causas, probando Nevi...");

      // --- INTENTO 2: API de Nevi (Respaldo 1) ---
      try {
        const neviApiUrl = `http://neviapi.ddns.net:5000/download`;
        const format = mode === "audio" ? "mp3" : "mp4";
        const res = await fetch(neviApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-KEY': NEVI_API_KEY },
          body: JSON.stringify({ url: queryOrUrl, format: format }),
        });

        const json = await res.json();
        if (json.status === "success" && json.download_link) {
          await sendMediaFile(json.download_link, json.title || 'Título Desconocido', mode);
          return;
        }
        throw new Error("NEVI API falló.");
      } catch (errNevi) {
        console.error("Error con NEVI API, probando ogmp3...");

        // --- INTENTO 3: ogmp3 (Respaldo final) ---
        try {
          const tempFilePath = path.join(process.cwd(), './tmp', `${Date.now()}_${mode}.tmp`);
          await m.react("🔃"); 
          const downloadResult = await ogmp3.download(queryOrUrl, tempFilePath, mode);

          if (downloadResult.status && fs.existsSync(tempFilePath)) {
            const stats = fs.statSync(tempFilePath);
            const fileSizeMb = stats.size / (1024 * 1024);
            const fileBuffer = fs.readFileSync(tempFilePath);

            if (fileSizeMb > SIZE_LIMIT_MB) {
                await conn.sendMessage(m.chat, {
                    document: fileBuffer,
                    fileName: `${downloadResult.result.title}.${mode === 'audio' ? 'mp3' : 'mp4'}`,
                    mimetype: mode === 'audio' ? 'audio/mpeg' : 'video/mp4',
                    caption: `⚠️ *Archivo grande (${fileSizeMb.toFixed(2)} MB)*\n🖤 *Título:* ${downloadResult.result.title}`
                }, { quoted: m });
            } else {
                const mediaOptions = mode === 'audio'
                    ? { audio: fileBuffer, mimetype: 'audio/mpeg', fileName: `${downloadResult.result.title}.mp3` }
                    : { video: fileBuffer, caption: `🎬 *¡Ahí tienes, ${name}!*\n🦴 *Título:* ${downloadResult.result.title}`, mimetype: 'video/mp4' };
                await conn.sendMessage(m.chat, mediaOptions, { quoted: m });
            }
            fs.unlinkSync(tempFilePath);
            await m.react(mode === 'audio' ? "🎧" : "📽️");
            return;
          }
        } catch (eFinal) {
          await conn.reply(m.chat, `💔 *¡Rayos! No pude traerte nada, ni siquiera con mis puños de goma...*`, m);
          await m.react("❌");
        }
      }
    }
    return;
  }

  // --- LÓGICA DE BÚSQUEDA Y BOTONES ---
  if (isInputUrl) {
    try {
      const urlObj = new URL(queryOrUrl);
      const videoID = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
      const searchResult = await yts({ videoId: videoID });
      video = searchResult;
    } catch (e) {
      return conn.reply(m.chat, `💔 URL inválida.`, m, { contextInfo });
    }
  } else {
    try {
      const searchResult = await yts(queryOrUrl);
      video = searchResult.videos?.[0];
    } catch (e) {
      return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${queryOrUrl}"`, m, { contextInfo });
    }
  }

  if (!video) return conn.reply(m.chat, `😵 No se encontraron resultados para: "${queryOrUrl}"`, m, { contextInfo });

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