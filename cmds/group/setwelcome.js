import db from '#db';
export default {
  command: ['setwelcome'],
  category: 'group',
  description: 'Establecer un mensaje de bienvenida personalizado.',
  isAdmin: true,
  run: async ({ msg, args, usedPrefix, command }) => {
    const chatId = msg.chat;
    let chat = db.getChat(chatId);
    if (!args.length) {
      return msg.reply(`ꕤ ꨩᰰ𑪐𑂺 ˳ ׄ Set Welcome ࣭𑁯ᰍ   ̊ ܃܃

*❒ Variables disponibles:*
𖣣ֶㅤ֯⌗ ✤ ⬭ @user    
> → Mención del usuario que ingresa

𖣣ֶㅤ֯⌗ ✤ ⬭ @group   
> → Nombre del grupo

𖣣ֶㅤ֯⌗ ✤ ⬭ @desc    
> → Descripción del grupo

𖣣ֶㅤ֯⌗ ✤ ⬭ @members 
> → Número de miembros actuales

𖣣ֶㅤ֯⌗ ✤ ⬭ @time    
> → Fecha y hora

✿ Si ya tienes un mensaje configurado y quieres borrarlo usa: *${usedPrefix + command} clear*`);
    }
    if (args[0] === 'clear') {
      if (!chat.sWelcome || chat.sWelcome.trim() === '') {
        return msg.reply('✎ No tienes ningún mensaje de bienvenida definido.');
      }
      chat.sWelcome = '';
      db.setChat(chatId, 'sWelcome', '');
      return msg.reply('✐ Mensaje de bienvenida eliminado.');
    }
    const texto = args.join(' ');
    chat.sWelcome = texto;
    db.setChat(chatId, 'sWelcome', texto);
    msg.reply(`ꕥ Has establecido el mensaje de bienvenida correctamente.`);
  }
};