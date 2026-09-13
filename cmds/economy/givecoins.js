import db from '#db';
export default {
  command: ['givecoins', 'pay', 'coinsgive'],
  category: 'economy',
  description: 'Dar coins a un usuario.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    const chatId = msg.chat;
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = db.getSettings(botId);
    const monedas = botSettings.currency || 'coins';
    const chatData = db.getChat(chatId);
    if (chatData.adminonly || !chatData.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    const who = msg.quoted?.sender || msg.mentionedJid?.[0] || (args[1] ? (args[1].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : null);
    if (!who) {
      return msg.reply(`❀ Debes mencionar a quien quieras transferir *${monedas}*.\n> Ejemplo » *${usedPrefix + command} 25000 @mencion*`);
    }
    const senderData = db.getChatUser(chatId, msg.sender);
    const targetData = db.getChatUser(chatId, who);   
    if (!targetData) {
      return msg.reply(`ꕥ El usuario mencionado no está registrado en el bot.`);
    }
    const cantidadInput = args[0]?.toLowerCase();
    let cantidad = cantidadInput === 'all' ? senderData.bank : parseInt(cantidadInput);
    if (!cantidadInput || isNaN(cantidad) || cantidad <= 0) {
      return msg.reply(`ꕥ Ingresa una cantidad válida de *${monedas}* para transferir.`);
    }
    if (senderData.bank < cantidad) {
      return msg.reply(`ꕥ No tienes suficientes *${monedas}* en el banco para transferir.\n> Tu saldo actual: *¥${senderData.bank.toLocaleString()} ${monedas}*`);
    }        
    db.setChatUser(chatId, msg.sender, 'bank', senderData.bank - cantidad);
    db.setChatUser(chatId, who, 'bank', (targetData.bank || 0) + cantidad);
    const userData = db.getUser(who);
    let name = userData?.name || who.split('@')[0];
    await sock.sendMessage(chatId, { text: `❀ Transferiste *¥${cantidad.toLocaleString()} ${monedas}* a *${name}*\n> Ahora tienes *¥${(senderData.bank - cantidad).toLocaleString()} ${monedas}* en tu banco.`, mentions: [who] }, { quoted: msg });
  }
};