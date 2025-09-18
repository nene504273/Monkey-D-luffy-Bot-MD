import ws from 'ws';

let handler = async (m, { conn, usedPrefix, isRowner }) => {
  const _uptime = process.uptime() * 1000;
  const totalReg = Object.keys(global.db.data.users).length;
  const uptime = clockString(_uptime);

  const users = [...new Set([...global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])];
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats);
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'));
  const totalUsers = users.length;

  const old = performance.now();
  const neww = performance.now();
  const speed = neww - old;

  let info = `
    ꕥ Información - ⛧ＭＯＮＫＥＹ ᴅ ʟ ᴜ ꜰ ꜰ ʏ - ᴍᴅ ☠️❁
    ♡⃕ 𓆩ᶻz Creador ⇢ 𓆩 NENE 🧃⸼
    ⚝ Prefijo ⇢ ${usedPrefix}
    𓂃 Versión ⇢ ${vs}
    📁 Chats Privados ⇢ ${chats.length - groupsIn.length}
    🧾 Total De Chats ⇢ ${chats.length}
    👤 Usuarios ⇢ ${totalReg}
    👥 Grupos ⇢ ${groupsIn.length}
    🕐 Actividad ⇢ ${uptime}
    ⚡ Velocidad ⇢ ${(speed * 1000).toFixed(0) / 1000}
    🤖 Sub-Bots Activos ⇢ ${totalUsers || '0'}
  `;

  await conn.sendFile(m.chat, '', 'estado.jpg', info, m);
};

handler.help = ['estado'];
handler.tags = ['info'];
handler.command = ['estado', 'status', 'estate', 'state', 'stado', 'stats'];
handler.register = true;

export default handler;

function clockString(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  return `${hours}h ${minutes}m ${seconds}s`;
}