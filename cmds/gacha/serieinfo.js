import { promises as fs } from 'fs';
import db from '#db';

const charactersFilePath = './core/characters.json';

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8');
  return JSON.parse(data);
}

export default {
  command: ['serieinfo', 'ainfo', 'animeinfo'],
  category: 'gacha',
  description: 'Información de un anime.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    try {
      const chat = db.getChat(msg.chat);
      if (chat.adminonly || !chat.gacha) {
        return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
      }      
      if (!args.length) {
        return msg.reply(`❀ Debes especificar el nombre de un anime\n> Ejemplo » ${usedPrefix + command} Naruto`);
      }
      let page = 1;
      let seriesNameArgs = args;    
      const lastArg = args[args.length - 1];
      if (lastArg && !isNaN(lastArg) && parseInt(lastArg) > 0) {
        page = parseInt(lastArg);
        seriesNameArgs = args.slice(0, -1);
      }
      const query = seriesNameArgs.join(' ').toLowerCase().trim();
      const structure = await loadCharacters();
      const entries = Object.entries(structure);      
      const match = entries.find(([, s]) => (typeof s.name === 'string' && s.name.toLowerCase().includes(query)) || (Array.isArray(s.tags) && s.tags.some(t => t.toLowerCase().includes(query)))) || (entries.filter(([, s]) => (typeof s.name === 'string' && query.split(' ').some(w => s.name.toLowerCase().includes(w))) || (Array.isArray(s.tags) && s.tags.some(t => query.split(' ').some(w => t.toLowerCase().includes(w)))))[0] || []);
      const [seriesKey, seriesData] = match;
      if (!seriesKey || !seriesData) {
        return msg.reply(`ꕥ No se encontró la serie *${query}*\n> Puedes sugerirlo usando el comando *${usedPrefix}suggest sugerencia de serie: ${query}*`);
      }
      let list = Array.isArray(seriesData.characters) ? seriesData.characters : [];
      const total = list.length;     
      const allChatUsers = db.getChatUser(msg.chat);
      for (const u of allChatUsers) {
        if (u.characters && typeof u.characters === 'string') {
          try { u.characters = JSON.parse(u.characters); } catch { u.characters = []; }
        }
      }
      const claimedList = list.filter(c => allChatUsers.some(u => Array.isArray(u.characters) && u.characters.includes(c.id)));
      for (const c of list) {
        const character = db.getCharacter(c.id);
        if (character) {
          c.value = character.value || Number(c.value || 0);
        } else {
          c.value = Number(c.value || 0);
        }
      }
      list.sort((a, b) => b.value - a.value);
      const perPage = 50;
      const totalPages = Math.ceil(list.length / perPage);
      if (page < 1 || page > totalPages) {
        return msg.reply(`❀ Página no válida. Hay un total de *${totalPages}* páginas.`);
      }
      const startIndex = (page - 1) * perPage;
      const endIndex = Math.min(startIndex + perPage, list.length);
      const pageCharacters = list.slice(startIndex, endIndex);
      let replyText = `*❀ Fuente: \`<${seriesData.name || seriesKey}>\`*\n\n`;
      replyText += `❏ Personajes » *\`${total}\`*\n`;
      replyText += `♡ Reclamados » *\`${claimedList.length}/${total} (${((claimedList.length / total) * 100).toFixed(0)}%)\`*\n`;
      replyText += `❏ Lista de personajes:\n\n`;
      for (const c of pageCharacters) {
        const ownerEntry = allChatUsers.find(u => Array.isArray(u.characters) && u.characters.includes(c.id));       
        let ownerName = 'desconocido';
        if (ownerEntry) {
          const ownerGlobal = db.getUser(ownerEntry.user_id);
          ownerName = ownerGlobal?.name?.trim() || ownerEntry.user_id.split('@')[0];
        }        
        const status = ownerEntry ? `Reclamado por *${ownerName}*` : 'Libre';
        replyText += `» *${c.name}* (${c.value.toLocaleString()}) • ${status}.\n`;
      }      
      replyText += `\n> ⌦ _Página *${page}* de *${totalPages}*_`;
      if (page < totalPages) {
        replyText += `\n> Usa *${usedPrefix}${command} ${seriesNameArgs.join(' ')} ${page + 1}* para ver la siguiente página.`;
      }   
      await sock.reply(msg.chat, replyText.trim(), msg);
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};
