import db from '#db';
export default {
  command: ['self'],
  category: 'socket',
  description: 'Hacer privado o público tu bot.',
  run: async ({ msg, sock, args }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    let config = db.getSettings(idBot) || {};
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(msg.sender);
    if (!isOwner2) return msg.reply(global.mess.socket);
    const estado = config.self ? 1 : 0;
    if (args[0] === 'enable' || args[0] === 'on') {
      if (estado) return msg.reply('《✧》 El modo *Self* ya estaba activado.');
      db.setSettings(idBot, 'self', 1);
      return msg.reply('《✧》 Has *Activado* el modo *Self*.');
    }
    if (args[0] === 'disable' || args[0] === 'off') {
      if (!estado) return msg.reply('《✧》 El modo *Self* ya estaba desactivado.');
      db.setSettings(idBot, 'self', 0);
      return msg.reply('《✧》 Has *Desactivado* el modo *Privado*.');
    }
    return msg.reply(`*☆ Self (✿❛◡❛)*\n➮ *Estado ›* ${estado ? '✓ Activado' : '✗ Desactivado'}\n\n❀ Puedes cambiarlo con:\n> ● _Activar ›_ *self enable*\n> ● _Desactivar ›_ *self disable*`);
  },
};