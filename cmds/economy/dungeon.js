import db from '#db';
export default {
  command: ['dungeon', 'mazmorra'],
  category: 'economy',
  description: 'Explorar mazmorras para ganar coins.',
  run: async ({ msg, sock, usedPrefix, text }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }    
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = db.getSettings(botId);
    const currency = settings.currency;
    db.setCreate('chat_users', [msg.chat, msg.sender], 'weapons', {});
    db.setCreate('chat_users', [msg.chat, msg.sender], 'lastdungeon', 0);    
    let user = db.getChatUser(msg.chat, msg.sender);
    if (user.weapons && typeof user.weapons === 'string') {
      try { user.weapons = JSON.parse(user.weapons); } catch { user.weapons = {}; }
    }    
    const staminaConsumed = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    if (user.stamina < staminaConsumed) {
      return msg.reply(`ꕥ No tienes suficiente stamina para volver asaltar la mazmorra.\n> Usa *${usedPrefix}heal* para curarte.`);
    }    
    let usingMagic = false;
    let usingWeapon = false;    
    if (user.weapons?.hacha) {
      if (user.weapons.hacha.durability <= 10) {
        delete user.weapons.hacha;
        db.setChatUser(msg.chat, msg.sender, 'weapons', user.weapons);
        return msg.reply(`ꕥ Tu Hacha se ha roto por el uso y ha sido eliminada de tu inventario.\n> Compra una nueva con: *${usedPrefix}buy hacha*`);
      }
      usingWeapon = true;
    } else {
      const magicConsumed = Math.floor(Math.random() * (12 - 1 + 1)) + 1;
      if (user.magic < magicConsumed) {
        return msg.reply(`ꕥ Tu magia está agotada y no tienes un arma.\n> Toma una poción para reabastecer tu magia o compra un arma con: *${usedPrefix}buy hacha*`);
      }
      usingMagic = true;
      user.magic -= magicConsumed;
      db.setChatUser(msg.chat, msg.sender, 'magic', user.magic);
    }    
    if (user.health < 5) {
      return msg.reply(`ꕥ No tienes suficiente salud para volver a la *mazmorra*.\n> Usa *${usedPrefix}heal* para curarte.`);
    }    
    if (Date.now() < user.lastdungeon) {
      const restante = user.lastdungeon - Date.now();
      return msg.reply(`ꕥ Debes esperar *${msToTime(restante)}* antes de volver a la mazmorra.`);
    }    
    user.stamina -= staminaConsumed;
    db.setChatUser(msg.chat, msg.sender, 'stamina', user.stamina);    
    const rand = Math.random();
    let cantidad = 0;
    let salud = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
    let durabilityConsumed = Math.floor(Math.random() * (15 - 1 + 1)) + 1;
    let message;    
    if (rand < 0.4) {
      if (usingWeapon) {
        user.weapons.hacha.durability -= durabilityConsumed;
        if (user.weapons.hacha.durability <= 10) {
          delete user.weapons.hacha;
        }
        db.setChatUser(msg.chat, msg.sender, 'weapons', user.weapons);
      }
      cantidad = Math.floor(Math.random() * (15000 - 12000 + 1)) + 12000;
      user.coins += cantidad;
      user.health -= salud;
      db.setChatUser(msg.chat, msg.sender, 'coins', user.coins);
      db.setChatUser(msg.chat, msg.sender, 'health', user.health);      
      const successMessages = [
        `Derrotaste al guardián de las ruinas y reclamaste el tesoro antiguo, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Descifraste los símbolos rúnicos y obtuviste recompensas ocultas, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Encuentras al sabio de la mazmorra, quien te premia por tu sabiduría, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `El espíritu de la reina ancestral te bendice con una gema de poder, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Superas la prueba de los espejos oscuros y recibes un artefacto único, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Derrotas a un gólem de obsidiana y desbloqueas un acceso secreto, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Salvas a un grupo de exploradores perdidos y ellos te recompensan, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Consigues abrir la puerta del juicio y extraes un orbe milenario, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Triunfas sobre un demonio ilusorio que custodiaba el sello perdido, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Purificas el altar corrompido y recibes una bendición ancestral, ganaste *¥${cantidad.toLocaleString()} ${currency}*.`
      ];
      message = pickRandom(successMessages);
    } else if (rand < 0.7) {
      if (usingWeapon) {
        user.weapons.hacha.durability -= durabilityConsumed;
        if (user.weapons.hacha.durability <= 10) {
          delete user.weapons.hacha;
        }
        db.setChatUser(msg.chat, msg.sender, 'weapons', user.weapons);
      }
      cantidad = Math.floor(Math.random() * (9000 - 7500 + 1)) + 7500;
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
      user.health -= salud;
      if (user.health < 0) user.health = 0;
      db.setChatUser(msg.chat, msg.sender, 'health', user.health);      
      const failMessages = [
        `Un espectro maldito te drena energía antes de que puedas escapar, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un basilisco te sorprende en la cámara oculta, huyes herido, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Una criatura informe te roba parte de tu botín en la oscuridad, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Fracasas al invocar un portal y quedas atrapado entre dimensiones, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Pierdes el control de una reliquia y provocas tu propia caída, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `Un grupo de espectros te rodea y te obliga a soltar tu tesoro, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `El demonio de las sombras te derrota y escapas con pérdidas, perdiste *¥${cantidad.toLocaleString()} ${currency}*.`
      ];
      message = pickRandom(failMessages);
    } else {
      const neutralMessages = [
        `Activaste una trampa, pero logras evitar el daño y aprendes algo nuevo.`,
        `La sala cambia de forma y pierdes tiempo explorando en círculos.`,
        `Caes en una ilusión, fortaleces tu mente sin obtener riquezas.`,
        `Exploras pasadizos ocultos y descubres símbolos misteriosos.`,
        `Encuentras un mural antiguo que revela secretos de la mazmorra.`
      ];
      message = pickRandom(neutralMessages);
    }    
    db.setChatUser(msg.chat, msg.sender, 'lastdungeon', Date.now() + 17 * 60 * 1000);
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