import db from '#db';
export default {
  command: ['setdescription', 'setdesc'],
  category: 'profile',
  description: 'Establecer tu descripción de perfil.',
  run: async ({ msg, args, usedPrefix, command }) => {
    const user = db.getUser(msg.sender);
    const input = args.join(' ');    
    if (!input) return msg.reply(`《✧》 Debes especificar una descripción válida para tu perfil.\n\n> ✐ Ejemplo » *${usedPrefix + command} Hola, uso WhatsApp!*`);    
    db.setUser(msg.sender, 'description', input);
    return msg.reply(`✎ Se ha establecido tu descripcion, puedes revisarla con ${usedPrefix}profile ฅ^•ﻌ•^ฅ`);
  },
};