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
  command: ['delchar', 'deletewaifu', 'delwaifu'],
  category: 'gacha',
  description: 'Eliminar un personaje reclamado.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    try {
      const chat = db.getChat(msg.chat);
      if (chat.adminonly || !chat.gacha) {
        return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
      }
      db.setCreate('chat_users', [msg.chat, msg.sender], 'favorite', '');
      let user = db.getChatUser(msg.chat, msg.sender);
      if (!Array.isArray(user.characters) || !user.characters.length) {
        return msg.reply(`❀ No tienes personajes reclamados en tu harem.`);
      }      
      if (!args.length) {
        return msg.reply(`❀ Debes especificar un personaje para eliminar.\n> Ejemplo » *${usedPrefix + command} Yuki Suou*`);
      }      
      const inputName = args.join(' ').toLowerCase().trim();
      const structure = await loadCharacters();
      const allCharacters = flattenCharacters(structure);
      const character = allCharacters.find(c => c.name.toLowerCase() === inputName);
      if (!character) {
        return msg.reply(`ꕥ No se ha encontrado ningún personaje con el nombre *${inputName}*\n> Puedes sugerirlo usando *${usedPrefix}suggest personaje ${inputName}*`);
      }      
      if (!user.characters.includes(character.id)) {
        return msg.reply(`ꕥ *${character.name}* no está reclamado por ti.`);
      }
      const charKey = msg.chat + '__' + character.id;
      let characterData = db.getCharacter(charKey);
      if (characterData && characterData.user === msg.sender) {
        delete characterData.user;
        delete characterData.claimedAt;
        db.setCharacter(charKey, characterData);
      }
      user.characters = user.characters.filter(id => id !== character.id);
      db.setChatUser(msg.chat, msg.sender, 'characters', user.characters);
      if (user.favorite === character.id) {
        db.setChatUser(msg.chat, msg.sender, 'favorite', '');
        db.setUser(msg.sender, 'favorite', '');
      }
      await sock.sendMessage(msg.chat, { text: `❀ *${character.name}* ha sido eliminado de tu lista de reclamados.` }, { quoted: msg });      
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};