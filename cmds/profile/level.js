import db from '#db';

const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;

function xpRange(level, multiplier = global.multiplier || 2) {
  if (level < 0) throw new TypeError('level cannot be negative value');  
  level = Math.floor(level);
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
  const max = Math.round(Math.pow(level + 1, growth) * multiplier);  
  return { min, max, xp: max - min };
}

export default {
  command: ['level', 'lvl'],
  category: 'profile',
  description: 'Ver tu nivel y experiencia actual.',
  run: async ({ msg, sock, text }) => {
    const chatId = msg.chat;
    const who = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
    const user = db.getUser(who);
    if (!user) {
      return msg.reply(`「✎」 El usuario mencionado no está registrado en el bot.`);
    }
    const allUsers = db.getUser();
    const users = allUsers.map(u => ({ ...u, jid: u.id }));
    const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0));
    const rank = sortedLevel.findIndex(u => u.jid === who) + 1;
    const { min, xp } = xpRange(user.level, global.multiplier);
    const progresoActual = user.exp - min;
    const porcentaje = Math.floor((progresoActual / xp) * 100);
    const txt = `*「✿」Usuario* ◢ ${user.name} ◤

❖ Nivel › *${user.level || 0}*
☆ Experiencia › *${user.exp?.toLocaleString() || 0}*
➨ Progreso › *${progresoActual} => ${xp}* _(${porcentaje}%)_
✐ Puesto › *#${rank}*
❒ Comandos ejecutados › *${user.usedcommands?.toLocaleString() || 0}*`;
    await sock.sendMessage(chatId, { text: txt, mentions: [who] }, { quoted: msg });
  }
};