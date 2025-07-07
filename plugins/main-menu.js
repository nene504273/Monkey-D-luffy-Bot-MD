import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

const cooldowns = new Map();
const lastMenuSent = new Map();

const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '*Ellen-Joe-Bot-OFICIAL*';
const packname = '˚🄴🄻🄻🄴🄽-🄹🄾🄴-🄱🄾🅃';

let handler = async (m, { conn, usedPrefix }) => {
  // --- NUEVO: Manejo de errores de lectura de DB ---
  let mediaLinks;
  try {
    const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
    const dbRaw = fs.readFileSync(dbPath);
    mediaLinks = JSON.parse(dbRaw).links;
  } catch (e) {
    console.error("Error al leer o parsear src/database/db.json:", e);
    // Si hay un error, envía un mensaje al chat y detiene la ejecución del comando.
    return conn.reply(m.chat, '¡🏴‍☠️ Error al cargar los tesoros del bot! Inténtalo de nuevo más tarde.', m);
  }
  // --- FIN DEL BLOQUE MODIFICADO ---

  if (m.quoted?.id && m.quoted?.fromMe) return;

  const chatId = m.chat;
  const now = Date.now();
  const waitTime = 5 * 60 * 1000;

  const lastUsed = cooldowns.get(chatId) || 0;

  if (now - lastUsed < waitTime) {
    const remainingMs = waitTime - (now - lastUsed);
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    const last = lastMenuSent.get(chatId);
    return await conn.reply(
      chatId,
      `¡Alto ahí, Nakama! 🏴‍☠️ @${m.sender.split('@')[0]} no puedes pedir el menú tan seguido.\nEspera: *${minutes}m ${seconds}s* para zarpar de nuevo.`,
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
    name = 'Capitán';
  }

  const isMain = conn.user.jid === global.conn.user.jid;
  const botNumber = conn.user.jid.split('@')[0];
  const principalNumber = global.conn?.user?.jid?.split('@')[0] || "Desconocido";
  const totalCommands = Object.keys(global.plugins || {}).length;
  const uptime = clockString(process.uptime() * 1000);
  const totalreg = Object.keys(global.db?.data?.users || {}).length;
  const utcTime = moment().utc().format('HH:mm');

  const gifVideo = mediaLinks.video[Math.floor(Math.random() * mediaLinks.video.length)];
  const randomThumbnail = mediaLinks.imagen[Math.floor(Math.random() * mediaLinks.imagen.length)];

  // Emojis con temática de One Piece
  const emojis = {
    'main': '📜',      // Pergamino de comandos
    'tools': '🔧',     // Herramientas de navegación
    'audio': '🎵',     // Binks' Sake
    'group': '🏴‍☠️',     // Bandera pirata (para grupos)
    'owner': '👑',     // Rey Pirata
    'fun': '🎉',       // Fiesta en el barco
    'info': '🧭',      // Brújula de información
    'internet': '🌊',  // Océano de datos
    'downloads': '📥',  // Descargas de tesoros
    'admin': '⚓',     // Ancla (para administradores)
    'anime': '🌟',     // Estrella (para anime)
    'nsfw': '🔞',      // Prohibido para menores
    'search': '🔍',    // Lupa de búsqueda
    'sticker': '🖼️',    // Retrato / Arte
    'game': '🎲',      // Juego de la tripulación
    'premium': '💎',   // Tesoros Premium
    'bot': '🤖'        // Propio bot
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
    const emoji = emojis[tag] || '🗺️'; // Mapa del tesoro para no definidos
    return `*${emoji} ${tag.toUpperCase()}* \n` + cmds.map(cmd => `> ${cmd}`).join('\n');
  }).join('\n\n');

  const header = `
¡Ahoy, ${name}! 🏴‍☠️ Este es el logbook de comandos:
╭─•───────「Ellen-Joe-Bot」───────•
│ 👤 *Navegante*: ${name}
│ 🤖 *Barco*: ${isMain ? 'Thousand Sunny' : `Going Merry | Principal: ${principalNumber}`}
│ 📦 *Bitácora de Comandos*: ${totalCommands}
│ ⏱️ *Tiempo en el Mar*: ${uptime}
│ 🌍 *Hora en Grand Line*: ${utcTime}
│ 👥 *Tripulación*: ${totalreg}
│ 👑 *Rey de los Piratas*: wa.me/${global.owner?.[0]?.[0] || "¡Pronto lo descubriremos!"}
╰─•──────────────────────────•`.trim();

  const finalText = `${header}\n\n${sections}\n\n[⏳] ¡Cuidado, Nakama! Solo puedes revisar este logbook cada 5 minutos por grupo.`;

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
      body: '¡Descubre todos los secretos de Ellen-Joe-Bot!',
      thumbnailUrl: randomThumbnail,
      sourceUrl: 'https://github.com/nevi-dev/Vermeil-bot', 
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
    // Si falla el envío del video, intenta enviar solo texto.
    console.error("¡Parece que el Den Den Mushi tuvo un problema al enviar el mensaje de video del menú:", e);
    sentMsg = await conn.reply(chatId, `¡Ahoy, ${name}!\n\n${finalText}\n\n_Parece que el mensaje con video no pudo ser enviado, pero aquí tienes el logbook._`, m, { contextInfo });
  }

  cooldowns.set(chatId, now);
  lastMenuSent.set(chatId, {
    timestamp: now,
    message: sentMsg
  });
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help'];

export default handler;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}