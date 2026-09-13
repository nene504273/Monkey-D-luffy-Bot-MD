import { promises as fs } from 'fs';
import db from '#db';

const charactersFilePath = './core/characters.json';

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8');
  return JSON.parse(data);
}

export default {
  command: ['serielist', 'slist', 'animelist'],
  category: 'gacha',
  description: 'Listar series del bot.',
  run: async ({ msg, args, usedPrefix, command }) => {
    try {
      const chat = db.getChat(msg.chat);
      if (chat.adminonly || !chat.gacha) {
        return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
      }      
      const structure = await loadCharacters();
      const seriesKeys = Object.keys(structure);
      const totalSeries = seriesKeys.length;
      const page = parseInt(args[0]) || 1;
      const perPage = 20;
      const totalPages = Math.max(1, Math.ceil(totalSeries / perPage));      
      if (page < 1 || page > totalPages) {
        return msg.reply(`ꕥ Página no válida. Hay un total de *${totalPages}* páginas.`);
      }      
      const start = (page - 1) * perPage;
      const end = Math.min(start + perPage, totalSeries);
      const seriesPage = seriesKeys.slice(start, end);      
      let replyText = `*❏ Lista de series (${totalSeries}):*\n\n`;     
      for (const key of seriesPage) {
        const serie = structure[key];
        const name = typeof serie.name === 'string' ? serie.name : key;
        const characters = Array.isArray(serie.characters) ? serie.characters.length : 0;
        replyText += `» *${name}* (${characters})\n`;
      }      
      replyText += `
> • _Página ${page}/${totalPages}_`;
      await msg.reply(replyText.trim());      
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};