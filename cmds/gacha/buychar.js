import db from '#db';
export default {
  command: ['buyc', 'buycharacter', 'buychar'],
  category: 'gacha',
  description: 'Comprar un personaje en venta.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const chatId = msg.chat;
    const userId = msg.sender;
    db.setCreate('chats', chatId, 'sales', {});
    let chat = db.getChat(chatId);
    if (chat.adminonly || !chat.gacha) {
      return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con:\n» *${usedPrefix}gacha on*`);
    }
    if (chat.sales && typeof chat.sales === 'string') {
      try { chat.sales = JSON.parse(chat.sales); } catch { chat.sales = {}; }
    }    
    try {
      if (!args.length) {
        return msg.reply(`❀ Debes especificar un personaje para comprar.\n> Ejemplo » *${usedPrefix + command} Yuki Suou*`);
      }      
      const queryBuy = args.join(' ').toLowerCase();
      const idBuy = Object.keys(chat.sales).find(id => (chat.sales[id]?.name || '').toLowerCase() === queryBuy);
      if (!idBuy) return msg.reply(`ꕥ No se ha encontrado al personaje *${args.join(' ')}* en venta.`);     
      const venta = chat.sales[idBuy];
      if (venta.user === userId) return msg.reply(`ꕥ No puedes comprar tu propio personaje.`);     
      const ahora = Date.now();
      if (ahora - venta.time >= 3 * 864e5) {
        delete chat.sales[idBuy];
        db.setChat(chatId, 'sales', chat.sales);
        return msg.reply(`ꕥ La venta de *${venta.name}* ha expirado.`);
      }
      let buyer = db.getChatUser(chatId, userId);
      const saldo = buyer.coins || 0;
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const settings = db.getSettings(botId);
      const currency = settings?.currency;
      if (saldo < venta.price) {
        return msg.reply(`ꕥ No tienes suficientes *${currency}* para comprar a *${venta.name}*.\n> Necesitas *¥${venta.price.toLocaleString()} ${currency}*`);
      }
      db.setCreate('chat_users', [chatId, venta.user], 'favorite', '');
      let seller = db.getChatUser(chatId, venta.user);
      buyer.coins -= venta.price;
      seller.coins += venta.price;
      db.setChatUser(chatId, userId, 'coins', buyer.coins);
      db.setChatUser(chatId, venta.user, 'coins', seller.coins);
      const buyKey = chatId + '__' + idBuy;
      db.setCreate('characters', buyKey, 'name', venta.name);
      let character = db.getCharacter(buyKey);
      if (!character) character = { name: venta.name, value: 0, votes: 0 };
      character.user = userId;
      character.claimedAt = ahora;
      db.setCharacter(buyKey, character);
      if (!buyer.characters.includes(idBuy)) {
        buyer.characters.push(idBuy);
        db.setChatUser(chatId, userId, 'characters', buyer.characters);
      }
      seller.characters = seller.characters.filter(id => id !== idBuy);
      db.setChatUser(chatId, venta.user, 'characters', seller.characters);
      if (seller.favorite === idBuy) {
        db.setChatUser(chatId, venta.user, 'favorite', '');
        db.setUser(venta.user, 'favorite', '');
      }
      delete chat.sales[idBuy];
      db.setChat(chatId, 'sales', chat.sales);
      const vendedorGlobal = db.getUser(venta.user);
      const compradorGlobal = db.getUser(userId);
      let vendedorNombre = vendedorGlobal?.name?.trim() || venta.user.split('@')[0];
      let compradorNombre = compradorGlobal?.name?.trim() || userId.split('@')[0];
      msg.reply(`❀ *${venta.name}* ha sido comprado por *${compradorNombre}*!\n> Se han transferido *¥${venta.price.toLocaleString()} ${currency}* a *${vendedorNombre}*`);
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};