import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // No se usa en el código proporcionado, pero se mantiene si se necesita en el futuro.
import moment from 'moment-timezone';

const cooldowns = new Map();
const lastMenuSent = new Map();

const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '*🏴‍☠️StrawHat-Bot-OFICIAL🏴‍☠️*'; // Nombre de newsletter al estilo One Piece
const packname = '⚓StrawHat-Crew⚓'; // Packname al estilo One Piece

let handler = async (m, { conn, usedPrefix }) => {
  // --- ¡Alerta de Jolly Roger! Manejo de errores de lectura de DB ---
  let mediaLinks;
  try {
    const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
    const dbRaw = fs.readFileSync(dbPath);
    mediaLinks = JSON.parse(dbRaw).links;
  } catch (e) {
    console.error("¡Ay no! Error al leer o parsear src/database/db.json:", e);
    // Si hay un error, ¡la aventura se detiene aquí!
    return conn.reply(m.chat, '¡Error de mapa! No pude leer la base de datos de los tesoros. ☠️', m);
  }
  // --- ¡Fin del Bloque de Aventuras! ---

  if (m.quoted?.id && m.quoted?.fromMe) return;

  const chatId = m.chat;
  const now = Date.now();
  const waitTime = 5 * 60 * 1000; // ¡5 minutos para que la tripulación descanse!

  const lastUsed = cooldowns.get(chatId) || 0;

  if (now - lastUsed < waitTime) {
    const remainingMs = waitTime - (now - lastUsed);
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    const last = lastMenuSent.get(chatId);
    return await conn.reply(
      chatId,
      `¡Eh, @${m.sender.split('@')[0]}! ¡Todavía no podemos zarpar de nuevo!\nDebes esperar *${minutes}m ${seconds}s* para usar el menú. ¡Paciencia, nakama! 🏴‍☠️`,
      last?.message || m,
      {
        mentions: [m.sender]
      }
    );
  }

  cooldowns.set(chatId, now);

  let name;
  try {
    name = await conn.getName(m.sender);
  } catch {
    name = 'Marino Novato'; // Nombre predeterminado al estilo One Piece
  }

  const isMain = conn.user.jid === global.conn.user.jid;
  const botNumber = conn.user.jid.split('@')[0];
  const principalNumber = global.conn?.user?.jid?.split('@')[0] || "¡Paradero Desconocido!";
  const totalCommands = Object.keys(global.plugins || {}).length;
  const uptime = clockString(process.uptime() * 1000);
  const totalreg = Object.keys(global.db?.data?.users || {}).length;
  const utcTime = moment().utc().format('HH:mm');

  const gifVideo = mediaLinks.video[Math.floor(Math.random() * mediaLinks.video.length)];
  const randomThumbnail = mediaLinks.imagen[Math.floor(Math.random() * mediaLinks.imagen.length)];

  const emojis = {
    'main': '📜', 'tools': '🛠️', 'audio': '🎶', 'group': '🏴‍☠️', // Emojis temáticos
    'owner': '👑', 'fun': '🎉', 'info': '🗺️', 'internet': '🌐',
    'downloads': '⬇️', 'admin': '⚓', 'anime': '🎌', 'nsfw': '🔞',
    'search': '🔍', 'sticker': '🖼️', 'game': '🎲', 'premium': '💎', 'bot': '🤖'
  };

  let groups = {};
  for (let plugin of Object.values(global.plugins || {})) {
    if (!plugin.help || !plugin.tags) continue;
    for (let tag of plugin.tags) {
      if (!groups[tag]) groups[tag] = [];
      for (let help of plugin.help) {
        if (/^\$|^=>|^>/.test(help)) continue;
        groups[tag].push(`${usedPrefix}${help}`);
      }
    }
  }

  for (let tag in groups) {
    groups[tag].sort((a, b) => a.localeCompare(b));
  }

  const sections = Object.entries(groups).map(([tag, cmds]) => {
    const emoji = emojis[tag] || '🗺️'; // Emoji predeterminado si no se encuentra
    return `[${emoji} *${tag.toUpperCase()}*]\n` + cmds.map(cmd => `> ${cmd}`).join('\n');
  }).join('\n\n');

  const header = `
¡Yohoho, ${name}! ¡Este es el Logbook de Comandos!
|----[🧭 El Gran Menú de Luffy 🧭]----•
| 🏴‍☠️ Capitán: ${name}
| 🤖 Bote Pirata: ${isMain ? 'Principal' : `Sub-Bote | Principal: ${principalNumber}`}
| 📜 Comandos del Mapa: ${totalCommands}
| ⏱️ Tiempo en Alta Mar: ${uptime}
| 🌍 Hora del Nuevo Mundo: ${utcTime}
| 👥 Tripulantes: ${totalreg}
| 👑 Rey Pirata: wa.me/${global.owner?.[0]?.[0] || "¡Sin Rumbo Fijo!"}
|-----------------------------------•`.trim(); // Mensaje de bienvenida al estilo One Piece

  const finalText = `${header}\n\n${sections}\n\n[⏳] ¡Cuidado, nakama! Este Logbook solo se puede consultar una vez cada 5 minutos por grupo. ¡No te quedes sin tinta! 🖋️`;

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
      title: packname,
      body: '¡Descubre todos los tesoros de StrawHat-Bot!', // Texto al estilo One Piece
      thumbnailUrl: randomThumbnail,
      sourceUrl: 'https://github.com/nevi-dev/Vermeil-bot', // ¡Puedes cambiar este mapa si quieres!
      mediaType: 1,
      renderLargerThumbnail: true
    }
  };

  let sentMsg;
  try {
    sentMsg = await conn.sendMessage(chatId, {
      video: { url: gifVideo },
      gifPlayback: true,
      caption: finalText,
      contextInfo
    }, { quoted: m });
  } catch (e) {
    // Si la gomu gomu no falla al enviar el video, ¡solo enviamos el pergamino!
    console.error("¡Problemas con el barco! Error al enviar el menú:", e);
    sentMsg = await conn.reply(chatId, finalText, m, { contextInfo });
  }

  cooldowns.set(chatId, now);
  lastMenuSent.set(chatId, {
    timestamp: now,
    message: sentMsg
  });
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help', 'comandos', 'tesoros']; // Comandos adicionales al estilo One Piece

export default handler;

// ¡Aquí está la brújula para el tiempo en alta mar!
function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}