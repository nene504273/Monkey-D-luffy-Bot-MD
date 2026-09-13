import db from '#db';
export default {
  command: ['delwarn'],
  category: 'group',
  description: 'Eliminar una advertencia de un miembro del grupo.',
  isAdmin: true,
  run: async ({ msg, sock, args }) => {
    const chat = db.getChat(msg.chat);
    const targetId = msg.mentionedJid?.[0] || msg.quoted?.sender || null;
    if (!targetId) {
      return msg.reply('《✧》 Debes mencionar o responder al usuario cuya advertencia deseas eliminar.');
    }
    db.setCreate('chat_users', [msg.chat, targetId], 'warnings', []);
    let user = db.getChatUser(msg.chat, targetId);
    if (!user) {
      return msg.reply('《✧》 No se encontró al usuario en la base de datos.');
    }
    let warnings = user.warnings;
    if (typeof warnings === 'string') {
      try { warnings = JSON.parse(warnings); } catch { warnings = []; }
    }
    const total = warnings?.length || 0;
    if (total === 0) {
      return sock.reply(msg.chat, `《✧》 El usuario @${targetId.split('@')[0]} no tiene advertencias registradas.`, msg, { mentions: [targetId] });
    }
    const userGlobal = db.getUser(targetId);
    const name = userGlobal?.name || 'Usuario';
    const rawIndex = (msg.mentionedJid?.length > 0) ? args[1] : args[0];
    if (rawIndex?.toLowerCase() === 'all') {
      warnings = [];
      db.setChatUser(msg.chat, targetId, 'warnings', warnings);
      return sock.reply(msg.chat, `✐ Se han eliminado todas las advertencias del usuario @${targetId.split('@')[0]} (${name}).`, msg, { mentions: [targetId] });
    }
    const index = parseInt(rawIndex);
    if (isNaN(index)) {
      return msg.reply('《✧》 Debes especificar el índice de la advertencia que deseas eliminar o usar all para borrar todas.');
    }
    if (index < 1 || index > total) {
      return msg.reply(`ꕥ El índice debe ser un número entre 1 y ${total}.`);
    }
    const realIndex = total - index;
    warnings.splice(realIndex, 1);
    db.setChatUser(msg.chat, targetId, 'warnings', warnings);
    await sock.reply(msg.chat, `ꕥ Se ha eliminado la advertencia #${index} del usuario @${targetId.split('@')[0]} (${name}).`, msg, { mentions: [targetId] });
  },
};