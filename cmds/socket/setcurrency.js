import db from '#db';
export default {
  command: ['setbotcurrency', 'setcurrency'],
  category: 'socket',
  description: 'Cambiar la moneda del bot.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    let config = db.getSettings(idBot) || {};
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(msg.sender);
    if (!isOwner2) return msg.reply(global.mess.socket);
    const value = args.join(' ').trim();
    if (!value) return msg.reply(`✐ Debes escribir un nombre de moneda valido.\n> Ejemplo: *${usedPrefix + command} Coins*`);
    db.setSettings(idBot, 'currency', value);
    return msg.reply(`✿ Se ha cambiado la moneda del bot a *${value}*`);
  },
};