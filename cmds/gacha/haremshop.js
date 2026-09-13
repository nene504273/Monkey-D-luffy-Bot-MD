import db from '#db';
export default {
  command: ['wshop', 'haremshop', 'tiendawaifus'],
  category: 'gacha',
  description: 'Ver los personajes en venta.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const chatId = msg.chat;
    db.setCreate('chats', chatId, 'sales', {});
    let chat = db.getChat(chatId);
    if (chat.adminonly || !chat.gacha) {
      return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con:\n» *${usedPrefix}gacha on*`);
    }
    if (chat.sales && typeof chat.sales === 'string') {
      try { chat.sales = JSON.parse(chat.sales); } catch { chat.sales = {}; }
    }    
    try {
      const ahora = Date.now();
      let cambios = false;
      for (const [id, venta] of Object.entries(chat.sales)) {
        if (ahora - venta.time >= 3 * 864e5) {
          delete chat.sales[id];
          cambios = true;
        }
      }
      if (cambios) {
        db.setChat(chatId, 'sales', chat.sales);
      }
      const ventas = Object.entries(chat.sales || {});      
      if (!ventas.length) {
        const grupo = await sock.groupMetadata(msg.chat);
        return msg.reply(`ꕥ No hay personajes en venta en *${grupo.subject || 'este grupo'}*`);
      }
      const page = parseInt(args[0]) || 1;
      const porPagina = 10;
      const totalPaginas = Math.ceil(ventas.length / porPagina);
      if (page < 1 || page > totalPaginas) {
        return msg.reply(`ꕥ Página inválida. Solo hay *${totalPaginas}* disponible${totalPaginas > 1 ? 's' : ''}.`);
      }
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const settings = db.getSettings(botId);
      const currency = settings?.currency;
      const listado = [];
      for (const [id, venta] of ventas.slice((page - 1) * porPagina, page * porPagina)) {
        const precios = typeof venta.price === 'number' ? `¥${venta.price.toLocaleString()} ${currency}` : 'Precio no disponible';
        const tiempoRestante = 3 * 864e5 - (Date.now() - venta.time);
        const d = Math.floor(tiempoRestante / 86400000);
        const h = Math.floor(tiempoRestante % 86400000 / 3600000);
        const m_ = Math.floor(tiempoRestante % 3600000 / 60000);
        const s = Math.floor(tiempoRestante % 60000 / 1000);
        const vendedorGlobal = db.getUser(venta.user);
        let vendedor = vendedorGlobal?.name?.trim() || venta.user.split('@')[0];
        const character = db.getCharacter(id);
        const valorFinal = character?.value || 0;
        listado.push(`❀ *${venta.name}* (✰ ${valorFinal.toLocaleString()}):\n⛁ Precio » *${precios}*\n❖ Vendedor » *${vendedor}*\nⴵ Expira en » *${d}d ${h}h ${m_}m ${s}s*`);
      }
      msg.reply(`*☆ HaremShop \`≧◠ᴥ◠≦\`*\n❏ Personajes en venta <${ventas.length}>:\n\n` + listado.join('\n\n') + `\n\n> • Paginá *${page}* de *${totalPaginas}*`);
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};