import fetch from "node-fetch";
import yts from "yt-search";

const CAUSA_API_KEY = 'causa-fa8b103258fb60fe';
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏᴛ';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender);
  
  // 1. Validación de entrada
  if (!args[0]) {
    return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué canción o video buscas?\n\n*Ejemplo:* ${usedPrefix + command} Binks no Sake`, m);
  }

  const isMode = ["audio", "video"].includes(args[0].toLowerCase());
  const query = isMode ? args.slice(1).join(" ") : args.join(" ");

  // 2. Definir contexto visual (Se puede mejorar con URLs reales)
  const contextInfo = {
    mentionedJid: [m.sender],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
    externalAdReply: {
      title: '🏴‍☠️ HUB DE DESCARGAS - ONE PIECE',
      body: 'Reproduciendo tesoros musicales...',
      thumbnailUrl: 'https://i.ibb.co/6R0pM8v/monkey-d-luffy.jpg', 
      sourceUrl: 'https://github.com/tu-repo',
      mediaType: 1,
      showAdAttribution: true
    }
  };

  try {
    // 3. Lógica de descarga directa si es URL + Modo
    if (isMode && /youtube\.com|youtu\.be/i.test(query)) {
      await m.react("⏳");
      const mode = args[0].toLowerCase();
      
      const res = await fetch(`https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(query)}&type=${mode}&apikey=${CAUSA_API_KEY}`);
      const json = await res.json();

      if (!json.status || !json.data) throw new Error("API_ERROR");

      const { title, download, filesize } = json.data;
      
      // Validación de tamaño (Límite 50MB para evitar errores de Buffer)
      if (parseInt(filesize) > 50000) {
        return conn.reply(m.chat, `📁 *El archivo es demasiado pesado (${filesize} KB).* No puedo enviarlo por aquí, nakama.`, m);
      }

      if (mode === 'audio') {
        await conn.sendMessage(m.chat, { 
          audio: { url: download.url }, 
          mimetype: 'audio/mp4', 
          fileName: `${title}.mp3` 
        }, { quoted: m });
        await m.react("🎧");
      } else {
        await conn.sendMessage(m.chat, { 
          video: { url: download.url }, 
          caption: `✅ *Aquí tienes:* ${title}\n⚓ *Peso:* ${filesize} KB`,
          mimetype: 'video/mp4'
        }, { quoted: m });
        await m.react("📽️");
      }
      return;
    }

    // 4. Lógica de búsqueda (Si no hay modo o es solo texto)
    await m.react("🔍");
    const search = await yts(query);
    const v = search.videos[0];

    if (!v) return conn.reply(m.chat, `😵 No encontré nada para: "${query}"`, m);

    const txt = `✨ *RESULTADOS PARA:* ${v.title}\n\n` +
                `⚓ *Autor:* ${v.author.name}\n` +
                `⏱️ *Duración:* ${v.timestamp}\n` +
                `📅 *Subido:* ${v.ago}\n` +
                `🔗 *Link:* ${v.url}\n\n` +
                `> *Escribe:* _${usedPrefix + command} audio ${v.url}_ para música.\n` +
                `> *Escribe:* _${usedPrefix + command} video ${v.url}_ para video.`;

    // Enviamos la miniatura con la info y botones
    await conn.sendMessage(m.chat, {
      image: { url: v.thumbnail },
      caption: txt,
      footer: '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏᴛ',
      buttons: [
        { buttonId: `${usedPrefix + command} audio ${v.url}`, buttonText: { displayText: '🎵 AUDIO' }, type: 1 },
        { buttonId: `${usedPrefix + command} video ${v.url}`, buttonText: { displayText: '📹 VIDEO' }, type: 1 }
      ],
      headerType: 4,
      contextInfo
    }, { quoted: m });

  } catch (error) {
    console.error("DEBUG_ERROR:", error);
    await m.react("❌");
    conn.reply(m.chat, `🛠️ *ERROR CRÍTICO*\n\nEl servicio de descarga falló. Inténtalo de nuevo en unos minutos.`, m);
  }
};

handler.help = ['play <búsqueda>'];
handler.tags = ['descargas'];
handler.command = /^(play|yt|musica)$/i;
handler.register = true;

export default handler;