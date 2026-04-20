let cooldowns = {};

let handler = async (m, { conn, usedPrefix }) => {
  let users = global.db.data.users;
  let senderId = m.sender;
  let senderName = conn.getName(senderId);
  const moneda = 'Berris 💰';

  if (!users[senderId]) users[senderId] = { coin: 0, bank: 0 };

  let tiempo = 5 * 60;
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000));
    return m.reply(`🏴‍☠️ ¡Aún estás descansando de tu último servicio, nakama! Vuelve en ⏱️ *${tiempo2}*.`);
  }
  cooldowns[senderId] = Date.now();

  let senderCoin = users[senderId].coin || 0;

  if (!m.isGroup) {
    return m.reply('🍖 ¡Este comando solo funciona en grupos, como una buena fiesta en el Thousand Sunny!');
  }

  let groupParticipants = [];
  try {
    let metadata = await conn.groupMetadata(m.chat);
    groupParticipants = metadata.participants.map(p => p.id);
  } catch (e) {
    return m.reply('❌ No pude obtener la lista de la tripulación.');
  }

  let possibleClients = groupParticipants.filter(id => id !== senderId);
  if (possibleClients.length === 0) {
    return m.reply('😭 No hay nadie más en el grupo... ¡Ni siquiera Zoro está para un favor!');
  }

  let clientId = possibleClients[Math.floor(Math.random() * possibleClients.length)];
  if (!users[clientId]) users[clientId] = { coin: 0, bank: 0 };

  let clientCoin = users[clientId].coin || 0;
  let clientName = '@' + clientId.split('@')[0];

  let minAmount = 1000;
  let maxAmount = 9000;
  let amount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
  let randomOption = Math.floor(Math.random() * 3);

  switch (randomOption) {
    case 0: {
      let taken = Math.min(amount, clientCoin);
      if (taken <= 0) {
        return m.reply(`😵 ${clientName} no tiene ni un solo Berry... ¡Está más pobre que Buggy el payaso!`);
      }
      users[senderId].coin += taken;
      users[clientId].coin -= taken;
      await conn.sendMessage(m.chat, {
        text: `💃 *¡SERVICIO EXITOSO!* 💃\n\n🍖 *${senderName}* atendió a ${clientName} y ganó *₱${taken} ${moneda}*.\n\n⚓ ¡Ese botín sabe bien! *+₱${taken}*`,
        mentions: [clientId]
      }, { quoted: m });
      break;
    }
    case 1: {
      let lost = Math.min(amount, senderCoin);
      if (lost <= 0) {
        return m.reply(`👮‍♂️ ¡Los marines te descubrieron! Pero como no tenías Berris, te dejaron con una advertencia.`);
      }
      users[senderId].coin -= lost;
      await conn.sendMessage(m.chat, {
        text: `👮‍♂️ *¡REDADA DE LOS MARINES!* 👮‍♂️\n\n🍖 *${senderName}* fue atrapado en pleno acto y perdió *₱${lost} ${moneda}*.\n\n😭 ¡Maldito Smoker!`,
        mentions: [senderId]
      }, { quoted: m });
      break;
    }
    case 2: {
      let partial = Math.floor(amount * 0.5);
      partial = Math.min(partial, clientCoin);
      if (partial <= 0) {
        return m.reply(`😵 ${clientName} se quedó sin Berris a medio servicio... ¡Qué mala suerte!`);
      }
      users[senderId].coin += partial;
      users[clientId].coin -= partial;
      await conn.sendMessage(m.chat, {
        text: `🍻 *¡SERVICIO RÁPIDO!* 🍻\n\n🍖 *${senderName}* hizo un trabajito express para ${clientName} y sacó *₱${partial} ${moneda}*.\n\n⚡ ¡Algo es algo! *+₱${partial}*`,
        mentions: [clientId]
      }, { quoted: m });
      break;
    }
  }

  global.db.write();
};

handler.tags = ['rpg'];
handler.help = ['slut'];
handler.command = ['slut', 'prostituirse'];
handler.register = true;
handler.group = true;

export default handler;

function segundosAHMS(segundos) {
  let horas = Math.floor(segundos / 3600);
  let minutos = Math.floor((segundos % 3600) / 60);
  let segundosRestantes = segundos % 60;
  return `${minutos} minutos y ${segundosRestantes} segundos`;
}