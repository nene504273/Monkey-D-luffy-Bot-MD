let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender];
  if (!user) return;

  // Variables no definidas antes - las asignamos
  const moneda = global.moneda || '⭐';
  const emoji3 = global.emoji3 || '⏳';

  // Tiempo de enfriamiento (10 minutos)
  let cooldown = 10 * 60 * 1000; // 600000 ms
  let time = user.lastmiming + cooldown;

  if (new Date() - user.lastmiming < cooldown) {
    return conn.reply(m.chat, `${emoji3} Debes esperar ${msToTime(time - new Date())} para volver a minar.`, m);
  }

  // Recursos aleatorios
  let coin = pickRandom([20, 5, 7, 8, 88, 40, 50, 70, 90, 999, 300]);
  let emerald = pickRandom([1, 5, 7, 8]);
  let iron = pickRandom([5, 6, 7, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]);
  let gold = pickRandom([20, 5, 7, 8, 88, 40, 50]);
  let coal = pickRandom([20, 5, 7, 8, 88, 40, 50, 80, 70, 60, 100, 120, 600, 700, 64]);
  let stone = pickRandom([200, 500, 700, 800, 900, 4000, 300]);

  // Imagen de fondo (puedes cambiarla por una URL fija)
  let img = 'https://i.ibb.co/8gX3qZJ/mina.jpg'; // Imagen de ejemplo

  let hasil = Math.floor(Math.random() * 1000);
  let info = `⛏️ *Te has adentrando en lo profundo de las cuevas*\n\n` +
             `> *🍬 Obtuviste estos recursos*\n\n` +
             `✨ *Exp*: ${hasil}\n` +
             `💸 *${moneda}*: ${coin}\n` +
             `♦️ *Esmeralda*: ${emerald}\n` +
             `🔩 *Hierro*: ${iron}\n` +
             `🏅 *Oro*: ${gold}\n` +
             `🕋 *Carbón*: ${coal}\n` +
             `🪨 *Piedra*: ${stone}`;

  // Enviar imagen con caption (usando sendMessage para mayor control)
  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption: info
  }, { quoted: m });

  await m.react('⛏️');

  // Actualizar datos del usuario
  user.health = Math.max(0, (user.health || 100) - 50);
  user.pickaxedurability = Math.max(0, (user.pickaxedurability || 100) - 30);
  user.coin = (user.coin || 0) + coin;
  user.iron = (user.iron || 0) + iron;
  user.gold = (user.gold || 0) + gold;
  user.emerald = (user.emerald || 0) + emerald;
  user.coal = (user.coal || 0) + coal;
  user.stone = (user.stone || 0) + stone;
  user.lastmiming = Date.now();
};

handler.help = ['minar'];
handler.tags = ['economy'];
handler.command = ['minar', 'miming', 'mine'];
handler.register = true;
handler.group = true;

export default handler;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return minutes + ' m y ' + seconds + ' s';
}