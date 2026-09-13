import db from '#db';
export default {
  command: ['rt', 'roulette', 'ruleta'],
  category: 'economy',
  description: 'Apostar coins en una ruleta.',
  run: async ({ msg, sock, args, usedPrefix, text }) => {
    const chatId = msg.chat;
    const senderId = msg.sender;
    const chatData = db.getChat(chatId);
    if (chatData.adminonly || !chatData.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = db.getSettings(botId);
    const currency = botSettings.currency || 'Monedas';    
    db.setCreate('chat_users', [chatId, senderId], 'lastroulette', 0);    
    const user = db.getChatUser(chatId, senderId);    
    const cooldown = 30 * 1000;    
    if (Date.now() < user.lastroulette) {
      const restante = user.lastroulette - Date.now();
      return msg.reply(`ꕥ Debes esperar *${msToTime(restante)}* antes de volver a usar rt.`);
    }
    if (args.length < 2) {
      return msg.reply(`《✧》 Debes ingresar una cantidad de ${currency} y apostar a un color.`);
    }    
    let amount, color;    
    if (!isNaN(parseInt(args[0]))) {
      amount = parseInt(args[0]);
      color = args[1].toLowerCase();
    } else if (!isNaN(parseInt(args[1]))) {
      color = args[0].toLowerCase();
      amount = parseInt(args[1]);
    } else {
      return msg.reply(`《✧》 Formato inválido. Ejemplo: *rt 2000 black* o *rt black 2000*`);
    }    
    const validColors = ['red', 'black', 'green'];
    if (isNaN(amount) || amount < 200) {
      return msg.reply(`《✧》 La cantidad mínima de ${currency} a apostar es 200.`);
    }
    if (!validColors.includes(color)) {
      return msg.reply(`《✧》 Por favor, elige un color válido: red, black, green.`);
    }    
    if (user.coins < amount) {
      return msg.reply(`《✧》 No tienes suficientes *${currency}* para hacer esta apuesta.`);
    }    
    db.setChatUser(chatId, senderId, 'lastroulette', Date.now() + cooldown);    
    const random = Math.floor(Math.random() * 37);
    let resultColor;    
    if (random < 9) {
      resultColor = 'green';
    } else if (random < 23) {
      resultColor = 'red';
    } else {
      resultColor = 'black';
    }    
    if (resultColor === color) {
      const reward = amount * (resultColor === 'green' ? 5 : 2);
      db.setChatUser(chatId, senderId, 'coins', (user.coins || 0) + reward);
      await sock.sendMessage(chatId, { text: `「✿」 La ruleta salió en *${resultColor}* y has ganado *¥${reward.toLocaleString()} ${currency}*.`, mentions: [senderId] }, { quoted: msg });
    } else {
      db.setChatUser(chatId, senderId, 'coins', (user.coins || 0) - amount);
      await sock.sendMessage(chatId, { text: `「✿」 La ruleta salió en *${resultColor}* y has perdido *¥${amount.toLocaleString()} ${currency}*.`, mentions: [senderId] }, { quoted: msg });
    }
  }
};

function msToTime(duration) {
  const seconds = Math.floor(duration / 1000);
  return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
}