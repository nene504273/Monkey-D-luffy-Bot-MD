import moment from 'moment-timezone';
import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  let userId = m.quoted?.sender || m.mentionedJid?.[0] || m.sender;
  let user = global.db.data.users[userId];

  // Valido estado premium actual xd 
  if (user.premium && user.premiumTime && user.premiumTime < Date.now()) {
    user.premium = false;
  }

  const isPremium = user.premium;
  const premiumRestante = isPremium ? await formatTime(user.premiumTime - Date.now()) : '';

  let name = await conn.getName(userId);
  let cumpleanos = user.birth || 'No especificado';
  let genero = user.genre || 'No especificado';
  let pareja = user.marry || 'Nadie';
  let description = user.description || 'Sin descripción';
  let exp = user.exp || 0;
  let nivel = user.level || 0;
  let role = user.role || 'Sin Rango';
  let coins = user.coin || 0;
  let bankCoins = user.bank || 0;
  let edad = user.age || 'Desconocida';

  let avatar = await conn.profilePictureUrl(userId, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg');
  const backgroundURL = encodeURIComponent('https://i.ibb.co.com/2jMjYXK/IMG-20250103-WA0469.jpg');
  const avatarURL = encodeURIComponent(avatar);

  const imageAPI = `https://api.siputzx.my.id/api/canvas/profile?backgroundURL=${backgroundURL}&avatarURL=${avatarURL}&rankName=${encodeURIComponent(role)}&rankId=0&exp=${exp}&requireExp=0&level=${nivel}&name=${encodeURIComponent(name)}`;

  try {
    await conn.sendFile(m.chat, imageAPI, 'perfil.jpg', `
「✿」 *Perfil de @${userId.split('@')[0]}*
✦ Edad: ${edad}
♛ Cumpleaños: ${cumpleanos}
⚥ Género: ${genero}
♡ Casado con: ${pareja}

✎ Rango: ${role}
☆ Exp: ${exp.toLocaleString()}
❖ Nivel: ${nivel}

⛁ Coins Cartera: ${coins.toLocaleString()} ${moneda}
⛃ Coins Banco: ${bankCoins.toLocaleString()} ${moneda}
❁ Premium: ${isPremium ? `✅ (Restante: ${premiumRestante})` : '❌'}

📝 Descripción: ${description}
`.trim(), m, false, { mentions: [userId] });
  } catch (e) {
    await conn.reply(m.chat, '❌ Error al generar el perfil.', m);
    console.error(e);
  }
};

handler.help = ['profile', 'perfil'];
handler.tags = ['rg'];
handler.command = ['profile', 'perfil'];

export default handler;

async function formatTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  let timeString = '';
  if (days) timeString += `${days} día${days > 1 ? 's' : ''} `;
  if (hours) timeString += `${hours} hora${hours > 1 ? 's' : ''} `;
  if (minutes) timeString += `${minutes} minuto${minutes > 1 ? 's' : ''} `;
  if (seconds) timeString += `${seconds} segundo${seconds > 1 ? 's' : ''} `;
  return timeString.trim();
}