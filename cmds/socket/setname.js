import db from '#db';
export default {
  command: ['setbotname', 'setname'],
  category: 'socket',
  description: 'Cambiar el nombre del bot.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    let config = db.getSettings(idBot) || {};
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(msg.sender);
    if (!isOwner2) return msg.reply(global.mess.socket);
    const value = args.join(' ').trim();
    if (!value) return msg.reply(`✐ Debes escribir un nombre corto y un nombre largo valido.\n> Ejemplo: *${usedPrefix + command} Yuki / Yuki Suou*`);
    const formatted = value.replace(/\s*\/\s*/g, '/');
    let [short, long] = formatted.includes('/') ? formatted.split('/') : [value, value];
    if (!short || !long) return msg.reply('✎ Usa el formato: Nombre Corto / Nombre Largo');
    if (/\s/.test(short)) return msg.reply('❖ El nombre corto no puede contener espacios.');
    db.setSettings(idBot, 'namebot', short.trim());
    db.setSettings(idBot, 'botname', long.trim());
    return msg.reply(`✿ El nombre del bot ha sido actualizado!\n\n❒ Nombre corto: *${short.trim()}*\n❒ Nombre largo: *${long.trim()}*`);
  },
};