import fetch from "node-fetch";
import yts from "yt-search";

const CAUSA_API_KEY = 'causa-fa8b103258fb60fe';
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏᴛ';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender);

  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
    externalAdReply: {
      title: '¡El Rey de los Piratas te trae música! 🎶',
      body: `¡Vamos a buscar eso, ${name}!`,
      thumbnailUrl: 'https://i.ibb.co/6R0pM8v/monkey-d-luffy.jpg', 
      sourceUrl: 'https://github.com',
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué canción o video estás buscando?\n\nEjemplo:\n${usedPrefix}play Binks no Sake`, m, { contextInfo });
  }

  const isMode = ["audio", "video"].includes(args[0].toLowerCase());
  const queryOrUrl = isMode ? args.slice(1).join(" ") : args.join(" ");

  // --- Lógica de Descarga (Cuando se presiona el botón) ---
  if (isMode && /youtube\.com|youtu\.be/i.test(queryOrUrl)) {
    const mode = args[0].toLowerCase();
    await m.react("⏳");

    try {
      const apiUrl = `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(queryOrUrl)}&type=${mode}&apikey=${CAUSA_API_KEY}`;
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json.status || !json.data) throw new Error("Error en la API");

      const { title, download } = json.data;
      const downloadUrl = download.url;

      if (mode === 'audio') {
        await conn.sendMessage(m.chat, { 
          audio: { url: downloadUrl }, 
          mimetype: "audio/mp4", // MP4 es más estable para audios de YT en WhatsApp
          fileName: `${title}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: title,
              body: 'Descarga Exitosa ✅',
              mediaType: 2,
              showAdAttribution: true
            }
          }
        }, { quoted: m });
        await m.react("🎧");
      } else {
        await conn.sendMessage(m.chat, { 
          video: { url: downloadUrl }, 
          caption: `🎬 *¡Ahí tienes tu video, ${name}!*\n🦴 *Título:* ${title}`, 
          mimetype: "video/mp4"
        }, { quoted: m });
        await m.react("📽️");
      }
      return;
    } catch (e) {
      console.error(e);
      await m.react("❌");
      return conn.reply(m.chat, `💔 *¡Rayos!* Hubo un problema al obtener el archivo.`, m);
    }
  }

  // --- Lógica de Búsqueda (Mensaje con Botones) ---
  await m.react("🔍");
  try {
    const search = await yts(queryOrUrl);
    const video = search.videos[0];

    if (!video) return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${queryOrUrl}"`, m, { contextInfo });

    const caption = `
╭───🍖 ¡YOSHI! ${name} ───
│🍓 *Título:* ${video.title}
│⏱️ *Duración:* ${video.timestamp}
│👁️ *Vistas:* ${video.views.toLocaleString()}
│🔗 *Link:* ${video.url}
╰───────────────────────────

Selecciona una opción abajo, nakama`;

    const buttons = [
      { buttonId: `${usedPrefix}${command} audio ${video.url}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
      { buttonId: `${usedPrefix}${command} video ${video.url}`, buttonText: { displayText: '📹 Video' }, type: 1 }
    ];

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption,
      footer: '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏᴛ',
      buttons,
      headerType: 4,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `💔 *Error en la búsqueda.*`, m);
  }
};

handler.help = ['play'];
handler.tags = ['descargas'];
handler.command = ['play', 'yt'];
handler.register = true;

export default handler;