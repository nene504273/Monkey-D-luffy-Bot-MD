import db from '#db';
export default {
  command: ['robar', 'steal', 'rob'],
  category: 'economy',
  description: 'Intentar robar coins a un usuario.',
  run: async ({ msg, sock, usedPrefix, command }) => {
    const chatData = db.getChat(msg.chat);
    if (chatData.adminonly || !chatData.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }    
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = db.getSettings(botId);
    const currency = bot.currency;
    db.setCreate('chat_users', [msg.chat, msg.sender], 'laststeal', 0);
    const user = db.getChatUser(msg.chat, msg.sender);    
    if (Date.now() < user.laststeal) {
      const restante = user.laststeal - Date.now();
      return sock.reply(msg.chat, `ꕥ Debes esperar *${formatTime(restante)}* para usar *${usedPrefix + command}* de nuevo.`, msg);
    }    
    const who = msg.mentionedJid?.[0] || msg.quoted?.sender || null;
    if (!who) {
      return sock.reply(msg.chat, `❀ Debes mencionar a alguien para intentar robarle.`, msg);
    }   
    const target = db.getChatUser(msg.chat, who);
    if (!target) {
      return sock.reply(msg.chat, `ꕥ El usuario no se encuentra en mi base de datos.`, msg);
    }    
    const name = (db.getUser(who))?.name || who.split('@')[0];
    const lastCmd = target.lastCmd || 0;
    const tiempoInactivo = Date.now() - lastCmd;    
    if (tiempoInactivo < 3600000) {
      return sock.reply(msg.chat, `ꕥ Solo puedes robarle *${currency}* a un usuario si estuvo más de 1 hora inactivo.`, msg);
    }
    const chance = Math.random();
    if (chance < 0.3) {
      let loss = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
      const total = (user.coins || 0) + (user.bank || 0);      
      if (total >= loss) {
        if (user.coins >= loss) {
          db.setChatUser(msg.chat, msg.sender, 'coins', (user.coins || 0) - loss);
        } else {
          const restanteLoss = loss - (user.coins || 0);
          db.setChatUser(msg.chat, msg.sender, 'coins', 0);
          db.setChatUser(msg.chat, msg.sender, 'bank', Math.max(0, (user.bank || 0) - restanteLoss));
        }
      } else {
        loss = total;
        db.setChatUser(msg.chat, msg.sender, 'coins', 0);
        db.setChatUser(msg.chat, msg.sender, 'bank', 0);
      }      
      db.setChatUser(msg.chat, msg.sender, 'laststeal', Date.now() + 3600000);
      return sock.reply(msg.chat, `ꕥ El robo salió mal y perdiste *¥${loss.toLocaleString()} ${currency}*.`, msg);
    }    
    const rob = Math.floor(Math.random() * (9000 - 3000 + 1)) + 3000;    
    if ((target.coins || 0) < rob) {
      return sock.reply(msg.chat, `ꕥ *${name}* no tiene suficientes *${currency}* fuera del banco como para que valga la pena intentar robar.`, msg, { mentions: [who] });
    }    
    db.setChatUser(msg.chat, msg.sender, 'coins', (user.coins || 0) + rob);
    db.setChatUser(msg.chat, who, 'coins', (target.coins || 0) - rob);
    db.setChatUser(msg.chat, msg.sender, 'laststeal', Date.now() + 3600000);    
    sock.reply(msg.chat, `❀ Le robaste *¥${rob.toLocaleString()} ${currency}* a *${name}*`, msg, { mentions: [who] });
  }
};

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const parts = [];
  if (hours) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`);
  if (minutes) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
  parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`);
  return parts.join(' ');
}