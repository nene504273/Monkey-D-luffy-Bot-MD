import db from '#db';
export default {
  command: ['daily', 'diario'],
  category: 'economy',
  description: 'Reclamar tu recompensa diaria.',
  run: async ({ msg, sock, usedPrefix }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = db.getSettings(botId);
    const monedas = bot.currency;    
    db.setCreate('users', msg.sender, 'streak', 0);
    db.setCreate('users', msg.sender, 'lastDailyGlobal', 0);
    db.setCreate('chat_users', [msg.chat, msg.sender], 'lastdaily', 0);    
    const users = db.getUser(msg.sender);
    const user = db.getChatUser(msg.chat, msg.sender);    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const maxStreak = 200;
    if (now < user.lastdaily) {
      const restante = formatRemainingTime(user.lastdaily - now);
      return msg.reply(`ꕥ Ya has reclamado tu *Daily* de hoy.\n> Puedes reclamarlo de nuevo en *${restante}*`);
    }
    let currentStreak = users.streak;
    const lost = users.streak >= 1 && now - users.lastDailyGlobal > oneDay * 1.5;
    if (lost) {
      currentStreak = 0;
      db.setUser(msg.sender, 'streak', 0);
    }
    const canClaimGlobal = now - users.lastDailyGlobal >= oneDay;
    if (canClaimGlobal) {
      currentStreak = Math.min(currentStreak + 1, maxStreak);
      db.setUser(msg.sender, 'streak', currentStreak);
      db.setUser(msg.sender, 'lastDailyGlobal', now);
    }
    const recompensa = Math.min(20000 + (currentStreak - 1) * 5000, 1015000);
    db.setChatUser(msg.chat, msg.sender, 'coins', (user.coins || 0) + recompensa);
    db.setChatUser(msg.chat, msg.sender, 'lastdaily', now + oneDay);
    const siguiente = Math.min(20000 + currentStreak * 5000, 1015000).toLocaleString();
    let caption = `> Día *${currentStreak + 1}* » *+¥${siguiente}*`;
    if (lost) caption += `\n> ☆ ¡Has perdido tu racha de días!`;
    await msg.reply(`「✿」Has reclamado tu recompensa diaria de *¥${recompensa.toLocaleString()} ${monedas}*! (Día *${currentStreak}*)\n${caption}`);
  }
};

function formatRemainingTime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const partes = [];
  if (h) partes.push(`${h} ${h === 1 ? 'hora' : 'horas'}`);
  if (m) partes.push(`${m} ${m === 1 ? 'minuto' : 'minutos'}`);
  if (seg || partes.length === 0) partes.push(`${seg} ${seg === 1 ? 'segundo' : 'segundos'}`);
  return partes.join(' ');
}