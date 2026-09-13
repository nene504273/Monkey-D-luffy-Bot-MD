import db from '#db';
const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 1.5;

function xpRange(level, multiplier = global.multiplier || 2) {
  if (level < 0) throw new TypeError('level cannot be negative value');
  level = Math.floor(level);
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
  const max = Math.round(Math.pow(level + 1, growth) * multiplier);
  return { min, max, xp: max - min };
}

function findLevel(xp, multiplier = global.multiplier || 2) {
  if (xp === Infinity) return Infinity;
  if (isNaN(xp)) return NaN;
  if (xp <= 0) return -1;
  let level = 0;
  do { level++; } while (xpRange(level, multiplier).min <= xp);
  return --level;
}

function canLevelUp(level, xp, multiplier = global.multiplier || 2) {
  if (level < 0) return false;
  if (xp === Infinity) return true;
  if (isNaN(xp)) return false;
  if (xp <= 0) return false;
  return level < findLevel(xp, multiplier);
}

export async function before({ msg }) {
  db.setCreate('users', msg.sender, 'minxp', 0);
  db.setCreate('users', msg.sender, 'maxxp', 0);
  const user = db.getUser(msg.sender);
  const users = db.getChatUser(msg.chat, msg.sender);
  let before = user.level || 0;
  while (canLevelUp(user.level || 0, user.exp || 0, global.multiplier)) {
    db.setUser(msg.sender, 'level', (user.level || 0) + 1);
    user.level = (user.level || 0) + 1;
  }
  if (before !== user.level) {
    const coinBonus = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000;
    const expBonus = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
    if (user.level % 5 === 0) {
      db.setChatUser(msg.chat, msg.sender, 'coins', (users.coins || 0) + coinBonus);
      db.setUser(msg.sender, 'exp', (user.exp || 0) + expBonus);
    }
    const { min, max } = xpRange(user.level, global.multiplier);
    db.setUser(msg.sender, 'minxp', min);
    db.setUser(msg.sender, 'maxxp', max);
  }
}
