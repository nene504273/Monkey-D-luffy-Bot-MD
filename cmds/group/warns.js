import db from '#db';
export default {
  command: ['warns'],
  category: 'group',
  description: 'Ver todas las advertencias de un miembro del grupo.',
  isAdmin: true,
  run: async ({ msg, sock }) => {
    const userId = msg.mentionedJid?.[0] || msg.quoted?.sender || null;
    if (!userId) {
      return msg.reply('《✧》 Menciona o responde a un usuario válido para ver sus advertencias.');
    }
    db.setCreate('chat_users', [msg.chat, userId], 'warnings', []);
    let user = db.getChatUser(msg.chat, userId);
    let warnings = user.warnings;
    if (typeof warnings === 'string') {
      try { warnings = JSON.parse(warnings); } catch { warnings = []; }
    }
    const total = warnings?.length || 0;
    if (total === 0) {
      return sock.reply(msg.chat, `《✧》 @${userId.split('@')[0]} no tiene advertencias registradas.`, msg, { mentions: [userId] });
    }
    const userGlobal = db.getUser(userId);
    const name = userGlobal?.name || 'Usuario';
    const warningList = warnings.map((w, i) => {
      const index = total - i;
      const author = w.by ? `\n> » Por: @${w.by.split('@')[0]}` : '';
      return `\`#${index}\` » ${w.reason}\n> » Fecha: ${w.timestamp}${author}`;
    }).join('\n');
    const mentions = [userId, ...warnings.map(w => w.by).filter(Boolean)];
    await sock.reply(msg.chat, `✐ Advertencias de @${userId.split('@')[0]} (${name}):\n> ✧ Total de advertencias: \`${total}\`\n\n${warningList}`, msg, { mentions });
  },
};