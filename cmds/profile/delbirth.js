import db from '#db';
export default {
  command: ['delbirth'],
  category: 'profile',
  description: 'Borrar tu fecha de cumpleaños.',
  run: async ({ msg }) => {
    const user = db.getUser(msg.sender);
    if (!user.birth) {
      return msg.reply(`《✧》 No tienes una fecha de nacimiento establecida.`);
    }    
    db.setUser(msg.sender, 'birth', '');
    return msg.reply(`✎ Tu fecha de nacimiento ha sido eliminada.`);
  },
};