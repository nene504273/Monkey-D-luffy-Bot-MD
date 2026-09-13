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

export default {
  command: ['harem', 'waifus', 'claims'],
  category: 'gacha',
  description: 'Ver tus personajes reclamados.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    try {
      const chat = db.getChat(msg.chat);
      if (chat.adminonly || !chat.gacha) {
        return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
      }      
      const userId = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
      const userGlobal = db.getUser(userId);
      const name = userGlobal?.name || userId.split('@')[0];      
      const structure = await loadCharacters();
      const allCharacters = flattenCharacters(structure);
      let ownedIDs = [];
      const userData = db.getChatUser(msg.chat, userId);
      if (userData && userData.characters) {
        if (typeof userData.characters === 'string') {
          try { userData.characters = JSON.parse(userData.characters); } catch { userData.characters = []; }
        }
        ownedIDs = Array.isArray(userData.characters) ? userData.characters : [];
      }      
      if (ownedIDs.length === 0) {
        const isSelf = userId === msg.sender;
        const replyText = isSelf ? 'ꕥ No tienes personajes reclamados.' : `ꕥ *${name}* no tiene personajes reclamados.`;
        return sock.sendMessage(msg.chat, { text: replyText, mentions: [userId] }, { quoted: msg });
      }
      const charactersWithValues = [];
      for (const id of ownedIDs) {
        const globalChar = db.getCharacter(id);
        const chatChar = db.getCharacter(msg.chat + '__' + id);
        const value = typeof globalChar?.value === 'number' ? globalChar.value : chatChar?.value || 0;
        charactersWithValues.push({ id, value });
      }
      charactersWithValues.sort((a, b) => b.value - a.value);
      const sortedIDs = charactersWithValues.map(item => item.id);
      const page = parseInt(args[1]) || 1;
      const perPage = 64;
      const totalPages = Math.ceil(sortedIDs.length / perPage);
      if (page < 1 || page > totalPages) {
        return msg.reply(`❀ Página no válida. Hay un total de *${totalPages}* páginas.`);
      }
      const start = (page - 1) * perPage;
      const end = Math.min(start + perPage, sortedIDs.length);
      let message = `✿ Personajes reclamados ✿\n`;
      message += `⌦ Usuario: *${name}*\n`;
      message += `♡ Personajes: *(${sortedIDs.length})*\n\n`;
      for (let i = start; i < end; i++) {
        const id = sortedIDs[i];
        const globalChar2 = db.getCharacter(id);
        const chatChar2 = db.getCharacter(msg.chat + '__' + id);
        const jsonRec = allCharacters.find(c => c.id === id);
        const charName = jsonRec?.name || chatChar2?.name || globalChar2?.name || `ID:${id}`;
        const value = typeof globalChar2?.value === 'number' ? globalChar2.value : chatChar2?.value || 0;
        message += `» *${charName}* (*${value.toLocaleString()}*)\n`;
      }      
      message += `\n⌦ _Página *${page}* de *${totalPages}*_`;
      if (page < totalPages) {
        const nameArgs = args.filter(arg => isNaN(parseInt(arg))).join(' ');
        message += `\n> Usa *${usedPrefix}${command} ${nameArgs} ${page + 1}* para ver la siguiente página.`;
      }
      await sock.sendMessage(msg.chat, { text: message.trim(), mentions: [userId] }, { quoted: msg });
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};