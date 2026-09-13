export default {
  command: ['setgpbanner'],
  category: 'group',
  description: 'Cambiar la imagen del grupo.',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, usedPrefix, command }) => {
    const q = msg.quoted || msg;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    if (!/image/.test(mime)) {
      return msg.reply('《✧》 Te faltó la imagen para cambiar el perfil del grupo.');
    }
    const img = await q.download();
    if (!img) return msg.reply('《✧》 No se pudo descargar la imagen.');
    try {
      await sock.updateProfilePicture(msg.chat, img);
      msg.reply('✿ La imagen del grupo se actualizó con éxito.');
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};