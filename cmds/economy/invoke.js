import db from '#db';
export default {
  command: ['ritual', 'invoke', 'invocar'],
  category: 'economy',
  description: 'Hacer ritos de invocación.',
  run: async ({ msg, sock, usedPrefix }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = db.getSettings(botId);
    const monedas = botSettings?.currency || 'Coins';
    db.setCreate('chat_users', [msg.chat, msg.sender], 'inventory', {});
    db.setCreate('chat_users', [msg.chat, msg.sender], 'lastinvoke', 0);    
    let user = db.getChatUser(msg.chat, msg.sender);
    if (user.inventory && typeof user.inventory === 'string') {
      try { user.inventory = JSON.parse(user.inventory); } catch { user.inventory = {}; }
    }    
    const staminaConsumed = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    if (user.stamina < 10) {
      return msg.reply(`ꕥ No tienes suficiente stamina para realizar un ritual.\n> Usa *${usedPrefix}heal* para curarte.`);
    }    
    const magicConsumed = Math.floor(Math.random() * (12 - 1 + 1)) + 1;
    if (user.magic < 10) {
      return msg.reply(`ꕥ No tienes suficiente magia para realizar un ritual.\n> Usa *${usedPrefix}pocion* para recuperarte.`);
    }    
    const saludConsumed = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
    if (user.health < 10) {
      return msg.reply(`ꕥ No tienes suficiente salud para realizar el ritual.\nUsa *${usedPrefix}heal* para curarte.`);
    }    
    if (!user.inventory?.totem || user.inventory.totem <= 0) {
      return msg.reply(`ꕥ Necesitas un Tótem de Invocación para realizar el ritual.\n> Compra en la tienda con: *${usedPrefix}buy totem*`);
    }    
    const remaining = user.lastinvoke - Date.now();
    if (remaining > 0) {
      return msg.reply(`ꕥ Debes esperar *${msToTime(remaining)}* para invocar otro ritual.`);
    }    
    user.stamina -= staminaConsumed;
    user.magic -= magicConsumed;
    user.health -= saludConsumed;
    user.inventory.totem -= 1;   
    db.setChatUser(msg.chat, msg.sender, 'stamina', user.stamina);
    db.setChatUser(msg.chat, msg.sender, 'magic', user.magic);
    db.setChatUser(msg.chat, msg.sender, 'health', user.health);
    db.setChatUser(msg.chat, msg.sender, 'inventory', user.inventory);    
    user.lastinvoke = Date.now() + 12 * 60 * 1000;
    db.setChatUser(msg.chat, msg.sender, 'lastinvoke', user.lastinvoke);    
    const roll = Math.random();
    let reward = 0;
    let narration = '';
    let bonusMsg = '';    
    if (roll < 0.05) {
      reward = Math.floor(Math.random() * (13000 - 11000 + 1)) + 11000;
      narration = pickRandom(legendaryInvocations);
      bonusMsg = '\nꕥ Recompensa LEGENDARIA obtenida!';
    } else {
      reward = Math.floor(Math.random() * (11000 - 8000 + 1)) + 8000;
      narration = pickRandom(normalInvocations);
      if (Math.random() < 0.15) {
        const bonus = Math.floor(Math.random() * (4500 - 2500 + 1)) + 2500;
        reward += bonus;
        bonusMsg = `\n「✿」 ¡Energía extra! Ganaste *${bonus.toLocaleString()}* ${monedas} adicionales`;
      }
    }    
    user.coins += reward;
    db.setChatUser(msg.chat, msg.sender, 'coins', user.coins);    
    let caption = `「✿」 ${narration}\nGanaste *${reward.toLocaleString()} ${monedas}*`;
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

const normalInvocations = [
  'Tu ritual abre un portal y caen riquezas ardientes del vacío',
  'Las velas se consumen y revelan un cofre lleno de monedas antiguas',
  'El círculo de invocación brilla y aparecen gemas relucientes',
  'Un espíritu menor te entrega un saco de oro como ofrenda',
  'Los cánticos atraen un espectro que deja riquezas a tus pies',
  'La luna ilumina tu altar y revela un tesoro escondido',
  'Un demonio amistoso surge y te paga por tu invocación',
  'El humo del incienso se transforma en monedas brillantes',
  'Los símbolos arcanos vibran y materializan riquezas inesperadas',
  'Un guardián espiritual aparece y te recompensa por tu fe'
];

const legendaryInvocations = [
  '¡Has invocado un espíritu ancestral que te entrega un tesoro legendario!',
  'Un dragón cósmico emerge del ritual y te concede riquezas infinitas',
  'Los dioses antiguos responden y derraman oro celestial sobre ti',
  'Un ángel guardián desciende y coloca un cofre sagrado en tus manos',
  'El portal dimensional se abre y un tesoro prohibido cae ante ti',
  'La tierra tiembla y un espíritu titánico te entrega riquezas ocultas',
  'Un fénix resucitado deja joyas ardientes como recompensa',
  'Los astros se alinean y un tesoro cósmico aparece en tu altar'
];