import moment from 'moment-timezone';
import db from '#db';

const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;

function xpRange(level, multiplier = global.multiplier || 2) {
  if (level < 0) throw new TypeError('level cannot be negative value');
  level = Math.floor(level);
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
  const max = Math.round(Math.pow(level + 1, growth) * multiplier);
  return { min, max, xp: max - min };
}

export default {
  command: ['profile', 'perfil'],
  category: 'profile',
  description: 'Ver tu perfil o el de un usuario.',
  run: async ({ msg, sock, usedPrefix, command }) => {
    const userId = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
    db.setCreate('chat_users', [msg.chat, userId], 'favorite', '');
    const chat = db.getChat(msg.chat) || {};
    let user = db.getChatUser(msg.chat, userId);    
    if (!user) {
      return msg.reply('✎ El usuario *mencionado* no está *registrado* en el bot');
    }
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net' || '';
    const settings = db.getSettings(idBot) || {};
    const currency = settings.currency || '';
    const user2 = db.getUser(userId) || {};
    const name = user2.name || '';
    const birth = user2.birth || 'Sin especificar';
    const genero = user2.genre || 'Oculto';
    const comandos = user2.usedcommands || '0';    
    let pareja = 'Nadie';
    if (user2.marry) {
      const partner = db.getUser(user2.marry) || {};
      pareja = partner?.name || 'Alguien';
    }
    const estadoCivil = genero === 'Mujer' ? 'Casada con' : genero === 'Hombre' ? 'Casado con' : 'Casadx con';
    const desc = user2.description ? `\n${user2.description}` : '';
    const pasatiempo = user2.pasatiempo ? `${user2.pasatiempo}` : 'No definido';
    const exp = user2.exp || 0;
    const nivel = user2.level || 0;
    const chocolates = user.coins || 0;
    const banco = user.bank || 0;
    const totalCoins = chocolates + banco;
    const favId = user.favorite;
    let favLine = '';
    if (favId) {
      const character = db.getCharacter(favId);
      if (character) {
        favLine = `\n๑ Claim favorito » *${character.name || '???'}*`;
      }
    }    
    const ownedIDs = Array.isArray(user.characters) ? user.characters : [];
    let haremValue = 0;    
    for (const id of ownedIDs) {
      const character = db.getCharacter(id);
      if (character) {
        haremValue += character.value || 0;
      }
    }    
    const haremCount = ownedIDs.length;
    const perfil = await sock.profilePictureUrl(userId, 'image').catch((_) => 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg');    
    const allUsers = db.getUser() || [];
    const users = Array.isArray(allUsers) ? allUsers.map(u => ({ ...u, jid: u.id })) : [];
    const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0));    
    try {
      const rank = sortedLevel.findIndex((u) => u.jid === userId) + 1;
      const { min, xp } = xpRange(nivel, global.multiplier);
      const progreso = exp - min;
      const porcentaje = xp > 0 ? Math.floor((progreso / xp) * 100) : 0;      
      const profileText = `「✿」 *Perfil* ◢ ${name} ◤${desc}

♛ Cumpleaños › *${birth}*
⸙ Pasatiempo › *${pasatiempo}*
⚥ Género › *${genero}*
♡ ${estadoCivil} › *${pareja}*

✿ Nivel › *${nivel}*
❀ Experiencia › *${exp.toLocaleString()}*
➨ Progreso › *${progreso} => ${xp}* _(${porcentaje}%)_
☆ Puesto › *#${rank}*

ꕥ Harem › *${haremCount}*
♤ Valor total › *${haremValue.toLocaleString()}*${favLine}
⛁ Coins totales › *¥${totalCoins.toLocaleString()} ${currency}*
❒ Comandos ejecutados › *${comandos.toLocaleString()}*`;     
      await sock.sendMessage(msg.chat, { image: { url: perfil }, caption: profileText }, { quoted: msg });
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};