import db from '#db';
export default {
  command: ['slut', 'prostituirse'],
  category: 'economy',
  description: 'Ganar coins con trabajos de riesgo.',
  run: async ({ msg, sock, usedPrefix, text }) => {
    const chatId = msg.chat;
    const senderId = msg.sender;    
    const chatData = db.getChat(chatId);
    if (chatData.adminonly || !chatData.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';    
    const botSettings = db.getSettings(botId);
    db.setCreate('chat_users', [chatId, senderId], 'lastslut', 0);    
    const user = db.getChatUser(chatId, senderId);    
    const cooldown = 5 * 60 * 1000;
    const now = Date.now();
    const remaining = (user.lastslut || 0) - now;
    const currency = botSettings.currency    
    if (remaining > 0) {
      return msg.reply(`✿ Debes esperar *${msToTime(remaining)}* antes de intentar nuevamente.`);
    }    
    const success = Math.random() < 0.5;
    const amount = success ? 
      Math.floor(Math.random() * (6000 - 3500 + 1)) + 3500 : 
      Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;    
    db.setChatUser(chatId, senderId, 'lastslut', now + cooldown);    
    const winMessages = [
      `Le acaricias el pene a un cliente habitual y ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `El admin se viene en tu boca, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `El admin te manosea las tetas, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Te vistieron de neko kwai en publico, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Te haces la Loli del admin por un día, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Te dejas manosear por un extraño por dinero, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Eres la maid del admin por un día, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Un gay te paga para que lo hagas con el, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Tu SuggarMommy muere, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Tu SuggarDaddy muere, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Dejaste que un extraño te toque el culo por dinero, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Alguien te pone una correa y eres su mascota sexual por una hora, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Te vistieron de colegiala en público, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Te vistieron de una milf en público, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Los integrantes del grupo te usaron como saco de cum, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Eres la perra de los admins por un día, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Unos Aliens te secuestraron y te usaron cómo objeto sexual, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
      `Un enano se culio tu pierna, ganaste *¥${amount.toLocaleString()} ${currency}*!`,
    ];
    const loseMessages = [
      `Tu energía se fue y no brillaste, perdiendo *¥${amount.toLocaleString()} ${currency}*.`,
      `Cometiste un error en tu actuación y perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `Un cliente malhumorado te causó problemas y perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `Tu atuendo no fue bien recibido y perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `El sonido falló en medio de tu actuación y perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `Un mal día en el club resultó en una pérdida de *¥${amount.toLocaleString()} ${currency}*.`,
      `Intentaste cobrarle al cliente equivocado y te denunciaron, perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `El admin te bloqueó después del servicio, perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `Te disfrazaste sin que nadie te pagara, perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `La SuggarMommy te dejó por una waifu nueva, perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `Un extraño te robó el cosplay antes del evento, perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `Te manosearon sin pagar nada, perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `El gay se arrepintió en el último segundo, perdiste *¥${amount.toLocaleString()} ${currency}*.`,
      `Los Aliens te devolvieron con trauma, perdiste *¥${amount.toLocaleString()} ${currency}*.`,
    ];
    const message = success ? winMessages[Math.floor(Math.random() * winMessages.length)] : loseMessages[Math.floor(Math.random() * loseMessages.length)];
    if (success) {
      db.setChatUser(chatId, senderId, 'coins', (user.coins || 0) + amount);
    } else {
      const total = (user.coins || 0) + (user.bank || 0);
      if (total >= amount) {
        if (user.coins >= amount) {
          db.setChatUser(chatId, senderId, 'coins', (user.coins || 0) - amount);
        } else {
          const remainingLoss = amount - (user.coins || 0);
          db.setChatUser(chatId, senderId, 'coins', 0);
          db.setChatUser(chatId, senderId, 'bank', (user.bank || 0) - remainingLoss);
        }
      } else {
        db.setChatUser(chatId, senderId, 'coins', 0);
        db.setChatUser(chatId, senderId, 'bank', 0);
      }
    }   
    await sock.sendMessage(chatId, { text: `「✿」 ${message}`, mentions: [senderId] }, { quoted: msg });
  }
};

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const pad = (n) => n.toString().padStart(2, '0');  
  if (minutes === 0) {
    return `${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`;
  }
  return `${pad(minutes)} minuto${minutes !== 1 ? 's' : ''}, ${pad(seconds)} segundo${seconds !== 1 ? 's' : ''}`;
};