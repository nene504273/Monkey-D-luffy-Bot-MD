import db from '#db';
const formatTiempo = (ms) => {
  if (typeof ms !== 'number' || isNaN(ms)) return 'desconocido';
  const h = Math.floor(ms / 3600000);
  const min = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const parts = [];
  if (h) parts.push(`${h} ${h === 1 ? 'hora' : 'horas'}`);
  if (min) parts.push(`${min} ${min === 1 ? 'minuto' : 'minutos'}`);
  if (s || (!h && !min)) parts.push(`${s} ${s === 1 ? 'segundo' : 'segundos'}`);
  return parts.join(' ');
};

export async function before({ msg, sock }) {
  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const chatData = db.getChat(msg.chat);
  const primaryBot = chatData.primaryBot;
  if (primaryBot && botJid !== primaryBot) return;
  const settings = db.getSettings(botJid);
  const currency = settings?.currency || 'coins';
  let user = db.getChatUser(msg.chat, msg.sender);
  if (typeof user.afk === 'number' && user.afk > -1) {
    const ms = Date.now() - user.afk;
    const minutos = Math.floor(ms / 60000);
    const horas = Math.floor(ms / 3600000);
    let coins = minutos * 8;
    const bonos = Math.floor(horas / 3);
    for (let i = 0; i < bonos; i++) {
      coins += Math.floor(Math.random() * (1500 - 300 + 1)) + 300;
    }
    const newCoins = (user.coins || 0) + coins;
    db.setChatUser(msg.chat, msg.sender, 'coins', newCoins);
    const tiempo = formatTiempo(ms);
    const recompensa = coins > 0 ? `\n> ○ Recompensa » *${coins} ${currency}*` : '';
    const userData = db.getUser(msg.sender);
    await sock.reply(msg.chat, `ꕥ *${userData?.name || 'Usuario'}* Dejaste de estar inactivo.\n> ○ Motivo » *${user.afkReason || 'sin especificar'}*\n> ○ Tiempo inactivo » *${tiempo}* ${recompensa}`, msg);
    db.setChatUser(msg.chat, msg.sender, 'afk', -1);
    db.setChatUser(msg.chat, msg.sender, 'afkReason', '');
  }
  let jids = [...(msg.mentionedJid || []), ...(msg.quoted?.sender ? [msg.quoted.sender] : [])];
  jids = [...new Set(jids.filter(j => j && j.endsWith('@s.whatsapp.net') && j !== 'status@broadcast'))];
  for (const jid of jids) {
    const target = db.getChatUser(msg.chat, jid);
    if (!target || typeof target.afk !== 'number' || target.afk < 0) continue;
    const ms = Date.now() - target.afk;
    const tiempo = formatTiempo(ms);
    const userData = db.getUser(jid);
    await sock.reply(msg.chat, `ꕥ El usuario *${userData?.name || 'Usuario'}* está AFK.\n> ○ Motivo » *${target.afkReason || 'sin especificar'}*\n> ○ Tiempo inactivo » *${tiempo}*`, msg);
    msg.isCommands = true;
  }
  return true;
};