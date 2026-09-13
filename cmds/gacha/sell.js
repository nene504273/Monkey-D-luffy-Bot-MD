import db from '#db';
export default {
  command: ['sell', 'vender'],
  category: 'gacha',
  description: 'Poner un personaje a la venta.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const chatId = msg.chat;
    const userId = msg.sender;
    db.setCreate('chats', chatId, 'sales', {});
    const chat = db.getChat(chatId);
    if (chat.adminonly || !chat.gacha) {
      return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
    }
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = db.getSettings(botId);
    const currency = settings?.currency;
    try {
      if (args.length < 2) {
        return msg.reply(`❀ Debes especificar un precio para subastar el personaje.\n> Ejemplo » *${usedPrefix + command} 5000 Yuki Suou*`);
      }
      const price = parseInt(args[0]);
      if (isNaN(price) || price < 2000) {
        return msg.reply(`ꕥ El precio mínimo para subastar un personaje es de *¥2,000 ${currency}*.`);
      }
      if (price > 100_000_000) {
        return msg.reply(`ꕥ El precio máximo permitido para subastar un personaje es de *¥100,000,000 ${currency}*.`);
      }
      const name = args.slice(1).join(' ').toLowerCase();
      const chatUserData = db.getChatUser(chatId, userId);
      const ownedIds = Array.isArray(chatUserData?.characters) ? chatUserData.characters : [];
      let idSell = null;
      let charSell = null;
      for (const cid of ownedIds) {
        const chatKey = chatId + '__' + cid;
        const chatChar = db.getCharacter(chatKey);
        if (chatChar?.name?.toLowerCase() === name && chatChar.user === userId) {
          idSell = cid;
          charSell = chatChar;
          break;
        }
      }
      if (!idSell || !charSell) return msg.reply(`ꕥ No se ha encontrado al personaje *${args.slice(1).join(' ')}* reclamado por ti.`);
      if (!chat.sales) chat.sales = {};
      if (typeof chat.sales === 'string') {
        try { chat.sales = JSON.parse(chat.sales); } catch { chat.sales = {}; }
      }
      chat.sales[idSell] = { name: charSell.name, user: userId, price, time: Date.now() };
      db.setChat(chatId, 'sales', chat.sales);
      const sellerGlobal = db.getUser(userId);
      let sellerName = sellerGlobal?.name?.trim() || userId.split('@')[0];
      msg.reply(`✎ *${charSell.name}* ha sido puesto a la venta!\n❀ Vendedor » *${sellerName}*\n⛁ Valor » *¥${price.toLocaleString()} ${currency}*\nⴵ Expira en » *3 dias*\n> Puedes ver los personajes en venta usando *${usedPrefix}wshop*`);
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};