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
  command: ['setfav', 'setfavourite'],
  category: 'gacha',
  description: 'Establecer tu claim favorito.',
  run: async ({ msg, args, usedPrefix, command }) => {
    const chat = db.getChat(msg.chat);    
    if (chat.adminonly || !chat.gacha) {
      return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
    }    
    if (!args.length) {
      return msg.reply(`❀ Debes especificar un personaje.\n> Ejemplo » *${usedPrefix + command} Yuki Suou*`);
    }
    db.setCreate('chat_users', [msg.chat, msg.sender], 'favorite', '');
    db.setCreate('users', msg.sender, 'favorite', '');    
    let user = db.getChatUser(msg.chat, msg.sender);    
    if (!Array.isArray(user.characters)) user.characters = [];    
    try {
      const structure = await loadCharacters();
      const allCharacters = flattenCharacters(structure);
      const name = args.join(' ').toLowerCase().trim();      
      const character = allCharacters.find(c => String(c.name).toLowerCase() === name) || allCharacters.find(c => String(c.name).toLowerCase().includes(name) || (Array.isArray(c.tags) && c.tags.some(tag => tag.toLowerCase().includes(name)))) || allCharacters.find(c => name.split(' ').some(q => String(c.name).toLowerCase().includes(q) || (Array.isArray(c.tags) && c.tags.some(tag => tag.toLowerCase().includes(q)))));      
      if (!character) return msg.reply(`ꕥ No se encontró el personaje *${name}*.`);      
      const isClaimed = user.characters.includes(character.id);
      if (!isClaimed) return msg.reply(`ꕥ El personaje *${character.name}* no está reclamado por ti.`);
      const previousId = user.favorite;
      db.setChatUser(msg.chat, msg.sender, 'favorite', character.id);
      db.setUser(msg.sender, 'favorite', character.id);
      if (previousId && previousId !== character.id) {
        const prevChar = db.getCharacter(previousId);
        const prevName = prevChar?.name || 'personaje anterior';
        return msg.reply(`❀ Se ha reemplazado tu favorito *${prevName}* por *${character.name}*!`);
      }      
      return msg.reply(`❀ Ahora *${character.name}* es tu personaje favorito!`);      
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};