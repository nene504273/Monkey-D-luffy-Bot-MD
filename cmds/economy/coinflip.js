import db from '#db';
export default {
  command: ['cf', 'flip', 'coinflip'],
  category: 'economy',
  description: 'Apostar coins en un cara o cruz.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = db.getSettings(botId);
    const monedas = botSettings.currency;
    db.setCreate('chat_users', [msg.chat, msg.sender], 'lastcoinflip', 0);
    const user = db.getChatUser(msg.chat, msg.sender);
    const cooldown = 10 * 1000;
    if (Date.now() < user.lastcoinflip) {
      const restante = user.lastcoinflip - Date.now();
      return msg.reply(`ꕥ Debes esperar *${msToTime(restante)}* antes de volver a usar ${command}.`);
    }
    let cantidad, eleccion;
    const a0 = parseFloat(args[0]);
    const a1 = parseFloat(args[1]);
    if (!isNaN(a0)) {
      cantidad = a0;
      eleccion = (args[1] || '').toLowerCase();
    } else if (!isNaN(a1)) {
      cantidad = a1;
      eleccion = (args[0] || '').toLowerCase();
    } else {
      return msg.reply(`ꕥ Cantidad inválida, ingresa un número válido.\n> Ejemplo » *${usedPrefix + command} 200 cara* o *${usedPrefix + command} cruz 200*`);
    }
    if (Math.abs(cantidad) < 100) {
      return msg.reply(`ꕥ La cantidad mínima para apostar es *100 ${monedas}*.`);
    }
    if (!['cara', 'cruz'].includes(eleccion)) {
      return msg.reply(`ꕥ Elección inválida. Solo se admite *cara* o *cruz*.\n> Ejemplo » *${usedPrefix + command} 200 cara*`);
    }
    if (cantidad > user.coins) {
      return msg.reply(`ꕥ No tienes suficientes *${monedas}* fuera del banco para apostar, tienes *¥${user.coins.toLocaleString()} ${monedas}*.`);
    }
    db.setChatUser(msg.chat, msg.sender, 'lastcoinflip', Date.now() + cooldown);
    const resultado = Math.random() < 0.5 ? 'cara' : 'cruz';
    const acierto = resultado === eleccion;
    const cambio = acierto ? cantidad : -cantidad;
    const newCoins = (user.coins || 0) + cambio;
    db.setChatUser(msg.chat, msg.sender, 'coins', newCoins < 0 ? 0 : newCoins);
    const mensaje = `「✿」La moneda ha caído en *${capitalize(resultado)}* y has ${acierto ? 'ganado' : 'perdido'} *¥${Math.abs(cambio).toLocaleString()} ${monedas}*!\n> Tu elección fue *${capitalize(eleccion)}*`;
    await sock.sendMessage(msg.chat, { text: mensaje }, { quoted: msg });
  }
};

function msToTime(duration) {
  const seconds = Math.floor(duration / 1000);
  return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
}

function capitalize(txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}