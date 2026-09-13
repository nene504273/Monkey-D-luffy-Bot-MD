import db from '#db';
export default {
  command: ['mine', 'minar'],
  category: 'economy',
  description: 'Realizar trabajos de minería y ganar coins.',
  run: async ({ msg, sock, usedPrefix }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = db.getSettings(botId);
    const monedas = botSettings?.currency || 'Coins';
    db.setCreate('chat_users', [msg.chat, msg.sender], 'tools', {});
    db.setCreate('chat_users', [msg.chat, msg.sender], 'lastmine', 0);    
    let user = db.getChatUser(msg.chat, msg.sender);
    if (user.tools && typeof user.tools === 'string') {
      try { user.tools = JSON.parse(user.tools); } catch { user.tools = {}; }
    }    
    const staminaConsumed = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    if (user.stamina < staminaConsumed) {
      return msg.reply(`ꕥ No tienes suficiente energía para ir a minar.\n> Usa *${usedPrefix}heal* para curarte.`);
    }    
    if (!user.tools?.pico) {
      return msg.reply(`ꕥ Necesitas un Pico para minar.\n> Compra uno en la tienda con: *${usedPrefix}buy pico*`);
    }    
    if (user.tools.pico.durability <= 10) {
      delete user.tools.pico;
      db.setChatUser(msg.chat, msg.sender, 'tools', user.tools);
      return msg.reply(`ꕥ Tu Pico se ha roto por el uso y ha sido eliminado de tu inventario.\n> Compra uno nuevo con: *${usedPrefix}buy pico*`);
    }    
    const remaining = user.lastmine - Date.now();
    if (remaining > 0) {
      return msg.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para minar de nuevo.`);
    }    
    user.stamina -= staminaConsumed;
    db.setChatUser(msg.chat, msg.sender, 'stamina', user.stamina);    
    const durabilityConsumed = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
    user.tools.pico.durability -= durabilityConsumed;    
    if (user.tools.pico.durability <= 10) {
      delete user.tools.pico;
    }
    db.setChatUser(msg.chat, msg.sender, 'tools', user.tools);    
    user.lastmine = Date.now() + 10 * 60 * 1000;
    db.setChatUser(msg.chat, msg.sender, 'lastmine', user.lastmine);    
    let isLegendary = Math.random() < 0.02;
    let reward, narration, bonusMsg = '';    
    if (isLegendary) {
      reward = Math.floor(Math.random() * (13000 - 11000 + 1)) + 11000;
      narration = '¡DESCUBRISTE UN TESORO LEGENDARIO!\n\n';
      bonusMsg = '\nꕥ Recompensa ÉPICA obtenida!';
    } else {
      reward = Math.floor(Math.random() * (9500 - 7000 + 1)) + 7000;
      const scenario = pickRandom(escenarios);
      narration = `En ${scenario}, ${pickRandom(mineria)}`;
      if (Math.random() < 0.1) {
        const bonus = Math.floor(Math.random() * (4500 - 2500 + 1)) + 2500;
        reward += bonus;
        bonusMsg = `\n「✿」 ¡Bonus de minería! Ganaste *${bonus.toLocaleString()}* ${monedas} extra`;
      }
    }    
    user.coins += reward;
    db.setChatUser(msg.chat, msg.sender, 'coins', user.coins);    
    let caption = `「✿」 ${narration} *${reward.toLocaleString()} ${monedas}*`;
    if (bonusMsg) caption += `\n${bonusMsg}`;
    await sock.reply(msg.chat, caption, msg);
  }
};

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  if (minutes === '00') return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
  return `${minutes} minuto${minutes > 1 ? 's' : ''}, ${seconds} segundo${seconds > 1 ? 's' : ''}`;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const escenarios = [
  'una cueva oscura y húmeda',
  'la cima de una montaña nevada',
  'un bosque misterioso lleno de raíces',
  'un río cristalino y caudaloso',
  'una mina abandonada de carbón',
  'las ruinas de un antiguo castillo',
  'una playa desierta con arena dorada',
  'un valle escondido entre colinas',
  'un arbusto espinoso al borde del camino',
  'un tronco hueco en medio del bosque',
];

const mineria = [
  'encontraste un antiguo cofre con',
  'hallaste una bolsa llena de',
  'descubriste un saco de',
  'desenterraste monedas antiguas que contienen',
  'rompiste una roca y adentro estaba',
  'cavando profundo, hallaste',
  'entre las raíces, encontraste',
  'dentro de una caja olvidada, hallaste',
  'bajo unas piedras, descubriste',
  'entre los escombros de un lugar viejo, encontraste',
];