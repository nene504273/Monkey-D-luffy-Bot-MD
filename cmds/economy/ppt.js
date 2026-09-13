import db from '#db';
export default {
  command: ['ppt'],
  category: 'economy',
  description: 'Jugar piedra, papel o tijera con el bot.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    const chatId = msg.chat;
    const chatData = db.getChat(chatId);
    if (chatData.adminonly || !chatData.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';    
    const botSettings = db.getSettings(botId);
    const monedas = botSettings.currency;
    const botname = botSettings.namebot;   
    db.setCreate('chat_users', [chatId, msg.sender], 'lastppt', 0);
    const user = db.getChatUser(chatId, msg.sender);    
    const remainingTime = user.lastppt - Date.now();    
    if (remainingTime > 0) {
      return msg.reply(`ꕥ Debes esperar *${msToTime(remainingTime)}* antes de jugar nuevamente.`);
    }
    const options = ['piedra', 'papel', 'tijera'];
    const userChoice = args[0]?.trim().toLowerCase();    
    if (!options.includes(userChoice)) {
      return msg.reply(`《✧》 Usa el comando así:\n› *${usedPrefix + command} piedra*, *papel* o *tijera*`);
    }
    const botChoice = options[Math.floor(Math.random() * options.length)];
    const result = determineWinner(userChoice, botChoice);
    const reward = Math.floor(Math.random() * (5500 - 3000 + 1)) + 3000;
    const loss = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
    const tieReward = Math.floor(Math.random() * (1500 - 800 + 1)) + 800;    
    let newCoins = user.coins || 0;
    let newBank = user.bank || 0;    
    if (result === 'win') {
      newCoins += reward;
      db.setChatUser(chatId, msg.sender, 'coins', newCoins);
      await sock.sendMessage(chatId, { text: `ꕥ Ganaste.\n\n> ✿ *Tu elección ›* ${userChoice}\n> ✿ *${botname} eligió ›* ${botChoice}\n> ✿ *${monedas} ›* ¥${reward.toLocaleString()}` }, { quoted: msg });
    } else if (result === 'lose') {
      const total = newCoins + newBank;
      const actualLoss = Math.min(loss, total);      
      if (newCoins >= actualLoss) {
        newCoins -= actualLoss;
        db.setChatUser(chatId, msg.sender, 'coins', newCoins);
      } else {
        const remaining = actualLoss - newCoins;
        newCoins = 0;
        newBank = Math.max(0, newBank - remaining);
        db.setChatUser(chatId, msg.sender, 'coins', 0);
        db.setChatUser(chatId, msg.sender, 'bank', newBank);
      }      
      await sock.sendMessage(chatId, { text: `ꕥ Perdiste.\n\n> ✿ *Tu elección ›* ${userChoice}\n> ✿ *${botname} eligió ›* ${botChoice}\n> ✿ *${monedas} ›* -¥${actualLoss.toLocaleString()}` }, { quoted: msg });
    } else {
      newCoins += tieReward;
      db.setChatUser(chatId, msg.sender, 'coins', newCoins);
      await sock.sendMessage(chatId, { text: `ꕥ Empate.\n\n> ✿ *Tu elección ›* ${userChoice}\n> ✿ *${botname} eligió ›* ${botChoice}\n> ✿ *${monedas} ›* +¥${tieReward.toLocaleString()}` }, { quoted: msg });
    }
    db.setChatUser(chatId, msg.sender, 'lastppt', Date.now() + 1 * 60 * 1000);
  }
};

function determineWinner(user, bot) {
  if (user === bot) return 'tie';
  if ((user === 'piedra' && bot === 'tijera') || (user === 'papel' && bot === 'piedra') || (user === 'tijera' && bot === 'papel')) {
    return 'win';
  }
  return 'lose';
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}, ${seconds} segundo${seconds !== 1 ? 's' : ''}`;
}