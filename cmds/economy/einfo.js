import db from '#db';
const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (days > 0) parts.push(`${days} d`);
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0) parts.push(`${minutes} m`);
  if (seconds > 0) parts.push(`${seconds} s`);
  return parts.length ? parts.join(', ') : 'Ahora.';
};

export default {
  command: ['infoeconomy', 'cooldowns', 'economyinfo', 'einfo'],
  category: 'economy',
  description: 'Ver tu información de economía y cooldowns.',
  run: async ({ msg, sock, usedPrefix, text }) => {
    const chatId = msg.chat;
    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net";
    const chatData = db.getChat(chatId);
    if (chatData.adminonly || !chatData.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }        
    db.setCreate('chat_users', [chatId, msg.sender], 'lastcrime', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastmine', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastinvoke', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastwork', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastslut', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'laststeal', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lasthunt', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastfish', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastcoffer', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastdungeon', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastadventure', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastdaily', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastweekly', 0);
    db.setCreate('chat_users', [chatId, msg.sender], 'lastmonthly', 0);    
    const user = db.getChatUser(chatId, msg.sender);
    const users = db.getUser(msg.sender);
    const settings = db.getSettings(botId);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;    
    const cooldowns = {
      crime: Math.max(0, (user.lastcrime || 0) - now),
      mine: Math.max(0, (user.lastmine || 0) - now),
      ritual: Math.max(0, (user.lastinvoke || 0) - now),
      work: Math.max(0, (user.lastwork || 0) - now),
      slut: Math.max(0, (user.lastslut || 0) - now),
      steal: Math.max(0, (user.laststeal || 0) - now),
      hunt: Math.max(0, (user.lasthunt || 0) - now),
      fish: Math.max(0, (user.lastfish || 0) - now),
      coffer: Math.max(0, (user.lastcoffer || 0) - now),
      dungeon: Math.max(0, (user.lastdungeon || 0) - now),
      adventure: Math.max(0, (user.lastadventure || 0) - now),
      daily: Math.max(0, (user.lastdaily || 0) - now),
      weekly: Math.max(0, (user.lastweekly || 0) - now),
      monthly: Math.max(0, (user.lastmonthly || 0) - now)
    };        
        
    const coins = user.coins || 0;
    const name = users?.name || msg.sender.split('@')[0];
    const mensaje = `✿ Usuario \`<${name}>\`

ⴵ Work » *${formatTime(cooldowns.work)}*
ⴵ Slut » *${formatTime(cooldowns.slut)}*
ⴵ Crime » *${formatTime(cooldowns.crime)}*
ⴵ Mine » *${formatTime(cooldowns.mine)}*
ⴵ Ritual » *${formatTime(cooldowns.ritual)}*
ⴵ Fish » *${formatTime(cooldowns.fish)}*
ⴵ Hunt » *${formatTime(cooldowns.hunt)}*
ⴵ Dungeon » *${formatTime(cooldowns.dungeon)}*
ⴵ Adventure » *${formatTime(cooldowns.adventure)}*
ⴵ Steal » *${formatTime(cooldowns.steal)}*
ⴵ Daily » *${formatTime(cooldowns.daily)}*
ⴵ Coffer » *${formatTime(cooldowns.coffer)}*
ⴵ Weekly » *${formatTime(cooldowns.weekly)}*
ⴵ Monthly » *${formatTime(cooldowns.monthly)}*

⛁ Coins totales » ¥${coins.toLocaleString()} ${settings.currency}`;
    await sock.sendMessage(chatId, { text: mensaje }, { quoted: msg });
  }
};