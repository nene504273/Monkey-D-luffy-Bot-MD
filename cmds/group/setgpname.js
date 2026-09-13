export default {
  command: ['setgpname'],
  category: 'group',
  description: 'Cambiar el nombre del grupo.',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const newName = args.join(' ').trim();
    if (!newName) {
      return msg.reply('《✧》 Por favor, ingrese el nuevo nombre que desea ponerle al grupo.');
    }
    try {
      await sock.groupUpdateSubject(msg.chat, newName);
      msg.reply(`✿ El nombre del grupo se modificó correctamente.`);
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};