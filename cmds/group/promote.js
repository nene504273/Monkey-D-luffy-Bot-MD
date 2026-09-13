export default {
  command: ['promote', 'promover'],
  category: 'group',
  description: 'Ascender a un usuario a administrador.',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, usedPrefix, command, groupMetadata, participants }) => {
    const who = msg.mentionedJid?.[0] || msg.quoted?.sender;
    if (!who) return msg.reply('《✧》 Menciona al usuario que deseas promover a administrador.');
    try {
      const whoBase = who.split('@')[0];
      const participant = participants.find(p => p.id?.split('@')[0] === whoBase || p.lid?.split('@')[0] === whoBase);
      if (participant?.admin) {
        return sock.sendMessage(msg.chat, { text: `《✧》 *@${whoBase}* ya es administrador del grupo!`, mentions: [who] }, { quoted: msg });
      }
      const targetJid = participant?.id || who;
      await sock.groupParticipantsUpdate(msg.chat, [targetJid], 'promote');
      await sock.sendMessage(msg.chat, { text: `✿ *@${whoBase}* ha sido promovido a administrador del grupo!`, mentions: [who] }, { quoted: msg });
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};
