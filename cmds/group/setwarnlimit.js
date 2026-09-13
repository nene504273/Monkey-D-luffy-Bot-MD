import db from '#db';
export default {
  command: ['setwarnlimit'],
  category: 'group',
  description: 'Establecer el límite de advertencias del grupo.',
  isAdmin: true,
  run: async ({ msg, args, usedPrefix, command }) => {
    db.setCreate('chats', msg.chat, 'expulsar', 0);
    db.setCreate('chats', msg.chat, 'warnLimit', 0);
    let chat = db.getChat(msg.chat);
    const raw = args[0];
    const limit = parseInt(raw);
    if (isNaN(limit) || limit < 0 || limit > 10) {
      return msg.reply(`✐ El límite de advertencias debe ser un número entre \`1\` y \`10\`, o \`0\` para desactivar.\n> Ejemplo 1 › *${usedPrefix + command} 5*\n> Ejemplo 2 › *${usedPrefix + command} 0*\n\n> Si usas \`0\`, se desactivará la función de eliminar usuarios al alcanzar el límite de advertencias.\n❖ Estado actual: ${chat.expulsar ? `\`${chat.warnLimit}\` advertencias` : '`Desactivado`'}`);
    }
    if (limit === 0) {
      chat.warnLimit = 0;
      chat.expulsar = 0;
      db.setChat(msg.chat, 'warnLimit', 0);
      db.setChat(msg.chat, 'expulsar', 0);
      return msg.reply(`✐ Has desactivado la función de eliminar usuarios al alcanzar el límite de advertencias.`);
    }
    chat.warnLimit = limit;
    chat.expulsar = 1;
    db.setChat(msg.chat, 'warnLimit', limit);
    db.setChat(msg.chat, 'expulsar', 1);
    await msg.reply(`✐ Límite de advertencias establecido en \`${limit}\` para este grupo.\n> ❖ Los usuarios serán eliminados automáticamente al alcanzar este límite.`);
  },
};
