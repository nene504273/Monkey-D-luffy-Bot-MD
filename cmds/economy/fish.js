import db from '#db';
export default {
  command: ['pescar', 'fish'],
  category: 'economy',
  description: 'Ganar coins pescando.',
  run: async ({ msg, sock, usedPrefix, text }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }    
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = db.getSettings(botId);
    const currency = settings.currency;
    db.setCreate('chat_users', [msg.chat, msg.sender], 'tools', {});
    db.setCreate('chat_users', [msg.chat, msg.sender], 'lastfish', 0);    
    let user = db.getChatUser(msg.chat, msg.sender);
    if (user.tools && typeof user.tools === 'string') {
      try { user.tools = JSON.parse(user.tools); } catch { user.tools = {}; }
    }    
    const staminaConsumed = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    if (user.stamina < staminaConsumed) {
      return msg.reply(`ꕥ No tienes suficiente energía para salir de pescar.\n> Usa *${usedPrefix}heal* para curarte.`);
    }    
    if (!user.tools?.caña) {
      return msg.reply(`ꕥ Necesitas una Caña de pescar para pescar.\n> Compra una en la tienda con: *${usedPrefix}buy caña*`);
    }    
    if (user.tools.caña.durability <= 10) {
      delete user.tools.caña;
      db.setChatUser(msg.chat, msg.sender, 'tools', user.tools);
      return msg.reply(`ꕥ Tu Caña de pescar se ha roto por el uso y ha sido eliminada de tu inventario.\n> Compra una nueva con: *${usedPrefix}buy caña*`);
    }    
    const remainingTime = user.lastfish - Date.now();
    if (remainingTime > 0) {
      return msg.reply(`ꕥ Debes esperar *${msToTime(remainingTime)}* antes de volver a pescar.`);
    }    
    user.stamina -= staminaConsumed;
    db.setChatUser(msg.chat, msg.sender, 'stamina', user.stamina);    
    const rand = Math.random();
    const durabilityConsumed = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
    let cantidad;
    let message;    
    if (rand < 0.4) {
      user.tools.caña.durability -= durabilityConsumed;
      if (user.tools.caña.durability <= 10) {
        delete user.tools.caña;
      }
      db.setChatUser(msg.chat, msg.sender, 'tools', user.tools);      
      cantidad = Math.floor(Math.random() * (8000 - 6000 + 1)) + 6000;
      user.coins += cantidad;
      db.setChatUser(msg.chat, msg.sender, 'coins', user.coins);      
      const successMessages = [
        `¡Has pescado un Salmón con tu Caña! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has pescado una Trucha con tu Caña! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Tiburón con tu Caña! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has pescado una Ballena con tu Caña! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Pez Payaso con tu Caña! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has atrapado una Anguila Dorada con tu Caña! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has pescado un Mero Gigante con tu Caña! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has capturado un Pulpo azul con tu Caña! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Sacaste una Carpa Real con tu Caña! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`,
        `¡Has conseguido un Pez Dragón con tu Caña! Ganaste *¥${cantidad.toLocaleString()} ${currency}*!`
      ];
      message = pickRandom(successMessages);
    } else if (rand < 0.7) {
      user.tools.caña.durability -= durabilityConsumed;
      if (user.tools.caña.durability <= 10) {
        delete user.tools.caña;
      }
      db.setChatUser(msg.chat, msg.sender, 'tools', user.tools);      
      cantidad = Math.floor(Math.random() * (6500 - 5000 + 1)) + 5000;
      const total = (user.coins || 0) + (user.bank || 0);
      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins -= cantidad;
          db.setChatUser(msg.chat, msg.sender, 'coins', user.coins);
        } else {
          const restante = cantidad - user.coins;
          user.coins = 0;
          user.bank -= restante;
          db.setChatUser(msg.chat, msg.sender, 'coins', 0);
          db.setChatUser(msg.chat, msg.sender, 'bank', user.bank);
        }
      } else {
        cantidad = total;
        user.coins = 0;
        user.bank = 0;
        db.setChatUser(msg.chat, msg.sender, 'coins', 0);
        db.setChatUser(msg.chat, msg.sender, 'bank', 0);
      }      
      const failMessages = [
        `El anzuelo de tu Caña se enredó y perdiste parte de tu equipo, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Una corriente fuerte arrastró tu Caña, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un pez grande rompió tu línea de la Caña y dañó tu aparejo, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Tu bote se golpeó contra las rocas y tuviste que reparar tu Caña, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `El pez escapó y arruinó tu red conectada a tu Caña, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `El pez mordió el anzuelo pero se soltó y dañó tu carrete de la Caña, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Tu cubeta se volcó y los peces atrapados con tu Caña se perdieron, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`
      ];
      message = pickRandom(failMessages);
    } else {
      const neutralMessages = [
        `Pasaste la tarde pescando con tu Caña y observando cómo los peces nadaban cerca.`,
        `El agua estuvo tranquila y los peces se acercaban sin morder el anzuelo de tu Caña.`,
        `Tu jornada de pesca fue serena con tu Caña, los peces nadaban alrededor sin ser atrapados.`,
        `Los peces se mostraron esquivos a tu Caña, pero la experiencia de pesca fue agradable.`,
        `El río estuvo lleno de peces curiosos que se acercaban sin ser capturados por tu Caña.`
      ];
      message = pickRandom(neutralMessages);
    }    
    db.setChatUser(msg.chat, msg.sender, 'lastfish', Date.now() + 8 * 60 * 1000);
    await sock.sendMessage(msg.chat, { text: `「✿」 ${message}` }, { quoted: msg });
  }
};

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const min = minutes < 10 ? '0' + minutes : minutes;
  const sec = seconds < 10 ? '0' + seconds : seconds;
  return min === '00' ? `${sec} segundo${sec > 1 ? 's' : ''}` : `${min} minuto${min > 1 ? 's' : ''}, ${sec} segundo${sec > 1 ? 's' : ''}`;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}