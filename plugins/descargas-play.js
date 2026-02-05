import fetch from "node-fetch";
import yts from "yt-search";

const CAUSA_API_KEY = 'causa-f8289f3a4ffa44bb';
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏᴛ';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender);

  // Información de contexto
  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
    externalAdReply: {
      title: '¡El Rey de los Piratas te trae música! 🎶',
      body: `¡Vamos a buscar eso, ${name}!`,
      thumbnailUrl: 'https://telegra.ph/file/0c91039864d4b8f5d07f3.jpg', // Ajusta esto
      sourceUrl: 'https://github.com', // Ajusta esto
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué buscas?\n\nEjemplo:\n${usedPrefix}play Binks no Sake`, m, { contextInfo });
  }

  const isMode = ["audio", "video"].includes(args[0].toLowerCase());
  const queryOrUrl = isMode ? args.slice(1).join(" ") : args.join(" ");

  // --- LÓGICA DE DESCARGA DIRECTA ---
  if (isMode && /youtube\.com|youtu\.be/i.test(queryOrUrl)) {
    const mode = args[0].toLowerCase();
    await m.react("⏳");

    try {
      const apiUrl = `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(queryOrUrl)}&type=${mode}&apikey=${CAUSA_API_KEY}`;
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json.status || !json.data) throw new Error("La API no devolvió datos válidos.");

      const { title, download } = json.data;
      const downloadUrl = download.url;

      if (mode === 'audio') {
        // Enviar como audio (se puede cambiar a document si falla)
        await conn.sendMessage(m.chat, { 
          audio: { url: downloadUrl }, 
          mimetype: "audio/mp4", // MP4 es más compatible para audios de YT
          fileName: `${title}.mp3`,
          ptt: false // Cambia a true si quieres que sea nota de voz
        }, { quoted: m });
        await m.react("🎧");
      } else {
        await conn.sendMessage(m.chat, { 
          video: { url: downloadUrl }, 
          caption: `🎬 *Título:* ${title}`, 
          mimetype: "video/mp4"
        }, { quoted: m });
        await m.react("📽️");
      }
      return;
    } catch (e) {
      console.error("Error en descarga:", e);
      await m.react("❌");
      return conn.reply(m.chat, `💔 *¡Rayos!* Hubo un problema al procesar el audio. Puede que el servidor esté saturado.`, m);
    }
  }

  // --- LÓGICA DE BÚSQUEDA ---
  await m.react("🔍");
  try {
    const search = await yts(queryOrUrl);
    const video = search.videos[0];

    if (!video) return conn.reply(m.chat, `😵 No encontré nada con: "${queryOrUrl}"`, m);

    const caption = `
╭───🍖 *¡YOSHI! ${name}* ───
│🍓 *Título:* ${video.title}
│⏱️ *Duración:* ${video.timestamp}
│👁️ *Vistas:* ${video.views.toLocaleString()}
│🔗 *Link:* ${video.url}
╰───────────────────────────`;

    // IMPORTANTE: Los botones interactivos de WhatsApp Business API fallan en muchos mods/versiones.
    // Si no funcionan, usa un mensaje de texto normal con las opciones.
    const buttons = [
      { buttonId: `${usedPrefix}${command} audio ${video.url}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
      { buttonId: `${usedPrefix}${command} video ${video.url}`, buttonText: { displayText: '📹 Video' }, type: 1 }
    ];

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption,
      footer: 'Selecciona una opción abajo, nakama',
      buttons,
      headerType: 4,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error("Error en búsqueda:", e);
    conn.reply(m.chat, `💔 Error en la búsqueda.`, m);
  }
};

handler.help = ['play <texto>'];
handler.tags = ['descargas'];
handler.command = ['play', 'yt'];
handler.register = true;

export default handler;