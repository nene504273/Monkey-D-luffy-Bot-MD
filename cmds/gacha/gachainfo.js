import { promises as fs } from 'fs';
import db from '#db';

const charactersFilePath = './core/characters.json';

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8');
  return JSON.parse(data);
}

function flattenCharacters(structure) {
  return Object.values(structure).flatMap(s => Array.isArray(s.characters) ? s.characters : []);
}

function formatTime(ms) {
  if (ms <= 0) return 'Ahora';
  const totalSec = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
  parts.push(`${seconds} segundo${seconds !== 1 ? 's' : ''}`);
  return parts.join(' ');
}

export default {
  command: ['gachainfo', 'ginfo', 'infogacha'],
  category: 'gacha',
  description: 'Ver tu información de gacha.',
  run: async ({ msg, sock, usedPrefix, command, text }) => {
    try {
      const chat = db.getChat(msg.chat);
      if (chat.adminonly || !chat.gacha) {
        return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
      }
      db.setCreate('chat_users', [msg.chat, msg.sender], 'lastRoll', 0);
      db.setCreate('chat_users', [msg.chat, msg.sender], 'lastClaim', 0);
      db.setCreate('chat_users', [msg.chat, msg.sender], 'lastrobwaifu', 0);
      db.setCreate('users', msg.sender, 'lastVote', 0);
      let user = db.getChatUser(msg.chat, msg.sender);
      const userGlobal = db.getUser(msg.sender);
      const now = Date.now();
      const rollLeft = user.lastRoll && now < user.lastRoll ? user.lastRoll - now : 0;
      const claimLeft = user.lastClaim && now < user.lastClaim ? user.lastClaim - now : 0;
      const robLeft = user.lastrobwaifu && now < user.lastrobwaifu ? user.lastrobwaifu - now : 0;
      const voteLeft = userGlobal.lastVote && now < userGlobal.lastVote ? userGlobal.lastVote - now : 0;
      const structure = await loadCharacters();
      const allCharacters = flattenCharacters(structure);
      const totalCharacters = allCharacters.length;
      const totalSeries = Object.keys(structure).length;
      if (user.characters && typeof user.characters === 'string') {
        try { user.characters = JSON.parse(user.characters); } catch { user.characters = []; }
      }      
      const claimedIDs = Array.isArray(user.characters) ? user.characters : [];
      let totalValue = 0;
      for (const id of claimedIDs) {
        const character = db.getCharacter(id);
        totalValue += character?.value || 0;
      }      
      const userName = userGlobal?.name || msg.sender.split('@')[0];
      const replyText = `*❀ Usuario \`<${userName}>\`*\n\nⴵ RollWaifu » *${formatTime(rollLeft)}*\nⴵ Claim » *${formatTime(claimLeft)}*\nⴵ Vote » *${formatTime(voteLeft)}*\nⴵ Robwaifu » *${formatTime(robLeft)}*\n\n♡ Personajes reclamados » *${claimedIDs.length}*\n✰ Valor total » *${totalValue.toLocaleString()}*\n❏ Personajes totales » *${totalCharacters}*\n❏ Series totales » *${totalSeries}*`;     
      await sock.sendMessage(msg.chat, { text: replyText.trim() }, { quoted: msg });      
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};