import db from '#db';
export default {
  command: ['delpasatiempo', 'removehobby'],
  category: 'profile',
  description: 'Eliminar tu pasatiempo del perfil.',
  run: async ({ msg }) => {
    const user = db.getUser(msg.sender);    
    if (!user.pasatiempo || user.pasatiempo === 'No definido') {
      return msg.reply('《✧》 No tienes ningún pasatiempo establecido.');
    }
    db.setUser(msg.sender, 'pasatiempo', '');
    return msg.reply(`✎ Se ha eliminado tu pasatiempo.`);
  },
};