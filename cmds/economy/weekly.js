import db from '#db';
export default {
  command: ['weekly', 'semanal'],
  category: 'economy',
  description: 'Reclamar tu recompensa semanal.',
  run: async ({ msg, sock, usedPrefix }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }        
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = db.getSettings(botId);
    const currency = bot.currency;
    db.setCreate('users', msg.sender, 'weeklyStreak', 0);
    db.setCreate('users', msg.sender, 'lastWeeklyGlobal', 0);
    db.setCreate('chat_users', [msg.chat, msg.sender], 'lastweekly', 0);
    const users = db.getUser(msg.sender);
    const user = db.getChatUser(msg.chat, msg.sender);
    const gap = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now < user.lastweekly) {
      const wait = formatTime(Math.floor((user.lastweekly - now) / 1000));
      return sock.reply(msg.chat, `ꕥ Ya has reclamado tu recompensa semanal.\n> Puedes reclamarlo de nuevo en *${wait}*`, msg);
    }
    let currentStreak = users.weeklyStreak;
    const lost = users.weeklyStreak >= 1 && now - users.lastWeeklyGlobal > gap * 1.5;
    if (lost) {
      currentStreak = 0;
      db.setUser(msg.sender, 'weeklyStreak', 0);
    }
    const canClaimWeeklyGlobal = now - users.lastWeeklyGlobal >= gap;
    if (canClaimWeeklyGlobal) {
      currentStreak = Math.min(currentStreak + 1, 30);
      db.setUser(msg.sender, 'weeklyStreak', currentStreak);
      db.setUser(msg.sender, 'lastWeeklyGlobal', now);
    }
    const coins = Math.min(40000 + (currentStreak - 1) * 5000, 185000);
    db.setChatUser(msg.chat, msg.sender, 'coins', (user.coins || 0) + coins);
    db.setChatUser(msg.chat, msg.sender, 'lastweekly', now + gap);
    let nextReward = Math.min(40000 + currentStreak * 5000, 185000).toLocaleString();
    let caption = `> Semana *${currentStreak + 1}* » *+¥${nextReward}*`;
    if (lost) caption += `\n> ☆ ¡Has perdido tu racha de semanas!`;
    sock.reply(msg.chat, `「❁」 Has reclamado tu recompensa semanal de *¥${coins.toLocaleString()} ${currency}* (Semana *${currentStreak}*)\n${caption}`, msg);
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