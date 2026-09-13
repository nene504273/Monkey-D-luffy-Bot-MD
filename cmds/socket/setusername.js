import db from '#db';
export default {
  command: ['setusername'],
  category: 'socket',
  description: 'Cambiar el nombre de usuario del bot.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const config = db.getSettings(idBot) || {};
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(msg.sender);
    if (!isOwner2) return msg.reply(global.mess.socket);
    const value = args.join(' ').trim();
    if (!value) return msg.reply(`✎ Debes escribir un nombre de usuario valido.\n> Ejemplo: *${usedPrefix + command} Yuki Suou*`);
    await sock.updateProfileName(value);
    return msg.reply(`✿ El nombre de usuario del bot ha sido actualizado a *${value}*!`);
  },
};