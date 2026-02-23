import axios from 'axios';
import yts from "yt-search";

const API_BASE = 'https://rest.apicausas.xyz/api/v1/descargas/youtube';
const API_KEY = 'causa-ee5ee31dcfc79da4';

const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '🏴‍☠️ ¡EL PRÓXIMO REY DE LOS PIRATAS! 🍖';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender);
  args = args.filter(v => v?.trim());

const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    },
    externalAdReply: {
      title: '🍖 ¡THOUSAND SUNNY ADVENTURE!',
      body: `¡Oye, ${name}! ¿Estás listo para la aventura?`,
      thumbnail: icons, 
      sourceUrl: redes, 
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(m.chat, `*¡OE, ${name.toUpperCase()}!* 🍖\n¡No pusiste qué buscar! ¡Es como salir al mar sin carne!\n\n🎧 *Ejemplo:* \n${usedPrefix}play *We Are!*`, m, { contextInfo });
  }

  const isMode = ["audio", "video"].includes(args[0].toLowerCase());
  const type = isMode ? args[0].toLowerCase() : null;
  const query = isMode ? args.slice(1).join(" ") : args.join(" ");

  // --- LÓGICA DE DESCARGA (AVENTURA EN EL SERVIDOR) ---
  if (isMode) {
    await m.react(type === 'audio' ? "🎶" : "🎬");
    try {
      const response = await axios.get(`${API_BASE}?url=${encodeURIComponent(query)}&type=${type}&apikey=${API_KEY}`);
      const res = response.data;

      if (res.status && res.data.download.url) {
        const title = res.data.title;
        const downloadUrl = res.data.download.url;

        if (type === 'audio') {
          await conn.sendMessage(m.chat, { 
            audio: { url: downloadUrl }, 
            mimetype: "audio/mpeg", 
            fileName: `${title}.mp3` 
          }, { quoted: m });
          await m.react("🍖");
        } else {
          await conn.sendMessage(m.chat, { 
            video: { url: downloadUrl }, 
            caption: `*¡SHISHISHI!* ¡Aquí tienes tu tesoro! 🏴‍☠️\n\n⚓ *Nombre:* ${title}`, 
            mimetype: "video/mp4" 
          }, { quoted: m });
          await m.react("🏴‍☠️");
        }
      } else {
        throw new Error("¡El tesoro no está aquí!");
      }
      return;
    } catch (error) {
      console.error("Error API Causas:", error.response?.data || error.message);
      await m.react("🛶");
      return conn.reply(m.chat, `*¡GUMU GUMU NO...!* 💢\n¡Hubo un problema con el barco! Inténtalo de nuevo, ¡no te rindas!`, m);
    }
  }

  // --- LÓGICA DE BÚSQUEDA ---
  await m.react("🔭");
  let video;
  try {
    const searchResult = await yts(query);
    video = searchResult.videos?.[0];
  } catch (e) { return conn.reply(m.chat, `*¡Zoro se perdió y yo también!* Error en la búsqueda.`, m); }

  if (!video) return conn.reply(m.chat, `*¡Oye!* ¡No encontré ninguna isla con ese nombre! (Sin resultados)`, m);

  // --- MENÚ CON BOTONES (ESTILO LUFFY) ---
  const buttons = [
    { buttonId: `${usedPrefix}play audio ${video.url}`, buttonText: { displayText: '🎶 ¡MÚSICA, BROOK!' }, type: 1 },
    { buttonId: `${usedPrefix}play video ${video.url}`, buttonText: { displayText: '🎬 ¡VÍDEO, FRANKY!' }, type: 1 }
  ];

  const caption = `
⚓ *¡NUEVO TESORO ENCONTRADO!* ⚓
︶֟፝ᰳ࡛۪۪۪۪۪⏝̣ ͜͝ ۫۫۫۫۫۫︶    ︶֟፝ᰳ࡛۪۪۪۪۪⏝̣ ͜͝ ۫۫۫۫۫۫︶    

> 🍖 *Tesoro:* ${video.title}
> ⏱️ *Duración:* ${video.timestamp}
> 👤 *Navegante:* ${video.author.name}

*— ¡Elige rápido! ¡Huelo carne cocinándose y no quiero que Sanji se la dé a otro!*
🏴‍☠️🌊🏴‍☠️🌊🏴‍☠️🌊🏴‍☠️🌊🏴‍☠️`;

  await conn.sendMessage(m.chat, {
    image: { url: video.thumbnail },
    caption,
    footer: '¡Hacia el Grand Line!',
    buttons,
    headerType: 4,
    contextInfo
  }, { quoted: m });
};

handler.help = ['play'].map(v => v + ' <búsqueda>');
handler.tags = ['descargas'];
handler.command = ['play'];
handler.register = true;

export default handler;