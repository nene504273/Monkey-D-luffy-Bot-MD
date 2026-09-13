import db from '#db';
export default {
  command: ['divorce'],
  category: 'profile',
  description: 'Divorciarte de tu pareja.',
  run: async ({ msg }) => {
    const user = db.getUser(msg.sender);
    const partnerId = user?.marry;    
    if (!partnerId) {
      return msg.reply(`《✧》 Tú no estás ${user.genre === 'Mujer' ? 'casada' : user.genre === 'Hombre' ? 'casado' : 'casadx'} con nadie.`);
    }    
    const partner = db.getUser(partnerId);
    db.setUser(msg.sender, 'marry', '');
    db.setUser(partnerId, 'marry', '');    
    return msg.reply(`✎ *${user?.name || msg.sender.split('@')[0]}* te has divorciado de *${partner?.name || partnerId.split('@')[0]}*.`);
  },
};
