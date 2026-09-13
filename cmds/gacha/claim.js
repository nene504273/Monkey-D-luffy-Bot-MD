import { promises as fs } from 'fs';
import db from '#db';

const charactersFilePath = './core/characters.json';

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8');
  return JSON.parse(data);
}

function getCharacterById(id, structure) {
  return Object.values(structure).flatMap(s => s.characters).find(c => String(c.id) === String(id));
}

export default {
  command: ['claim', 'c', 'reclamar'],
  category: 'gacha',
  description: 'Reclamar un personaje.',
  run: async ({ msg, sock, usedPrefix, command, text }) => {
    try {
      let chat = db.getChat(msg.chat);
      if (chat.adminonly || !chat.gacha) {
        return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con:\n» *${usedPrefix}gacha on*`);
      }
      db.setCreate('chat_users', [msg.chat, msg.sender], 'lastClaim', 0);
      let user = db.getChatUser(msg.chat, msg.sender);
      const me = user;
      const now = Date.now();
      const claimCooldown = 30 * 60 * 1000;
      if (me.lastClaim && now < me.lastClaim) {
        const remaining = Math.ceil((me.lastClaim - now) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        let timeText = '';
        if (minutes > 0) timeText += `${minutes} minuto${minutes !== 1 ? 's' : ''} `;
        if (seconds > 0 || timeText === '') timeText += `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
        return msg.reply(`ꕥ Debes esperar *${timeText.trim()}* para usar *${command}* de nuevo.`);
      }
      const quotedId = msg.quoted?.id;
      if (!quotedId || !chat.rolls[quotedId]) {
        return msg.reply(`❀ Debes citar un personaje válido para reclamar.`);
      }
      const rollData = chat.rolls[quotedId];
      const id = rollData.id;
      const charKey = rollData.charKey || (msg.chat + '__' + id);

      const structure = await loadCharacters();
      const sourceData = getCharacterById(id, structure);
      if (!sourceData) return msg.reply('ꕥ Personaje no encontrado en characters.json');

      db.setCreate('characters', charKey, 'name', sourceData.name);
      let character = db.getCharacter(charKey);
      if (!character) character = { name: sourceData.name, value: sourceData.value || 0, votes: 0 };

      if (character.reservedBy && character.reservedBy !== msg.sender && now < character.reservedUntil) {
        const reserver = db.getUser(character.reservedBy);
        const reserverName = reserver?.name || character.reservedBy.split('@')[0];
        const remaining = ((character.reservedUntil - now) / 1000).toFixed(1);
        return msg.reply(`ꕥ Este personaje está protegido por *${reserverName}* durante *${remaining}s.*`);
      }
      if (character.expiresAt && now > character.expiresAt && !character.user && !(character.reservedBy && now < character.reservedUntil)) {
        const expiredTime = ((now - character.expiresAt) / 1000).toFixed(1);
        return msg.reply(`ꕥ El personaje ha expirado » ${expiredTime}s.`);
      }
      if (character.user) {
        const owner = db.getUser(character.user);
        const ownerName = owner?.name || `@${character.user.split('@')[0]}`;
        return msg.reply(`ꕥ El personaje *${character.name}* ya ha sido reclamado por *${ownerName}*`);
      }
      character.user = msg.sender;
      character.claimedAt = now;
      delete character.reservedBy;
      delete character.reservedUntil;
      db.setCharacter(charKey, character);

      if (!Array.isArray(me.characters)) me.characters = [];
      if (!me.characters.includes(id)) me.characters.push(id);
      db.setChatUser(msg.chat, msg.sender, 'characters', me.characters);
      db.setChatUser(msg.chat, msg.sender, 'lastClaim', now + claimCooldown);
      chat.rolls[quotedId].claimed = true;
      db.setChat(msg.chat, 'rolls', chat.rolls);
      const userGlobal = db.getUser(msg.sender);
      const displayName = userGlobal?.name || msg.sender.split('@')[0];
      db.setCreate('users', msg.sender, 'claimMessage', '');
      const userWithMessage = db.getUser(msg.sender);
      const custom = userWithMessage?.claimMessage;
      const duration = ((now - character.expiresAt + 60000) / 1000).toFixed(1);
      const finalMessage = custom
        ? custom.replace(/€user/g, `*${displayName}*`).replace(/€character/g, `*${character.name}*`)
        : `*${character.name}* ha sido reclamado por *${displayName}*`;
      await sock.sendMessage(msg.chat, { text: `❀ ${finalMessage} (${duration}s)` }, { quoted: msg });
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};
