export default {
  command: ['revoke', 'restablecer'],
  category: 'group',
  description: 'Restablecer el enlace del grupo.',
  botAdmin: true,
  run: async ({ msg, sock, usedPrefix, command }) => {
    try {
      await sock.groupRevokeInvite(msg.chat);
      const code = await sock.groupInviteCode(msg.chat);
      const link = `https://chat.whatsapp.com/${code}`;
      const teks = `﹒⌗﹒🌿 .ৎ˚₊‧  El enlace del grupo ha sido restablecido:\n\n𐚁 ֹ ִ \`NEW GROUP LINK\` ! ୧ ֹ ִ🔗\n☘️ \`Solicitado por :\` @${msg.sender.split('@')[0]}\n\n🌱 \`Enlace :\` ${link}`;
      await msg.react('🕒');
      await sock.reply(msg.chat, teks, msg, { mentions: [msg.sender] });
      await msg.react('✔️');
    } catch (e) {
      await msg.react('✖️');
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};