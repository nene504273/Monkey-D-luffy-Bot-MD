export default {
  command: ['setgpdesc'],
  category: 'group',
  description: 'Cambiar la descripción del grupo.',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const newDesc = args.join(' ').trim();
    if (!newDesc) {
      return msg.reply('《✧》 Por favor, ingrese la nueva descripción que desea ponerle al grupo.');
    }
    try {
      await sock.groupUpdateDescription(msg.chat, newDesc);
      msg.reply('✿ La descripción del grupo se modificó correctamente.');
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};