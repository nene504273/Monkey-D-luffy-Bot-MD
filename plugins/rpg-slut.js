let cooldowns = {};

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users;
  let senderId = m.sender;
  let senderName = conn.getName(senderId);
  const moneda = 'Berris';   // <--- Moneda fija como "Berris"

  let tiempo = 5 * 60; // 5 minutos de enfriamiento
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000));
    m.reply(`${emoji3} Debes esperar *${tiempo2}* para usar *#slut* de nuevo.`);
    return;
  }
  cooldowns[m.sender] = Date.now();

  let senderCoin = users[senderId].coin || 0;

  // Elegir un usuario aleatorio que no sea el que ejecuta el comando
  let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)];
  while (randomUserId === senderId) {
    randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)];
  }
  let randomUserCoin = users[randomUserId].coin || 0;
  let randomUserName = conn.getName(randomUserId);

  // Rango de ganancia/pérdida: 1000 a 9000 Berris
  let minAmount = 1000;
  let maxAmount = 9000;
  let amount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;

  let randomOption = Math.floor(Math.random() * 3); // 0, 1 o 2

  switch (randomOption) {
    case 0:
      // Éxito: se gana dinero de otro usuario
      users[senderId].coin += amount;
      users[randomUserId].coin -= amount;
      conn.sendMessage(m.chat, {
        text: `${emoji} ¡Se la chupaste a @${randomUserName} por *${amount} ${moneda}* y lo dejaste bien seco!\n\nSe suman *+${amount} ${moneda}* a ${senderName}.`,
        contextInfo: { mentionedJid: [randomUserId] }
      }, { quoted: m });
      break;

    case 1:
      // Fracaso: se pierde dinero
      let amountSubtracted = Math.min(amount, senderCoin);
      users[senderId].coin -= amountSubtracted;
      conn.reply(m.chat, `${emoji} No fuiste cuidadoso y le rompiste la verga a tu cliente, se te restaron *-${amountSubtracted} ${moneda}* a ${senderName}.`, m);
      break;

    case 2:
      // Otra variante de éxito
      let smallAmountTaken = Math.min(amount, randomUserCoin);
      users[senderId].coin += smallAmountTaken;
      users[randomUserId].coin -= smallAmountTaken;
      conn.sendMessage(m.chat, {
        text: `${emoji} Le diste unos sentones y te pagaron *${smallAmountTaken} ${moneda}* de @${randomUserName} y lo dejaste paralítico.\n\nSe suman *+${smallAmountTaken} ${moneda}* a ${senderName}.`,
        contextInfo: { mentionedJid: [randomUserId] }
      }, { quoted: m });
      break;
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