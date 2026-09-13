import db from '#db';
export default {
  command: ['deldescription', 'deldesc'],
  category: 'profile',
  description: 'Eliminar tu descripción de perfil.',
  run: async ({ msg }) => {
    const user = db.getUser(msg.sender);
    if (!user.description) {
      return msg.reply(`《✧》 No tienes una descripción establecida.`);
    }    
    db.setUser(msg.sender, 'description', '');
    return msg.reply(`✎ Tu descripción ha sido eliminada.`);
  },
};