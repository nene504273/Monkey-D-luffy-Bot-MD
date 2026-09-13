import db from '#db';
const getLastActive = (usedTime) => {
  if (!usedTime) return 0;
  if (typeof usedTime === 'number') return usedTime;
  if (usedTime instanceof Date) return usedTime.getTime();
  if (typeof usedTime === 'string') {
    try { return new Date(JSON.parse(usedTime)).getTime(); } catch { return new Date(usedTime).getTime(); }
  }
  return 0;
};

const formatTime = ms => {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [d ? `${d}d` : '', h ? `${h}h` : '', m ? `${m}m` : '', s || (!d && !h && !m) ? `${s}s` : ''].filter(Boolean).join(' ');
};

const getDuration = start => { const ms = Date.now() - start; return ms < 1 ? 1 : ms; };
const normalizeNumber = jid => String(jid).replace(/\D/g, '');

const isPrivileged = (jid, sender) => {
  const n = normalizeNumber(jid);
  if (n === normalizeNumber(sender)) return true;
  for (const list of [global.owner]) {
    if (!list) continue;
    for (const o of list) {
      const id = typeof o === 'string' ? o : Array.isArray(o) ? o[0] : o?.jid;
      if (normalizeNumber(id) === n) return true;
    }
  }
  return false;
};

export default {
  command: ['clear'],
  category: 'group',
  description: 'Limpiar usuarios inactivos del grupo.',
  isAdmin: true,
  run: async ({ msg, sock }) => {
    const start = Date.now();
    const chat = db.getChat(msg.chat);
    const textLower = (msg.text || '').toLowerCase();
    const isViewMode = textLower.includes('view') || textLower.includes('views');
    const isFullDeleteMode = textLower.includes('full') || textLower.includes('complete');
    const isDeleteMode = textLower.includes('delete') || textLower.includes('del');
    const usersObj = chat?.users || {};
    const allChatUsers = Object.entries(usersObj).map(([jid, u]) => ({ ...u, user_id: jid }));
    const LIMITE = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let userList = [], mentions = [], eliminados = 0, waifus = 0, dinero = 0, deletedUsers = [];
    for (const u of allChatUsers) {
      if (isPrivileged(u.user_id, msg.sender)) continue;
      const lastActive = getLastActive(u.usedTime) || (typeof u.lastCmd === 'number' ? u.lastCmd : 0);
      const delta = now - lastActive;
      const userData = db.getUser(u.user_id);
      const displayName = userData?.name || u.user_id.split('@')[0];
      let characters = u.characters;
      if (typeof characters === 'string') { try { characters = JSON.parse(characters); } catch { characters = []; } }
      if (!Array.isArray(characters)) characters = [];
      const coins = typeof u.coins === 'number' ? u.coins : 0;
      const bank = typeof u.bank === 'number' ? u.bank : 0;
      const totalCoins = coins + bank;
      const isValidTime = lastActive > 0;
      const isInactive = isValidTime && delta > LIMITE;
      if (isViewMode && isValidTime) {
        userList.push(`*${displayName} [${characters.length}]* - hace ${formatTime(delta)}`);
        mentions.push(u.user_id); waifus += characters.length; dinero += totalCoins;
        continue;
      }
      if (!isInactive) continue;
      userList.push(`*${displayName} [${characters.length}]* - hace ${formatTime(delta)}`);
      mentions.push(u.user_id); waifus += characters.length; dinero += totalCoins;
      if (isDeleteMode && !isViewMode) {
        for (const id of characters) {
          let character = db.getCharacter(id);
          if (character && character.user === u.user_id) {
            delete character.user; delete character.claimedAt;
            db.setCharacter(id, character);
          }
          if (chat.sales && chat.sales[id]?.user === u.user_id) delete chat.sales[id];
          if (u.favorite === id) {
            db.setChatUser(msg.chat, u.user_id, 'favorite', '');
            if (db.getUser(u.user_id)) db.setUser(u.user_id, 'favorite', '');
          }
        }
        if (isFullDeleteMode) {
          db.deletedb('chatuser', msg.chat, u.user_id);
          deletedUsers.push({ jid: u.user_id, name: displayName });
        } else {
          db.setChatUser(msg.chat, u.user_id, 'characters', []);
          db.setChatUser(msg.chat, u.user_id, 'coins', 0);
          db.setChatUser(msg.chat, u.user_id, 'bank', 0);
        }
        eliminados++;
      } else if (!isViewMode) { eliminados++; }
    }
    if (chat.sales && isDeleteMode && !isViewMode) db.setChat(msg.chat, 'sales', chat.sales);
    if (userList.length === 0) {
      return msg.reply(isViewMode ? 'ꕥ No hay usuarios con actividad registrada en este grupo.' : 'ꕥ No se encontraron usuarios inactivos.\n> ⴵ Tiempo limite: 30 dias');
    }
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const currency = db.getSettings(botId)?.currency || '⛁';
    let report = '';
    if (isDeleteMode && !isViewMode) {
      const title = isFullDeleteMode ? '✰ *Delete Users Completos*' : '✰ *Delete Users Inactivos*';
      report = [title, `> ✿ Claims eliminadas: ${waifus.toLocaleString()}`, `> ${currency} eliminados: ${dinero.toLocaleString()}`, `> ✩ Usuarios: ${eliminados.toLocaleString()}`, `> ❒ Tiempo límite: 30 días`, `> ❏ Ejecutado en ${getDuration(start)}ms`, '', ...userList].join('\n');
    } else if (isViewMode) {
      report = ['✰ *Users Info*', `> ✿ Claims: ${waifus.toLocaleString()}`, `> ${currency}: ${dinero.toLocaleString()}`, `> ❒ Usuarios encontrados: ${userList.length}`, `> ❏ Ejecutado en ${getDuration(start)}ms`, '', ...userList.map((l, i) => `${i + 1}. ${l}`)].join('\n');
    } else {
      report = ['ꕥ Usuarios inactivos encontrados:', `> ♡ Claims: ${waifus.toLocaleString()}`, `> ${currency} Coins: ${dinero.toLocaleString()}`, `> ❖ Inactivos: ${eliminados}`, `> ⴵ Tiempo límite: 30 días`, `> ❏ Ejecutado en ${getDuration(start)}ms`, '', ...userList].join('\n');
    }
    if (isFullDeleteMode && isDeleteMode && !isViewMode && deletedUsers.length > 0) {
      report += '\n\n*✿ Usuarios eliminados completamente:*\n';
      deletedUsers.slice(0, 10).forEach((u, i) => { report += `${i + 1}. *${u.name}* (${u.jid.split('@')[0]})\n`; });
      if (deletedUsers.length > 10) report += `... y ${deletedUsers.length - 10} más\n`;
    }
    await sock.sendMessage(msg.chat, { text: report, mentions: isViewMode ? mentions : (isDeleteMode ? mentions : []) }, { quoted: msg });
  },
};