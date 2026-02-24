async function handler(m, { conn, args, usedPrefix, command, participants }) {
  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  } else {
    who = m.chat;
  }

  // Mensaje si no menciona a nadie
  if (!who) {
    return m.reply(`¡Oye! 🍖 Necesito saber a quién le darás el botín. ¡Etiqueta a alguien o responde a su mensaje! \n> *Ejemplo:* ${usedPrefix + command} 1000 @nakama`);
  }

  let senderJid = m.sender;
  if (m.sender.endsWith('@lid') && m.isGroup) {
    const pInfo = participants.find(p => p.lid === m.sender);
    if (pInfo && pInfo.id) senderJid = pInfo.id; 
  }

  let targetJid = who;
  if (who.endsWith('@lid') && m.isGroup) {
    const pInfo = participants.find(p => p.lid === who);
    if (pInfo && pInfo.id) targetJid = pInfo.id; 
  }

  const amountText = args.find(arg => !arg.startsWith('@') && isNumber(arg));
  
  // Mensaje si no pone cantidad
  if (!amountText) {
    return m.reply(`¡Shishishi! 🏴‍☠️ ¡Casi se me olvida! ¿Cuántos ${m.moneda} vas a compartir? \n> *Usa:* ${usedPrefix + command} [cantidad] @usuario`);
  }

  const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, parseInt(amountText)));
  const user = global.db.data.users[senderJid];
  const type = 'coin';
  const bankType = 'bank';

  // Mensaje si no tiene dinero
  if (user[bankType] < count) {
    return m.reply(`¡Rayos! 😰 ¡No tienes suficiente para invitar la carne! Solo tienes *${user[bankType]}* en el banco.`);
  }

  if (!(targetJid in global.db.data.users)) {
    return m.reply(`¿Eh? 🤨 ¡Ese tipo no parece ser de mi tripulación! No está en mi base de datos.`);
  }

  // Mensaje si intenta enviarse a sí mismo
  if (targetJid === senderJid) {
    return m.reply(`¡No seas tonto! 😂 ¡No puedes darte un regalo a ti mismo! ¡Eso no es divertido!`);
  }

  // Proceso de transferencia
  user[bankType] -= count;
  global.db.data.users[targetJid][type] += count;

  const mentionText = `@${who.split('@')[0]}`;
  
  // Mensaje de éxito estilo Luffy
  m.reply(`¡ESTÁ DECIDIDO! 👒✨\n\n¡Le has entregado *${count.toLocaleString()} ${m.moneda}* a ${mentionText}!\n¡Ahora tenemos más para el banquete! 🍖\n\n> 💰 En tu cofre del banco aún quedan: *${user[bankType].toLocaleString()} ${m.moneda}*`, null, { mentions: [who] });
}

handler.help = ['pay <cantidad> @usuario'];
handler.tags = ['rpg'];
handler.command = ['pay', 'transfer', 'dar', 'enviar'];
handler.group = true;
handler.register = true;

export default handler;

function isNumber(x) {
  if (typeof x === 'string') { x = x.trim(); }
  return !isNaN(x) && x !== '';
}