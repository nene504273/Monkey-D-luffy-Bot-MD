import db from '#db';
export default {
  command: ['delgenre'],
  category: 'profile',
  description: 'Eliminar tu género del perfil.',
  run: async ({ msg }) => {
    const user = db.getUser(msg.sender);
    if (!user.genre) {
      return msg.reply(`《✧》 No tienes un género asignado.`);
    }    
    db.setUser(msg.sender, 'genre', '');
    return msg.reply(`✎ Tu género ha sido eliminado.`);
  },
};