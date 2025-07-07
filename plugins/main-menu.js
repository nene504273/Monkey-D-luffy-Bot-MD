import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

const cooldowns = new Map();
const lastMenuSent = new Map();

// --- Información de One Piece para el menú ---
const newsletterJid = '120363418071540900@newsletter'; // ¡Mantén este si es necesario!
const newsletterName = '*¡SOMBREROS DE PAJA UNIDOS!* 🏴‍☠️';
const packname = '🏴‍☠️ Gomu Gomu No Bot 🏴‍☠️'; // ¡Nombre del bot al estilo Luffy!

let handler = async (m, { conn, usedPrefix }) => {
  // --- Manejo de errores de lectura de DB ---
  let mediaLinks;
  try {
    const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
    const dbRaw = fs.readFileSync(dbPath);
    mediaLinks = JSON.parse(dbRaw).links;
  } catch (e) {
    console.error("¡Error al zarpar! No se pudo leer src/database/db.json:", e);
    return conn.reply(m.chat, '¡Shishishi! Parece que el Log Pose no funciona. No pude leer la base de datos.', m);
  }

  if (m.quoted?.id && m.quoted?.fromMe) return;

  const chatId = m.chat;
  const now = Date.now();
  const waitTime = 5 * 60 * 1000; // 5 minutos, ¡como un descanso en el Grand Line!

  const lastUsed = cooldowns.get(chatId) || 0;

  if (now - lastUsed < waitTime) {
    const remainingMs = waitTime - (now - lastUsed);
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    const last = lastMenuSent.get(chatId);
    return await conn.reply(
      chatId,
      `@${m.sender.split('@')[0]} ¡Espera, aún no es hora de otro banquete! 🍖\nPodrás ver el menú de nuevo en: *${minutes}m ${seconds}s*`,
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
    name = 'Nakama'; // ¡Si no tiene nombre, es un nakama!
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

  // --- Emojis temáticos de One Piece ---
  const emojis = {
    'main': '🏴‍☠️', // Bandera pirata
    'tools': '🔧', // Herramientas de Franky
    'audio': '🎵', // Música de Brook
    'group': '🤝', // Lazos de nakamas
    'owner': '👑', // Rey de los Piratas
    'fun': '🤣', // Risa de Luffy
    'info': '🗺️', // Mapa de Nami
    'internet': '🌐', // Red del mundo
    'downloads': '📥', // Descargas de tesoros
    'admin': '⚙️', // Engranajes de una nave
    'anime': '🌟', // Estrellas de los sueños
    'nsfw': '🔞', // ¡Contenido solo para piratas mayores de edad!
    'search': '🔎', // Búsqueda del One Piece
    'sticker': '🎨', // Dibujos de Usopp
    'game': '🎲', // Juegos en la cubierta
    'premium': '💎', // Joyas valiosas
    'bot': '🤖'  // Bot pirata
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
    const emoji = emojis[tag] || '⚓'; // Ancla si no hay emoji específico
    return `*${emoji} ${tag.toUpperCase()}* ⚔️\n` + cmds.map(cmd => `» ${cmd}`).join('\n'); // Diseño de lista pirata
  }).join('\n\n');

  // --- Encabezado con detalles y temática de Luffy ---
  const header = `
¡Ahoy, *${name}*! 👋 Este es tu Log Pose de Comandos:
╭─────────────────────────╮
│ 🍖 *Capitán:* ${name}
│ 🏴‍☠️ *Gomu Gomu No Bot:* ${isMain ? '¡El Rey de los Piratas!' : `¡Navegante Secundario! | Rey Principal: ${principalNumber}`}
│ ✨ *Tesoro de Comandos:* ${totalCommands}
│ ⏳ *Viaje Activo:* ${uptime}
│ ⏰ *Hora en Grand Line:* ${utcTime}
│ 🗺️ *Nakamas Registrados:* ${totalreg}
│ 👑 *Nuestro Yonko:* wa.me/${global.owner?.[0]?.[0] || "¡Desconocido!"}
╰─────────────────────────╯
`.trim();

  const finalText = `${header}\n\n${sections}\n\n¡Al ataque! 🌊 Este menú se actualiza cada *5 minutos*. ¡A por el One Piece! 👒`;

  // --- ContextInfo con temática pirata ---
  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999, // ¡Máxima puntuación de aventura!
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    },
    externalAdReply: {
      title: packname,
      body: '¡Zarpa con el Gomu Gomu No Bot!', // Mensaje pirata
      thumbnailUrl: randomThumbnail,
      sourceUrl: 'https://github.com/nevi-dev/Vermeil-bot', // ¡Puedes cambiar este enlace por el tuyo!
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
    console.error("¡Error en la travesía! No se pudo enviar el mapa del tesoro:", e);
    // Si falla el envío del video, intenta enviar solo texto con el contextInfo.
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
handler.command = ['menu', 'menú', 'help', 'comandos']; // Agregamos 'comandos' por si acaso

export default handler;

// Función para el tiempo de actividad, ¡como el tiempo de navegación!
function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}