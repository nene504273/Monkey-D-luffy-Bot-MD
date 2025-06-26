import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

const cooldowns = new Map();
const lastMenuSent = new Map();

const newsletterJid = '120363420846835529@newsletter';
// --- CAMBIO: Nombre del Bot ---
const newsletterName = '*Monkey-D-luffy-Bot-MD-OFICIAL*';
const packname = '˚🐒-🄻🅄🄵🄵🅈-🄱🄾🅃-🐒˚';

let handler = async (m, { conn, usedPrefix }) => {
  // --- Manejo de errores de lectura de DB ---
  let mediaLinks;
  try {
    const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
    const dbRaw = fs.readFileSync(dbPath);
    mediaLinks = JSON.parse(dbRaw).links;
  } catch (e) {
    console.error("Error al leer o parsear src/database/db.json:", e);
    // Si hay un error, envía un mensaje al chat y detiene la ejecución del comando.
    return conn.reply(m.chat, 'error al leer el db', m);
  }
  // --- FIN DEL BLOQUE ---

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
      `@${m.sender.split('@')[0]} no se puede enviar el menú antes de tiempo.\nTiempo restante: *${minutes}m ${seconds}s*`,
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
    name = 'Usuario';
  }

  const isMain = conn.user.jid === global.conn.user.jid;
  const botNumber = conn.user.jid.split('@')[0];
  const principalNumber = global.conn?.user?.jid?.split('@')[0] || "Desconocido";
  const totalCommands = Object.keys(global.plugins || {}).length;
  const uptime = clockString(process.uptime() * 1000);
  const totalreg = Object.keys(global.db?.data?.users || {}).length;
  const utcTime = moment().utc().format('HH:mm');

  const gifVideo = mediaLinks.video[Math.floor(Math.random() * mediaLinks.video.length)];
  // La siguiente línea ya no es necesaria para la vista previa, pero puede usarse en otro lugar si lo deseas.
  const randomThumbnail = mediaLinks.imagen[Math.floor(Math.random() * mediaLinks.imagen.length)];

  const emojis = {
    'main': '📋', 'tools': '🛠️', 'audio': '🎧', 'group': '👥',
    'owner': '👑', 'fun': '🎮', 'info': 'ℹ️', 'internet': '🌐',
    'downloads': '⬇️', 'admin': '🧰', 'anime': '✨', 'nsfw': '🔞',
    'search': '🔍', 'sticker': '🖼️', 'game': '🕹️', 'premium': '💎', 'bot': '🤖'
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
    const emoji = emojis[tag] || '📁';
    return `[${emoji} ${tag.toUpperCase()}]\n` + cmds.map(cmd => `> ${cmd}`).join('\n');
  }).join('\n\n');

  // --- CAMBIO: Nombre del Bot en el encabezado ---
  const header = `
Hola ${name} este es el menú:
|----[Monkey-D-luffy-Bot-MD]----•
| 👤 Usuario: ${name}
| 🤖 Bot: ${isMain ? 'Principal' : `Sub-Bot | Principal: ${principalNumber}`}
| 📦 Comandos: ${totalCommands}
| ⏱️ Uptime: ${uptime}
| 🌍 Hora UTC: ${utcTime}
| 👥 Usuarios: ${totalreg}
| 👑 Dueño: wa.me/${global.owner?.[0]?.[0] || "No definido"}
|---------------------•`.trim();

  const finalText = `${header}\n\n${sections}\n\n[⏳] Este menú puede enviarse 1 vez cada 5 minutos por grupo.`;

  // --- CAMBIO REALIZADO AQUÍ ---
  // Se ha eliminado el objeto `externalAdReply` de `contextInfo`.
  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    }
    // --- SECCIÓN ELIMINADA ---
    /*
    externalAdReply: {
      title: packname,
      body: 'Ver todos los comandos de Monkey-D-luffy-Bot-MD',
      thumbnailUrl: randomThumbnail,
      sourceUrl: 'https://github.com/nevi-dev/Vermeil-bot',
      mediaType: 1,
      renderLargerThumbnail: true
    }
    */
    // --- FIN DE LA SECCIÓN ELIMINADA ---
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
    console.error("Error al enviar el mensaje del menú:", e);
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
handler.command = ['menu', 'menú', 'help'];

export default handler;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
