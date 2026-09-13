import db from '#db';
export default {
  command: ['shop', 'tienda', 'buy', 'comprar', 'inventory', 'inv', 'inventario'],
  category: 'economy',
  description: 'Ver la tienda del bot.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }    
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = db.getSettings(botId);
    const currency = settings?.currency
    db.setCreate('chat_users', [msg.chat, msg.sender], 'inventory', {});
    db.setCreate('chat_users', [msg.chat, msg.sender], 'weapons', {});
    db.setCreate('chat_users', [msg.chat, msg.sender], 'tools', {});
    let user = db.getChatUser(msg.chat, msg.sender);
    const users = db.getUser(msg.sender);
    if (user.weapons && typeof user.weapons === 'string') {
      try { user.weapons = JSON.parse(user.weapons); } catch { user.weapons = {}; }
    }
    if (user.tools && typeof user.tools === 'string') {
      try { user.tools = JSON.parse(user.tools); } catch { user.tools = {}; }
    }
    if (user.inventory && typeof user.inventory === 'string') {
      try { user.inventory = JSON.parse(user.inventory); } catch { user.inventory = {}; }
    }    
    const armas = [{ id: 'espada', name: 'Espada', price: 8000, durability: 100, description: 'Para aventura', tipo: 'Combate' }, { id: 'hacha', name: 'Hacha', price: 7500, durability: 100, description: 'Para mazmorra', tipo: 'Combate' }, { id: 'arco', name: 'Arco', price: 7000, durability: 100, description: 'Para cazar', tipo: 'Combate' }];    
    const herramientas = [{ id: 'pico', name: 'Pico', price: 6500, durability: 100, description: 'Para minar', tipo: 'Equipo' }, { id: 'caña', name: 'Caña de pescar', price: 6000, durability: 100, description: 'Para pescar', tipo: 'Equipo' }, { id: 'totem', name: 'Totem', price: 4000, durability: 3, description: 'Para ritual', tipo: 'Consumible' }, { id: 'pocion', name: 'Pocion', price: 1500, durability: 1, description: 'Restaura magia', tipo: 'Consumible' }];
    const commandType = command.toLowerCase();
    if (commandType === 'inventory' || commandType === 'inv' || commandType === 'inventario') {
      const userName = users?.name || msg.pushName || 'Usuario';
      let invMessage = `*「✿」Inventario* ◢ ${userName} ◤\n`;
      invMessage += `⛁ Coins totales › *¥${((user.coins || 0) + (user.bank || 0)).toLocaleString()} ${currency}*\n`;
      invMessage += `♡ Salud › *${user.health || 0}/100*\n`;
      invMessage += `♛ Stamina › *${user.stamina || 0}/100*\n`;
      invMessage += `⸙ Magia › *${user.magic || 0}/100*\n`;
      let hasItems = false;
      if (user.weapons && Object.keys(user.weapons).length > 0) {
        hasItems = true;
        const weaponCount = Object.keys(user.weapons).length;
        invMessage += `\nꕥ Armas › *${weaponCount}*`;
        for (const [id, weapon] of Object.entries(user.weapons)) {
          const armaInfo = armas.find(a => a.id === id);
          if (armaInfo) {
            invMessage += `\n○ ${armaInfo.name} › *${weapon.durability}/${weapon.maxDurability}*`;
          }
        }
      }
      if (user.tools && Object.keys(user.tools).length > 0) {
        hasItems = true;
        const toolCount = Object.keys(user.tools).length;
        invMessage += `\n\n𖢺 Equipo › *${toolCount}*`;
        for (const [id, tool] of Object.entries(user.tools)) {
          const toolInfo = herramientas.find(t => t.id === id);
          if (toolInfo) {
            invMessage += `\n○ ${toolInfo.name} › *${tool.durability}/${tool.maxDurability}*`;
          }
        }
      }
      const tieneTotem = (user.inventory?.totem || 0) > 0;
      const tienePocion = (user.inventory?.pocion || 0) > 0;
      if (tieneTotem || tienePocion) {
        hasItems = true;
        invMessage += `\n\n𖣺 Consumibles`;
        if (tieneTotem) {
          invMessage += `\n○ Totem › *${user.inventory.totem}*`;
        }
        if (tienePocion) {
          invMessage += `\n○ Pocion › *${user.inventory.pocion}*`;
        }
      }
      if (!hasItems) {
        invMessage += `\n\nTu inventario está vacío.\nCompra items en la tienda usando: *${usedPrefix}shop*`;
      }
      await sock.sendMessage(msg.chat, { text: invMessage }, { quoted: msg });
      return;
    }
    if (commandType === 'shop' || commandType === 'tienda') {
      try {
        const armasDisponibles = armas.filter(item => !user.weapons?.[item.id]);
        const herramientasDisponibles = herramientas.filter(item => {
          if (item.id === 'totem' || item.id === 'pocion') {
            return true;
          }
          return !user.tools?.[item.id];
        });
        const itemsDisponibles = [...armasDisponibles, ...herramientasDisponibles];
        if (itemsDisponibles.length === 0) {
          return msg.reply(`*☆ Item Shop \`≧◠ᴥ◠≦\`*\n\nꕥ En estos momentos la tienda está cerrada por reabastecimiento.\n\n> ꕥ Has comprado todos los objetos disponibles.`);
        }
        const page = parseInt(args[0]) || 1;
        const porPagina = 10;
        const totalPaginas = Math.ceil(itemsDisponibles.length / porPagina);
        if (page < 1 || page > totalPaginas) {
          return msg.reply(`ꕥ Página inválida. Solo hay *${totalPaginas}* disponible${totalPaginas > 1 ? 's' : ''}.`);
        }
        const listado = [];
        const itemsPaginados = itemsDisponibles.slice((page - 1) * porPagina, page * porPagina);
        for (const item of itemsPaginados) {
          let descripcion = item.description;
          if (item.id === 'pocion') {
            const magiaActual = user.magic || 0;
            const magiaFaltante = 100 - magiaActual;
            const efecto = magiaFaltante > 0 ? Math.min(magiaFaltante, 100) : 0;
            if (efecto === 0) {
              descripcion = 'Poción mágica';
            } else {
              descripcion = `Restaura ${efecto} puntos de magia (${efecto}/100)`;
            }
          }
          let durabilidadText = '';
          if (item.tipo === 'Consumible') {
            durabilidadText = `ⴵ Usos » *${item.durability}*`;
          } else {
            durabilidadText = `ⴵ Durabilidad » *${item.durability}*`;
          }
          listado.push(`❀ *${item.name}* (${item.tipo}):\n> ⛁ Precio » *¥${item.price.toLocaleString()} ${currency}*\n> ❖ Descripcion » *${descripcion}*\n> ${durabilidadText}`);
        }
        const mensaje = `*☆ Item Shop \`≧◠ᴥ◠≦\`*\n❏ Objetos disponibles <${itemsDisponibles.length}>:\n\n` + listado.join('\n\n') + `\n\n> • Paginá *${page}* de *${totalPaginas}*`;
        msg.reply(mensaje);
      } catch (e) {
        await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
      }
      return;
    }
    if (commandType === 'buy' || commandType === 'comprar') {
      const itemArg = args[0];
      if (!itemArg) {
        return msg.reply(`ꕥ Especifica qué quieres comprar.\n> ✐ Ejemplo: *${usedPrefix}buy* espada\n> ✐ Ver tienda: *${usedPrefix}shop*`);
      }
      if (itemArg.toLowerCase() === 'all') {
        let totalCosto = 0;
        const itemsAComprar = [];
        const allItems = [...armas, ...herramientas];
        for (const item of allItems) {
          const categoria = armas.some(a => a.id === item.id) ? 'arma' : 'herramienta';
          let puedeComprar = true;
          if (categoria === 'arma') {
            if (user.weapons?.[item.id]) puedeComprar = false;
          } else if (categoria === 'herramienta' && item.id !== 'totem' && item.id !== 'pocion') {
            if (user.tools?.[item.id]) puedeComprar = false;
          }
          if (puedeComprar) {
            itemsAComprar.push(item);
            totalCosto += item.price;
          }
        }
        if (itemsAComprar.length === 0) {
          return msg.reply(`ꕥ Ya tienes todos los items disponibles.`);
        }
        if ((user.coins || 0) < totalCosto) {
          return msg.reply(`ꕥ No tienes suficientes ${currency} para comprar todo.\n⛁ Necesitas: *¥${totalCosto.toLocaleString()}*\n⛁ Tienes: *¥${(user.coins || 0).toLocaleString()}*`);
        }
        for (const item of itemsAComprar) {
          const categoria = armas.some(a => a.id === item.id) ? 'arma' : 'herramienta';
          if (categoria === 'arma') {
            user.weapons[item.id] = { durability: item.durability, maxDurability: item.durability };
          } else if (categoria === 'herramienta') {
            if (item.id === 'totem' || item.id === 'pocion') {
              user.inventory[item.id] = (user.inventory[item.id] || 0) + 1;
            } else {
              user.tools[item.id] = { durability: item.durability, maxDurability: item.durability };
            }
          }
        }
        db.setChatUser(msg.chat, msg.sender, 'weapons', user.weapons);
        db.setChatUser(msg.chat, msg.sender, 'tools', user.tools);
        db.setChatUser(msg.chat, msg.sender, 'inventory', user.inventory);
        db.setChatUser(msg.chat, msg.sender, 'coins', (user.coins || 0) - totalCosto);
        return msg.reply(`ꕥ Has comprado todos los items disponibles (${itemsAComprar.length} items) por *¥${totalCosto.toLocaleString()} ${currency}*.`);
      }
      const itemsInput = args.join(' ').split(',').map(item => item.trim().toLowerCase());
      const itemsToBuy = [];
      const itemsNoEncontrados = [];
      const itemsYaTiene = [];
      for (const itemInput of itemsInput) {
        let item = null;
        let categoria = null;
        item = armas.find(i => i.id === itemInput);
        if (item) categoria = 'arma';
        if (!item) {
          item = herramientas.find(i => i.id === itemInput);
          if (item) categoria = 'herramienta';
        }
        if (!item) {
          const allItems = [...armas, ...herramientas];
          const num = parseInt(itemInput);
          if (num >= 1 && num <= allItems.length) {
            item = allItems[num - 1];
            categoria = armas.some(a => a.id === item.id) ? 'arma' : 'herramienta';
          }
        }
        if (!item) {
          itemsNoEncontrados.push(itemInput);
          continue;
        }
        if (categoria === 'arma') {
          if (user.weapons?.[item.id]) {
            itemsYaTiene.push(item.name);
            continue;
          }
        } else if (categoria === 'herramienta' && item.id !== 'totem' && item.id !== 'pocion') {
          if (user.tools?.[item.id]) {
            itemsYaTiene.push(item.name);
            continue;
          }
        }
        itemsToBuy.push({ item, categoria });
      }
      if (itemsToBuy.length === 0) {
        let mensajeError = `ꕥ No se pudo comprar ningún item.`;
        if (itemsNoEncontrados.length > 0) {
          mensajeError += `\n> Items no encontrados: *${itemsNoEncontrados.join(', ')}*`;
        }
        if (itemsYaTiene.length > 0) {
          mensajeError += `\n> Ya tienes: *${itemsYaTiene.join(', ')}*`;
        }
        return msg.reply(mensajeError);
      }
      let costoTotal = 0;
      for (const { item } of itemsToBuy) {
        costoTotal += item.price;
      }
      if ((user.coins || 0) < costoTotal) {
        return msg.reply(`ꕥ No tienes suficientes ${currency}.\n⛁ Necesitas: *¥${costoTotal.toLocaleString()}*\n⛁ Tienes: *¥${(user.coins || 0).toLocaleString()}*`);
      }
      const itemsComprados = [];
      for (const { item, categoria } of itemsToBuy) {
        if (categoria === 'arma') {
          user.weapons[item.id] = { durability: item.durability, maxDurability: item.durability };
          itemsComprados.push(item.name);
        } else if (categoria === 'herramienta') {
          if (item.id === 'totem' || item.id === 'pocion') {
            user.inventory[item.id] = (user.inventory[item.id] || 0) + 1;
            itemsComprados.push(item.name);
          } else {
            user.tools[item.id] = { durability: item.durability, maxDurability: item.durability };
            itemsComprados.push(item.name);
          }
        }
      }
      db.setChatUser(msg.chat, msg.sender, 'weapons', user.weapons);
      db.setChatUser(msg.chat, msg.sender, 'tools', user.tools);
      db.setChatUser(msg.chat, msg.sender, 'inventory', user.inventory);
      db.setChatUser(msg.chat, msg.sender, 'coins', (user.coins || 0) - costoTotal);      
      let mensajeFinal = `ꕥ Compra exitosa:\n`;
      mensajeFinal += `> Items: *${itemsComprados.join(', ')}*\n`;
      mensajeFinal += `> Total: *¥${costoTotal.toLocaleString()} ${currency}*`;
      if (itemsNoEncontrados.length > 0 || itemsYaTiene.length > 0) {
        mensajeFinal += `\n\n> Notas:`;
        if (itemsNoEncontrados.length > 0) {
          mensajeFinal += `\n> • Items no encontrados: *${itemsNoEncontrados.join(', ')}*`;
        }
        if (itemsYaTiene.length > 0) {
          mensajeFinal += `\n> • Ya tienes: *${itemsYaTiene.join(', ')}*`;
        }
      }
      return msg.reply(mensajeFinal);
    }
  }
};