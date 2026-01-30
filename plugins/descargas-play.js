import fetch from "node-fetch";
import yts from "yt-search";

const CAUSA_API_KEY = 'causa-fa8b103258fb60fe';
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏ𝐭';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender);
  
  // Información de contexto para los mensajes
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
      thumbnail: icons, // Asegúrate de que 'icons' esté definido globalmente o cámbialo por una URL
      sourceUrl: redes, // Asegúrate de que 'redes' esté definido globalmente
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué canción o video estás buscando?\n\nEjemplo:\n${usedPrefix}play Binks no Sake`, m, { contextInfo });
  }

  // Detectar si el usuario forzó modo (audio/video) vía botón o comando
  const isMode = ["audio", "video"].includes(args[0].toLowerCase());
  const queryOrUrl = isMode ? args.slice(1).join(" ") : args.join(" ");

  // Si ya tiene el modo y es una URL de YouTube, descargamos directo
  if (isMode && /youtube\.com|youtu\.be/i.test(queryOrUrl)) {
    const mode = args[0].toLowerCase();
    await m.react("⏳");

    try {
      const apiUrl = `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(queryOrUrl)}&type=${mode}&apikey=${CAUSA_API_KEY}`;
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json.status) throw new Error(json.msg || "Error en la API");

      const { title, download } = json.data;
      const downloadUrl = download.url;

      if (mode === 'audio') {
        await conn.sendMessage(m.chat, { 
          audio: { url: downloadUrl }, 
          mimetype: "audio/mpeg", 
          fileName: `${title}.mp3` 
        }, { quoted: m });
        await m.react("🎧");
      } else {
        await conn.sendMessage(m.chat, { 
          video: { url: downloadUrl }, 
          caption: `🎬 *¡Ahí tienes tu video, ${name}!*\n🦴 *Título:* ${title}`, 
          mimetype: "video/mp4",
          fileName: `${title}.mp4`
        }, { quoted: m });
        await m.react("📽️");
      }
      return;
    } catch (e) {
      console.error(e);
      return conn.reply(m.chat, `💔 *¡Rayos!* Hubo un problema al descargar el archivo.`, m);
    }
  }

  // --- Lógica de Búsqueda ---
  await m.react("🔍");
  try {
    const search = await yts(queryOrUrl);
    const video = search.videos[0];

    if (!video) return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${queryOrUrl}"`, m, { contextInfo });

    const caption = `
╭───🍖 *¡YOSHI! Encontré esto para ti, ${name}* ───
│🍓 *Título:* ${video.title}
│⏱️ *Duración:* ${video.timestamp}
│👁️ *Vistas:* ${video.views.toLocaleString()}
│🎨 *Autor:* ${video.author.name}
│🔗 *Enlace:* ${video.url}
╰───────────────────────────────`;

    // Botones para elegir formato
    const buttons = [
      { buttonId: `${usedPrefix}${command} audio ${video.url}`, buttonText: { displayText: '🎵 Solo Audio' }, type: 1 },
      { buttonId: `${usedPrefix}${command} video ${video.url}`, buttonText: { displayText: '📹 Video' }, type: 1 }
    ];

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail }, // La API y yts dan la miniatura lista
      caption,
      footer: '¡Elige lo que quieres, nakama!',
      buttons,
      headerType: 4,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `💔 *Error en la búsqueda.*`, m);
  }
};

handler.help = ['play'].map(v => v + ' <texto o URL>');
handler.tags = ['descargas'];
handler.command = ['play', 'yt'];
handler.register = true;

export default handler;
