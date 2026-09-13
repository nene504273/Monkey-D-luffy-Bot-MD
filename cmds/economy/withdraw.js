import db from '#db';
export default {
  command: ['withdraw', 'with', 'retirar'],
  category: 'economy',
  description: 'Retirar tus coins del banco.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const chatId = msg.chat;
    const senderId = msg.sender;
    const chatData = db.getChat(chatId);
    if (chatData.adminonly || !chatData.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = db.getSettings(botId);
    const currency = botSettings.currency
    const user = db.getChatUser(chatId, senderId);    
    if (!args[0]) {
      return msg.reply(`《✧》 Ingresa la cantidad de *${currency}* que quieras retirar.`);
    }    
    if (args[0].toLowerCase() === 'all') {
      if ((user.bank || 0) <= 0) {
        return msg.reply(`No tienes suficientes *${currency}* en tu Banco para poder retirar.`);
      }
      const amount = user.bank;
      db.setChatUser(chatId, senderId, 'bank', 0);
      db.setChatUser(chatId, senderId, 'coins', (user.coins || 0) + amount);
      return msg.reply(`✎ Has retirado *¥${amount.toLocaleString()} ${currency}* del banco, ahora podras usarlo pero tambien podran robartelo.`);
    }    
    const count = parseInt(args[0]);
    if (isNaN(count) || count < 1) {
      return msg.reply(`《✧》 Debes retirar una cantidad válida.\n > Ejemplo 1 » *${usedPrefix + command} ¥25000*\n> Ejemplo 2 » *${usedPrefix + command} all*`);
    }    
    if ((user.bank || 0) < count) {
      return msg.reply(`《✧》 No tienes suficientes *${currency}* en tu banco para retirar esa cantidad.\n> Solo tienes *¥${user.bank.toLocaleString()} ${currency}* en tu cuenta.`);
    }    
    db.setChatUser(chatId, senderId, 'bank', user.bank - count);
    db.setChatUser(chatId, senderId, 'coins', (user.coins || 0) + count);    
    await msg.reply(`✎ Has retirado *¥${count.toLocaleString()} ${currency}* del banco, ahora podras usarlo pero tambien podran robartelo.`);
  }
};