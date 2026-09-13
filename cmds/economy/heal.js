import db from '#db';
export default {
  command: ['heal', 'curar', 'pocion', 'potion'],
  category: 'economy',
  description: 'Curar salud para salir de aventuras.',
  run: async ({ msg, sock, usedPrefix, command }) => {
    const chatData = db.getChat(msg.chat);
    if (chatData.adminonly || !chatData.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }    
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = db.getSettings(botId);
    const currency = bot.currency;    
    const who = msg.mentionedJid?.[0] || msg.quoted?.sender || null;
    let healer = db.getChatUser(msg.chat, msg.sender);
    let target = healer;
    if (healer.inventory && typeof healer.inventory === 'string') {
      try { healer.inventory = JSON.parse(healer.inventory); } catch { healer.inventory = {}; }
    }    
    if (who) {
      target = db.getChatUser(msg.chat, who);
      if (!target) {
        return msg.reply(`「✎」 El usuario mencionado no está registrado en el bot.`);
      }
    }    
    const targetUser = who ? db.getUser(who) : null;
    const cmd = command.toLowerCase();
    if (cmd === 'pocion' || cmd === 'potion') {
      if (!healer.inventory?.pocion || healer.inventory.pocion <= 0) {
        return msg.reply(`ꕥ No tienes poción en tu inventario.\n> Compra una en la tienda: ${usedPrefix}shop`);
      }      
      const magiaActual = target.magic || 0;
      const magiaFaltante = 100 - magiaActual;
      if (magiaFaltante <= 0) {
        const maximo = who ? `ꕥ La magia de *${targetUser?.name || who.split('@')[0]}* ya está al máximo, Magia actual: ${magiaActual}/100` : `ꕥ Tu magia ya está al máximo, Magia actual: ${magiaActual}/100`;
        return msg.reply(maximo);
      }      
      healer.inventory.pocion -= 1;
      if (healer.inventory.pocion <= 0) {
        delete healer.inventory.pocion;
      }
      db.setChatUser(msg.chat, msg.sender, 'inventory', healer.inventory);      
      const magiaRestaurada = Math.min(magiaFaltante, 100);
      target.magic = magiaActual + magiaRestaurada;
      if (who) {
        db.setChatUser(msg.chat, who, 'magic', target.magic);
      } else {
        db.setChatUser(msg.chat, msg.sender, 'magic', target.magic);
      }      
      const info = who ? `ꕥ Has usado una poción en *${targetUser?.name || who.split('@')[0]}* y restauraste *${magiaRestaurada}* puntos de magia.\n> Magia actual: ${target.magic}/100` : `ꕥ Has usado una poción y restauraste *${magiaRestaurada}* puntos de magia.\n> Magia actual: ${target.magic}/100`;
      return msg.reply(info);
    }    
    const saludActual = target.health || 0;
    const staminaActual = target.stamina || 0;
    const faltanteSalud = 100 - saludActual;
    const faltanteStamina = 100 - staminaActual;
    const necesitaCuracion = saludActual < 100 || staminaActual < 100;   
    if (!necesitaCuracion) {
      const maximo = who ? `ꕥ La salud y stamina de *${targetUser?.name || who.split('@')[0]}* ya están al máximo.\n> Salud: ${saludActual}/100 | Stamina: ${staminaActual}/100` : `ꕥ Tu salud y stamina ya están al máximo.\n> Salud: ${saludActual}/100 | Stamina: ${staminaActual}/100`;
      return msg.reply(maximo);
    }    
    const bloquesSalud = Math.ceil(faltanteSalud > 0 ? faltanteSalud / 10 : 0);
    const bloquesStamina = Math.ceil(faltanteStamina > 0 ? faltanteStamina / 10 : 0);    
    const costoS = bloquesSalud * 500;
    const costoSt = bloquesStamina * 300;
    const costoTotal = costoS + costoSt;
    const totalFondos = (healer.coins || 0) + (healer.bank || 0);    
    if (totalFondos < costoTotal) {
      const mensajeCostos = [];
      if (faltanteSalud > 0) mensajeCostos.push(`Salud: *¥${costoS.toLocaleString()}*`);
      if (faltanteStamina > 0) mensajeCostos.push(`Stamina: *¥${costoSt.toLocaleString()}*`);      
      const fondos = who ? `ꕥ No tienes suficientes ${currency} para curar a *${targetUser?.name || who.split('@')[0]}*.\n> Costos:\n> ${mensajeCostos.join('\n> ')}\n> Total necesario: *¥${costoTotal.toLocaleString()} ${currency}*` : `ꕥ No tienes suficientes ${currency} para curarte.\n> Costos:\n> ${mensajeCostos.join('\n> ')}\n> Total necesario: *¥${costoTotal.toLocaleString()} ${currency}*`;
      return msg.reply(fondos);
    }    
    if ((healer.coins || 0) >= costoTotal) {
      healer.coins -= costoTotal;
      db.setChatUser(msg.chat, msg.sender, 'coins', healer.coins);
    } else {
      const restante = costoTotal - (healer.coins || 0);
      healer.coins = 0;
      healer.bank = Math.max(0, (healer.bank || 0) - restante);
      db.setChatUser(msg.chat, msg.sender, 'coins', 0);
      db.setChatUser(msg.chat, msg.sender, 'bank', healer.bank);
    }    
    const curaciones = [];
    if (faltanteSalud > 0) {
      target.health = 100;
      if (who) {
        db.setChatUser(msg.chat, who, 'health', 100);
      } else {
        db.setChatUser(msg.chat, msg.sender, 'health', 100);
      }
      curaciones.push(`salud`);
    }
    if (faltanteStamina > 0) {
      target.stamina = 100;
      if (who) {
        db.setChatUser(msg.chat, who, 'stamina', 100);
      } else {
        db.setChatUser(msg.chat, msg.sender, 'stamina', 100);
      }
      curaciones.push(`stamina`);
    }    
    const curadoStr = curaciones.length === 1 ? curaciones[0] : `salud y stamina`;
    const info = who ? `ꕥ Has curado a *${targetUser?.name || who.split('@')[0]}* hasta el máximo nivel de ${curadoStr}.` : `ꕥ Te has curado hasta el máximo nivel de ${curadoStr}.`;    
    let detallesCosto = '';
    if (faltanteSalud > 0 && faltanteStamina > 0) {
      detallesCosto = `\n> Costo salud: *¥${costoS.toLocaleString()}*\n> Costo stamina: *¥${costoSt.toLocaleString()}*`;
    } else if (faltanteSalud > 0) {
      detallesCosto = `\n> Costo salud: *¥${costoS.toLocaleString()}*`;
    } else if (faltanteStamina > 0) {
      detallesCosto = `\n> Costo stamina: *¥${costoSt.toLocaleString()}*`;
    }    
    msg.reply(info + detallesCosto + `\n> Salud actual: ${target.health}/100\n> Stamina actual: ${target.stamina}/100`);
  }
};