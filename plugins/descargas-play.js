import fetch from "node-fetch";
import yts from "yt-search";

// NOTA: Asegúrate de que las variables 'icons' y 'redes' estén definidas
// en tu proyecto para que el thumbnail y el enlace del bot funcionen. Por ejemplo:
// const icons = 'https://ejemplo.com/tu-imagen.jpg';
// const redes = 'https://github.com/tu-usuario';

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
      thumbnail: icons, // Usará la variable 'icons' que debes definir
      sourceUrl: redes, // Usará la variable 'redes' que debes definir
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué canción o video estás buscando?\n\nEjemplo:\n${usedPrefix}play Binks no Sake`, m, { contextInfo });
  }

  // Determina si se pide audio/video y cuál es la búsqueda (texto o URL)
  const isMode = args[0].toLowerCase() === "audio" || args[0].toLowerCase() === "video";
  const queryOrUrl = isMode ? args.slice(1).join(" ") : args.join(" ");

  // Si el input es una URL de YouTube, la usa directamente, si no, la busca
  const isUrl = queryOrUrl.match(/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/.+/);
  let video;
  if (isUrl) {
    // Extrae el ID del video desde la URL y busca con yts
    const videoId = queryOrUrl.split('v=')[1]?.split('&')[0] || queryOrUrl.split('/').pop();
    video = await yts({ videoId });
  } else {
    // Busca por texto si no es una URL
    const search = await yts(queryOrUrl);
    video = search.videos?.[0];
  }

  if (!video) {
    return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${queryOrUrl}"`, m, { contextInfo });
  }

  // --- Lógica de descarga directa usando la API api.vreden.my.id ---
  if (isMode) {
    const mode = args[0].toLowerCase();
    const endpoint = mode === "audio" ? "ytmp3" : "ytmp4";
    const dlApi = `https://api.vreden.my.id/api/${endpoint}?URL=${encodeURIComponent(video.url)}`;

    try {
      await m.react("📥"); // Reacciona para indicar que la descarga comenzó
      const res = await fetch(dlApi);
      const json = await res.json();

      if (!json.result || !json.result.download || !json.result.download.url) {
        return conn.reply(m.chat, `❌ *Error descargando ${mode}:* La API no devolvió un enlace válido.`, m, { contextInfo });
      }
      
      const downloadUrl = json.result.download.url;
      const title = json.result.metadata.title || video.title;

      if (mode === "audio") {
        await conn.sendMessage(m.chat, {
          audio: { url: downloadUrl },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          ptt: false
        }, { quoted: m });
        return m.react("🎧");
      } else { // mode === "video"
        const headRes = await fetch(downloadUrl, { method: "HEAD" });
        const fileSize = parseInt(headRes.headers.get("content-length") || "0") / (1024 * 1024);
        const asDocument = fileSize > SIZE_LIMIT_MB;

        await conn.sendMessage(m.chat, {
          video: { url: downloadUrl },
          caption: `📹 *¡Ahí tienes tu video, ${name}!*\n🦴 *Título:* ${title}`,
          fileName: `${title}.mp4`,
          mimetype: "video/mp4",
          ...(asDocument && { asDocument: true }) // Envía como documento si supera el límite
        }, { quoted: m });
        return m.react("📽️");
      }
    } catch (e) {
      console.error(e);
      return conn.reply(m.chat, `❌ *Fallo inesperado:* ${e.message}`, m, { contextInfo });
    }
  }

  // --- Menú interactivo si no se especifica modo ---
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
