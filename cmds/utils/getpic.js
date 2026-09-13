export default {
  command: ['pfp', 'getpic'],
  category: 'utils',
  description: 'Ver la foto de perfil de un usuario.',
  run: async ({ msg, sock, usedPrefix, command, text }) => {
    const who = msg.mentionedJid?.[0] || msg.quoted?.sender || null;
    if (!who) {
      return msg.reply(`《✧》 Etiqueta o menciona al usuario del que quieras ver su foto de perfil.`);
    }
    try {
      const img = await sock.profilePictureUrl(who, 'image').catch(() => null);
      if (!img) {
        return sock.sendMessage(msg.chat, { text: `《✧》 No se pudo obtener la foto de perfil de @${who.split('@')[0]}.`, mentions: [who] }, { quoted: msg });
      }
      await sock.sendMessage(msg.chat, { image: { url: img }, caption: null }, { quoted: msg });
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};