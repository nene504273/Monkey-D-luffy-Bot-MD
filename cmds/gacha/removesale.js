import db from '#db';
export default {
  command: ['removesale', 'removerventa'],
  category: 'gacha',
  description: 'Eliminar un personaje en venta.',
  run: async ({ msg, args, usedPrefix, command }) => {
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
    if (!args.length) {
      return msg.reply(`❀ Debes especificar un personaje para eliminar.\n> Ejemplo » *${usedPrefix + command} Yuki Suou*`);
    }    
    try {
      const nameRemove = args.join(' ').toLowerCase();
      const idRemove = Object.keys(chat.sales).find(id => (chat.sales[id]?.name || '').toLowerCase() === nameRemove);      
      if (!idRemove || chat.sales[idRemove].user !== userId) {
        return msg.reply(`ꕥ El personaje *${args.join(' ')}* no está a la venta por ti.`);
      }      
      delete chat.sales[idRemove];
      db.setChat(chatId, 'sales', chat.sales);
      msg.reply(`❀ *${args.join(' ')}* ha sido eliminado de la lista de ventas.`);      
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};