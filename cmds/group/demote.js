export default {
  command: ['demote', 'degradar'],
  category: 'group',
  description: 'Descender a un usuario de administrador.',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, usedPrefix, command, groupMetadata, participants }) => {
    const who = msg.mentionedJid?.[0] || msg.quoted?.sender;
    if (!who) return msg.reply('《✧》 Menciona al usuario que deseas degradar de administrador.');
    try {
      const ownerGroup = groupMetadata?.owner || msg.chat.split('-')[0] + '@s.whatsapp.net';
      const ownerBot = global.owner + '@s.whatsapp.net';
      const whoBase = who.split('@')[0];
      const participant = participants.find(p => p.id?.split('@')[0] === whoBase || p.lid?.split('@')[0] === whoBase);
      if (!participant?.admin) {
        return sock.sendMessage(msg.chat, { text: `《✧》 *@${whoBase}* no es administrador del grupo!`, mentions: [who] }, { quoted: msg });
      }
      const targetJid = participant?.id || who;
      if (targetJid === ownerGroup) return msg.reply('《✧》 No puedes degradar al creador del grupo de administrador.');
      if (targetJid === ownerBot) return msg.reply('《✧》 No puedes degradar al creador del bot de administrador.');
      if (targetJid === sock.decodeJid(sock.user.id)) return msg.reply('《✧》 No puedes degradar al bot de administrador.');
      await sock.groupParticipantsUpdate(msg.chat, [targetJid], 'demote');
      await sock.sendMessage(msg.chat, { text: `✿ *@${whoBase}* ha sido degradado de administrador del grupo!`, mentions: [who] }, { quoted: msg });
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};