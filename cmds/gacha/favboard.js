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
  command: ['favtop', 'favoritetop', 'favboard'],
  category: 'gacha',
  description: 'Ver el top de personajes favoritos.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const chat = db.getChat(msg.chat);
    if (chat.adminonly || !chat.gacha) {
      return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
    }    
    try {
      const structure = await loadCharacters();
      const allCharacters = flattenCharacters(structure);      
      const allUsers = db.getUser();
      const counts = {};      
      for (const user of allUsers) {
        const favId = user.favorite;
        if (favId) counts[favId] = (counts[favId] || 0) + 1;
      }      
      const enriched = [];
      for (const c of allCharacters) {
        const character = db.getCharacter(c.id);
        const name = character?.name || c.name;
        enriched.push({ name, favorites: counts[c.id] || 0 });
      }      
      const filtered = enriched.filter(e => e.favorites > 0);     
      const page = parseInt(args[0]) || 1;
      const perPage = 10;
      const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
      if (page < 1 || page > totalPages) {
        return msg.reply(`ꕥ Página no válida. Hay un total de *${totalPages}* páginas.`);
      }      
      const sorted = filtered.sort((a, b) => b.favorites - a.favorites);
      const sliced = sorted.slice((page - 1) * perPage, page * perPage);     
      let replyText = '✰ Top de personajes favoritos:\n\n';
      sliced.forEach((char, i) => {
        replyText += `#${(page - 1) * perPage + i + 1} » *${char.name}*\n`;
        replyText += `   ♡ ${char.favorites} favorito${char.favorites !== 1 ? 's' : ''}.\n`;
      });      
      replyText += `\n> Página ${page} de ${totalPages}`;
      await sock.reply(msg.chat, msg.trim(), msg);
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};