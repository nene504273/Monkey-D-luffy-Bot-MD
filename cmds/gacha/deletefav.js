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
  command: ['deletefav', 'delfav'],
  category: 'gacha',
  description: 'Borrar tu claim favorito.',
  run: async ({ msg, usedPrefix, command }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.gacha) {
      return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
    }
    db.setCreate('chat_users', [msg.chat, msg.sender], 'favorite', '');
    let user = db.getChatUser(msg.chat, msg.sender);    
    if (!user.favorite) {
      return msg.reply('❀ No tienes ningún personaje marcado como favorito.');
    }    
    const id = user.favorite;
    let name = '';    
    try {
      const character = db.getCharacter(id);
      name = character?.name || '';      
      if (!name) {
        const structure = await loadCharacters();
        const all = flattenCharacters(structure);
        const original = all.find(c => c.id === id);
        name = original?.name || 'personaje desconocido';
      }
      db.setChatUser(msg.chat, msg.sender, 'favorite', '');
      db.setUser(msg.sender, 'favorite', '');
      msg.reply(`✎ *${name}* ha dejado de ser tu personaje favorito.`);      
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};