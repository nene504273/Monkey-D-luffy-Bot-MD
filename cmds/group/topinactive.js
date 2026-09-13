import db from '#db';
export default {
  command: ['topinactive', 'topinactivos', 'topinactiveusers'],
  category: 'group',
  description: 'Ver el top de usuarios más inactivos del grupo.',
  run: async ({ msg, sock, args, usedPrefix, text }) => {
    const chatId = msg.chat;
    const allChatUsers = db.getChatUser(chatId);
    const now = new Date();
    let daysArg = args[0] ? parseInt(args[0]) : 30;
    if (daysArg < 1) daysArg = 30;
    const cutoff = new Date(now.getTime() - daysArg * 24 * 60 * 60 * 1000);
    const ranking = [];
    for (const user of allChatUsers) {
      let stats = user.stats;
      if (!stats || typeof stats !== 'object') continue;
      const days = Object.entries(stats).filter(([date]) => new Date(date) >= cutoff);
      const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0);
      ranking.push({ jid: user.user_id, totalMsgs });
    }
    ranking.sort((a, b) => a.totalMsgs - b.totalMsgs);
    if (ranking.length === 0) {
      return msg.reply(`「✎」 No hay actividad registrada en los últimos ${daysArg} días.`);
    }
    const page = parseInt(args[1]) || 1;
    const perPage = 10;
    const totalPages = Math.ceil(ranking.length / perPage);
    if (page < 1 || page > totalPages) {
      return msg.reply(`「✎」 Página inválida. Solo hay ${totalPages} páginas disponibles.`);
    }
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pageRanking = ranking.slice(start, end);
    let report = `❀ Top de usuarios inactivos ❀\n`;
    report += `> » Días: \`${daysArg}\`\n`;
    report += `> » Página: \`${page}\` de \`${totalPages}\`\n\n`;
    const mentions = [];
    for (let i = 0; i < pageRanking.length; i++) {
      const u = pageRanking[i];
      const userGlobal = db.getUser(u.jid);
      const name = userGlobal?.name || '@' + u.jid.split('@')[0];
      report += `*${start + i + 1}.* ${name}\n`;
      report += `   » Mensajes: \`${u.totalMsgs}\`\n`;
      mentions.push(u.jid);
    }
    if (page < totalPages) {
      report += `\n> Para ver la siguiente página › *${text + usedPrefix} ${daysArg} ${page + 1}*`;
    }
    await sock.reply(chatId, report, msg, { mentions });
  }
};