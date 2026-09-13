import db from '#db';
export default {
  command: ['balance', 'bal', 'coins', 'bank'],
  category: 'economy',
  description: 'Ver cuantos coins tienes.',
  run: async ({ msg, sock, usedPrefix, text }) => {
    const chatId = msg.chat;
    const chatData = db.getChat(chatId);
    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net";
    const botSettings = db.getSettings(botId);
    const monedas = botSettings.currency;
    if (chatData.adminonly || !chatData.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }    
    const who = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
    const user = db.getChatUser(chatId, who);
    if (!user) {
      return msg.reply(`「✎」 El usuario mencionado no está registrado en el bot.`);
    }
    const users = db.getUser(who);
    const total = (user.coins || 0) + (user.bank || 0);
    const bal = `✿ Usuario \`<${users?.name || who.split('@')[0]}>\`

⛀ Cartera › *¥${user.coins?.toLocaleString() || 0} ${monedas}*
⚿ Banco › *¥${user.bank?.toLocaleString() || 0} ${monedas}*
⛁ Total › *¥${total.toLocaleString()} ${monedas}*

> _Para proteger tu dinero, ¡depósitalo en el banco usando ${usedPrefix}deposit!_`;
    await sock.sendMessage(chatId, { text: bal }, { quoted: msg });
  }
};