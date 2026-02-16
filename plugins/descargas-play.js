// Importa las librerías necesarias
import { ytmp3, ytmp4 } from "../lib/youtubedl.js"; // Tu librería personalizada
import yts from "yt-search";
import fs from "fs";
import { exec } from "child_process";
import { join } from "path";

// --- CONFIGURACIÓN ESTÉTICA (Monkey D. Bot) ---
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏᴛ';

const handler = async (m, { conn, args, usedPrefix, command, text }) => {
  const name = conn.getName(m.sender);
  
  // Contexto del mensaje (Diseño One Piece)
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
      thumbnail: null, // Se llenará dinámicamente si hay búsqueda
      sourceUrl: null,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!text) {
    return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué canción o video estás buscando?\n\nEjemplo:\n${usedPrefix + command} Binks no Sake`, m, { contextInfo });
  }

  // Detectar si el usuario ya eligió modo (audio/video) mediante botones o comando directo
  // Ejemplo: "#play audio <link>"
  const isMode = ["audio", "video"].includes(args[0]?.toLowerCase());
  const queryOrUrl = isMode ? args.slice(1).join(" ") : text;
  
  // Regex para detectar si es un link directo de YouTube
  const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/;
  const isInputUrl = youtubeRegexID.test(queryOrUrl);

  // --- LÓGICA DE DESCARGA (Si ya se especificó audio/video y hay URL) ---
  if (isMode && isInputUrl) {
    await m.react("⏳");
    const mode = args[0].toLowerCase(); // 'audio' o 'video'
    const url = queryOrUrl;

    try {
      // 1. DESCARGA DE AUDIO
      if (mode === 'audio') {
        const r = await ytmp3(url);
        if (!r?.status) throw new Error("Error al procesar audio en la librería.");
        if (!r?.download?.url) throw new Error("Link de audio caído.");

        await conn.sendMessage(m.chat, {
          audio: { url: r.download.url },
          fileName: `${r.metadata.title}.mp3`,
          mimetype: "audio/mpeg",
          ptt: false // Cambia a true si quieres que se envíe como nota de voz
        }, { quoted: m });
        
        await m.react("✅");
      
      // 2. DESCARGA DE VIDEO (Usando FFmpeg como en tu ejemplo)
      } else if (mode === 'video') {
        const r = await ytmp4(url);
        if (!r?.status) throw new Error("Error al procesar video en la librería.");
        if (!r?.download?.url) throw new Error("Link de video caído.");
        
        const videoUrl = r.download.url;
        const title = r.metadata.title || "video";
        
        // Crear carpeta temporal si no existe
        const tmpDir = join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
        
        const fileName = join(tmpDir, `${Date.now()}.mp4`);

        // Procesar con FFmpeg (Copiado de tu ejemplo de referencia)
        await new Promise((resolve, reject) => {
          exec(`ffmpeg -i "${videoUrl}" -c:v copy -c:a aac -movflags +faststart "${fileName}"`, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        if (!fs.existsSync(fileName)) throw new Error("Error interno en FFmpeg");

        await conn.sendMessage(m.chat, {
          video: fs.readFileSync(fileName),
          fileName: `${title}.mp4`,
          caption: `🎬 *${title}*\n🏴‍☠️ _Aquí tienes tu video, nakama._`,
          mimetype: "video/mp4"
        }, { quoted: m });

        // Limpiar archivo temporal
        fs.unlinkSync(fileName);
        await m.react("✅");
      }

    } catch (error) {
      console.error(error);
      await m.react("❌");
      return conn.reply(m.chat, `💔 *¡Rayos!* Ocurrió un error al descargar.\nLogs: ${error.message}`, m);
    }
    return; // Termina aquí si era una descarga directa
  }

  // --- LÓGICA DE BÚSQUEDA (Si no hay modo o no es URL directa) ---
  await m.react("🔍");
  let video;

  try {
    // Si es un link pero sin comando 'audio/video', obtenemos info del ID
    const match = queryOrUrl.match(youtubeRegexID);
    if (match) {
        const s = await yts({ videoId: match[1] });
        video = s;
    } else {
        // Búsqueda normal por texto
        const s = await yts(queryOrUrl);
        video = s.videos[0];
    }
  } catch (e) {
    await m.react("❌");
    return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${queryOrUrl}"`, m);
  }

  if (!video) {
    await m.react("❌");
    return conn.reply(m.chat, `😵 No se encontraron resultados.`, m);
  }

  // Formatear vistas
  const viewsFormatted = formatViews(video.views);

  // Botones para elegir formato
  // Nota: Ajusta la lógica de botones según tu bot (Hydra, Mystic, etc tienen formatos diferentes).
  // Aquí uso un formato genérico visual.
  const caption = `
╭───🍖 *¡YOSHI! Encontré esto, ${name}* 🍖───
│🍓 *Título:* ${video.title}
│⏱️ *Duración:* ${video.timestamp}
│👁️ *Vistas:* ${viewsFormatted}
│🎨 *Autor:* ${video.author.name}
│🗓️ *Publicado:* ${video.ago}
│🔗 *Enlace:* ${video.url}
╰───────────────────────────────

*Responde con el comando para descargar:*
🔊 *Audio:* ${usedPrefix}play audio ${video.url}
🎥 *Video:* ${usedPrefix}play video ${video.url}
`.trim();

  // Actualizar thumbnail en el contexto
  let thumbBuffer = null;
  try {
     const thumbData = await  conn.getFile(video.thumbnail);
     thumbBuffer = thumbData?.data;
  } catch (e) { console.log("Error descargando thumbnail"); }

  contextInfo.externalAdReply.thumbnail = thumbBuffer;
  contextInfo.externalAdReply.mediaUrl = video.url;
  contextInfo.externalAdReply.sourceUrl = video.url;

  await conn.sendMessage(m.chat, {
    text: caption,
    contextInfo: contextInfo
  }, { quoted: m });
  
  await m.react("🏴‍☠️");
};

handler.help = ['play'].map(v => v + ' <texto o URL>');
handler.tags = ['descargas'];
handler.command = ['play', 'play2'];
// handler.register = true; // Descomenta si usas registro

export default handler;

// Función auxiliar para formatear vistas (tomada de tu ejemplo)
function formatViews(views) {
    if (!views) return "No disponible";
    if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k`;
    return views.toString();
}