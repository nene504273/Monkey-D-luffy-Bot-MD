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
  command: ['waifusboard', 'waifustop', 'topwaifus', 'wtop'],
  category: 'gacha',
  description: 'Ver el top de personajes con mayor valor.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    const chat = db.getChat(msg.chat);    
    if (chat.adminonly || !chat.gacha) {
      return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
    }    
    try {
      const structure = await loadCharacters();
      const allCharacters = flattenCharacters(structure);      
      const enriched = [];
      for (const c of allCharacters) {
        const character = db.getCharacter(c.id);
        const value = character?.value || Number(c.value || 0);
        enriched.push({ name: c.name, value, id: c.id });
      }      
      const page = parseInt(args[0]) || 1;
      const perPage = 10;
      const totalPages = Math.ceil(enriched.length / perPage);      
      if (page < 1 || page > totalPages) {
        return msg.reply(`ꕥ Página no válida. Hay un total de *${totalPages}* páginas.`);
      }      
      const sorted = enriched.sort((a, b) => b.value - a.value);
      const sliced = sorted.slice((page - 1) * perPage, page * perPage);      
      let message = '❀ *Personajes con más valor:*\n\n';
      sliced.forEach((char, i) => {
        message += `✰ ${((page - 1) * perPage) + i + 1} » *${char.name}*\n`;
        message += `   → Valor: *${char.value.toLocaleString()}*\n`;
      });     
      message += `\n⌦ Página *${page}* de *${totalPages}*`;      
      if (page < totalPages) {
        message += `\n> Para ver la siguiente página › *waifusboard ${page + 1}*`;
      }      
      await sock.sendMessage(msg.chat, { text: message.trim() }, { quoted: msg });      
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};