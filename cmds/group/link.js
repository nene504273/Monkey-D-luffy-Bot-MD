export default {
  command: ['link'],
  category: 'group',
  description: 'Obtener el enlace del grupo.',
  botAdmin: true,
  run: async ({ msg, sock, usedPrefix, command }) => {
    try {
      const code = await sock.groupInviteCode(msg.chat);
      const link = `https://chat.whatsapp.com/${code}`;
      const teks = `﹒⌗﹒🌿 .ৎ˚₊‧  Aquí tienes el link del grupo:\n\n𐚁 ֹ ִ \`GROUP LINK\` ! ୧ ֹ ִ🔗\n☘️ \`Solicitado por :\` @${msg.sender.split('@')[0]}\n\n🌱 \`Enlace :\` ${link}`;
      await sock.reply(msg.chat, teks, msg, { mentions: [msg.sender] });
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};