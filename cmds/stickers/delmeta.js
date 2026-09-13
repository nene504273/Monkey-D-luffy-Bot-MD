import db from '#db';
export default {
  command: ['delmeta', 'delstickermeta'],
  category: 'stickers',
  description: 'Restablecer el pack y autor por defecto para tus stickers.',
  run: async ({ msg, sock, usedPrefix, command, text }) => {
    try {
      const userData = db.getUser(msg.sender);
      if ((!userData.metadatos || userData.metadatos === '') && (!userData.metadatos2 || userData.metadatos2 === '')) {
        return msg.reply('《✧》No tienes metadatos asignados.');
      }
      db.setUser(msg.sender, 'metadatos', '');
      db.setUser(msg.sender, 'metadatos2', '');
      await sock.sendMessage(msg.chat, { text: `✎ Los metadatos de tus stickers se han eliminado correctamente.` }, { quoted: msg });
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};