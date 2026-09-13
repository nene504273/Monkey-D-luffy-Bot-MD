import db from '#db';
export default {
  command: ['monthly', 'mensual'],
  category: 'economy',
  description: 'Reclamar tu recompensa mensual.',
  run: async ({ msg, sock, usedPrefix, text }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = db.getSettings(botId);
    const currency = bot.currency;
    db.setCreate('users', msg.sender, 'monthlyStreak', 0);
    db.setCreate('users', msg.sender, 'lastMonthlyGlobal', 0);
    db.setCreate('chat_users', [msg.chat, msg.sender], 'lastmonthly', 0);
    const users = db.getUser(msg.sender);
    const user = db.getChatUser(msg.chat, msg.sender);
    const gap = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now < user.lastmonthly) {
      const wait = formatTime(Math.floor((user.lastmonthly - now) / 1000));
      return sock.sendMessage(msg.chat, { text: `ꕥ Ya has reclamado tu recompensa mensual.\n> Puedes reclamarlo de nuevo en *${wait}*` }, { quoted: msg });
    }
    let currentStreak = users.monthlyStreak;
    const lost = users.monthlyStreak >= 1 && now - users.lastMonthlyGlobal > gap * 1.5;
    if (lost) {
      currentStreak = 0;
      db.setUser(msg.sender, 'monthlyStreak', 0);
    }
    const canClaimGlobal = now - users.lastMonthlyGlobal >= gap;
    if (canClaimGlobal) {
      currentStreak = Math.min(currentStreak + 1, 8);
      db.setUser(msg.sender, 'monthlyStreak', currentStreak);
      db.setUser(msg.sender, 'lastMonthlyGlobal', now);
    }    
    const coins = Math.min(60000 + (currentStreak - 1) * 5000, 95000);
    db.setChatUser(msg.chat, msg.sender, 'coins', (user.coins || 0) + coins);
    db.setChatUser(msg.chat, msg.sender, 'lastmonthly', now + gap);    
    let next = Math.min(60000 + currentStreak * 5000, 95000).toLocaleString();
    let caption = `> Mes *${currentStreak + 1}* » *+${next}*`;
    if (lost) caption += `\n> ☆ ¡Has perdido tu racha de meses!`;    
    await sock.sendMessage(msg.chat, { text: `「❁」 Has reclamado tu recompensa mensual de *+${coins.toLocaleString()} ${currency}* (Mes *${currentStreak}*)\n${caption}` }, { quoted: msg });
  }
};

function formatTime(t) {
  const d = Math.floor(t / 86400);
  const h = Math.floor((t % 86400) / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (d) return `${d} día${d !== 1 ? 's' : ''} ${h} hora${h !== 1 ? 's' : ''} ${m} minuto${m !== 1 ? 's' : ''}`;
  if (h) return `${h} hora${h !== 1 ? 's' : ''} ${m} minuto${m !== 1 ? 's' : ''} ${s} segundo${s !== 1 ? 's' : ''}`;
  if (m) return `${m} minuto${m !== 1 ? 's' : ''} ${s} segundo${s !== 1 ? 's' : ''}`;
  return `${s} segundo${s !== 1 ? 's' : ''}`;
}