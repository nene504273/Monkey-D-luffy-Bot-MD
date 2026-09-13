import db from '#db';
export default {
  command: ['count', 'mensajes', 'messages', 'msgcount'],
  category: 'group',
  description: 'Obtener el conteo de mensajes de un usuario.',
  run: async ({ msg, sock, args }) => {
    const chatId = msg.chat;
    const who = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
    let user = db.getChatUser(chatId, who);
    if (!user) {
      return msg.reply(`「✎」 El usuario mencionado no está registrado en el bot.`);
    }    
    let userStats = user.stats;
    const now = new Date();
    const daysArg = parseInt(args[0]) || 30;
    const cutoff = new Date(now.getTime() - daysArg * 24 * 60 * 60 * 1000);
    const days = Object.entries(userStats).filter(([date]) => new Date(date) >= cutoff).sort((a, b) => new Date(b[0]) - new Date(a[0]));
    const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0);
    const totalCmds = days.reduce((acc, [, d]) => acc + (d.cmds || 0), 0);
    let report = `❀ Contador de mensajes de @${who.split('@')[0]}\n`;
    report += `> Total en los últimos *${daysArg}* días: \`${totalMsgs}\` mensajes\n\n`;
    for (const [date, d] of days) {
      const fecha = new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' });
      report += `*❏ ${fecha}*\n`;
      report += `\t» Mensajes: \`${d.msgs || 0}\`, Comandos: \`${d.cmds || 0}\`\n`;
    }
    await sock.reply(chatId, report, msg, { mentions: [who] });
  }
};