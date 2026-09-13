import db from '#db';
export default {
  command: ['setstatus'],
  category: 'socket',
  description: 'Cambiar el estado del bot.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const config = db.getSettings(idBot) || {};
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(msg.sender);
    if (!isOwner2) return msg.reply(global.mess.socket);
    const value = args.join(' ').trim();
    if (!value) return msg.reply(`✐ Debes escribir un estado valido.\n> Ejemplo: *${usedPrefix + command} Hola! soy Yuki Suou*`);
    await sock.updateProfileStatus(value);
    return msg.reply(`✿ Se ha actualizado el estado del bot a *${value}*!`);
  },
};