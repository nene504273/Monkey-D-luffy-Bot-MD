import chalk from 'chalk';
import db from '#db';

const limpiarRolls = async () => {
  try {
    const now = Date.now();
    const allChats = db.getChat();    
    for (const chat of allChats) {
      if (!chat.rolls) continue;      
      let rolls = chat.rolls;
      let cambios = false;      
      for (const msgId of Object.keys(rolls)) {
        const roll = rolls[msgId];
        const expirado = roll.expiresAt && now > roll.expiresAt;
        const reclamado = roll.claimed === true;
        if (expirado || reclamado) {
          delete rolls[msgId];
          cambios = true;
        }
      }      
      if (cambios) {
        db.setChat(chat.id, 'rolls', rolls);
      }
    }
  } catch (e) {
    console.log(chalk.gray('Error limpiando rolls'));
  }
};

setInterval(limpiarRolls, 1800000);
limpiarRolls();