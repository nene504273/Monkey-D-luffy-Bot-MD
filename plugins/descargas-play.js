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
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué canción o video estás buscando?\n\nEjemplo:\n${usedPrefix}play Binks no Sake`, m, { contextInfo });
  }

  const isMode = args[0].toLowerCase() === "audio" || args[0].toLowerCase() === "video";
  const queryOrUrl = isMode ? args.slice(1).join(" ") : args.join(" ");

  const isUrl = queryOrUrl.match(/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/.+/);
  let video;
  if (isUrl) {
    const videoId = queryOrUrl.split('v=')[1]?.split('&')[0] || queryOrUrl.split('/').pop();
    video = await yts({ videoId });
  } else {
    const search = await yts(queryOrUrl);
    video = search.videos?.[0];
  }

  if (!video) {
    return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${queryOrUrl}"`, m, { contextInfo });
  }

  if (isMode) {
    const mode = args[0].toLowerCase();
    // --- CÓDIGO CORREGIDO AQUÍ ---
    // Se vuelve a usar la API de vreden.my.id con el parámetro 'url' en minúsculas.
    const endpoint = mode === "audio" ? "ytmp3" : "ytmp4";
    const dlApi = `https://api.vreden.my.id/api/${endpoint}?url=${encodeURIComponent(video.url)}`;

    try {
      await m.react("📥");
      const res = await fetch(dlApi);
      const json = await res.json();

      // Mantenemos el manejo de errores mejorado
      if (!json.result?.download?.url) {
        const errorMessage = json.result?.message || json.message || "La API no devolvió una respuesta exitosa.";
        return conn.reply(m.chat, `❌ *Error descargando ${mode}*\n\n*Respuesta de la API:* \`\`\`${errorMessage}\`\`\``, m, { contextInfo });
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
          ...(asDocument && { asDocument: true })
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

handler.help = ['play'].map(v => v + ' <texto o URL>');
handler.tags = ['descargas'];
handler.command = ['play'];
handler.register = true;

export default handler;
