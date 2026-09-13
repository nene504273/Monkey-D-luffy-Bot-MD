import { promises as fs } from 'fs';
import db from '#db';

const FILE_PATH = './core/characters.json';

async function loadCharacters() {
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, '{}');
  }
  const raw = await fs.readFile(FILE_PATH, 'utf-8');
  return JSON.parse(raw);
}

function flattenCharacters(db) {
  return Object.values(db).flatMap(s => Array.isArray(s.characters) ? s.characters : []);
}

function getSeriesNameByCharacter(db, id) {
  return Object.entries(db).find(([, serie]) => Array.isArray(serie.characters) && serie.characters.some(c => String(c.id) === String(id)))?.[1]?.name || 'Desconocido';
}

function formatElapsed(ms) {
  if (!ms || ms <= 0) return '—';
  const sec = Math.floor(ms / 1000);
  const w = Math.floor(sec / 604800);
  const d = Math.floor((sec % 604800) / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts = [];
  if (w > 0) parts.push(`${w}w`);
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);
  return parts.join(' ');
}

export default {
  command: ['charinfo', 'winfo', 'waifuinfo'],
  category: 'gacha',
  description: 'Ver información de un personaje.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    try {
      const chat = db.getChat(msg.chat);
      if (chat.adminonly || !chat.gacha) {
        return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
      }      
      if (!args.length) {
        return msg.reply(`❀ Por favor, proporciona el nombre de un personaje.\n> Ejemplo » *${usedPrefix + command} Yuki Suou*`);
      }      
      const structure = await loadCharacters();
      const allCharacters = flattenCharacters(structure);
      const nameQuery = args.join(' ').toLowerCase().trim();      
      const character = allCharacters.find(c => String(c.name).toLowerCase() === nameQuery) || allCharacters.find(c => String(c.name).toLowerCase().includes(nameQuery) || (Array.isArray(c.tags) && c.tags.some(tag => tag.toLowerCase().includes(nameQuery)))) || allCharacters.find(c => nameQuery.split(' ').some(q => String(c.name).toLowerCase().includes(q) || (Array.isArray(c.tags) && c.tags.some(tag => tag.toLowerCase().includes(q)))));      
      if (!character) {
        return msg.reply(`ꕥ No se encontró el personaje *${nameQuery}*.`);
      }      
      const source = getSeriesNameByCharacter(structure, character.id);
      let characterData = db.getCharacter(character.id);
      if (!characterData) {
        characterData = { name: character.name, value: Number(character.value) || 100, votes: 0 };
        db.setCharacter(character.id, characterData);
      }      
      const allChatUsers = db.getChatUser(msg.chat);
      for (const u of allChatUsers) {
        if (u.characters && typeof u.characters === 'string') {
          try { u.characters = JSON.parse(u.characters); } catch { u.characters = []; }
        }
      }      
      const userEntry = allChatUsers.find(u => Array.isArray(u.characters) && u.characters.includes(character.id));      
      let ownerName = 'Desconocido';
      let claimedDateLine = '';      
      if (userEntry) {
        const ownerGlobal = db.getUser(userEntry.user_id);
        ownerName = ownerGlobal?.name?.trim() || userEntry.user_id.split('@')[0];
        const claimedChar = db.getCharacter(msg.chat + '__' + character.id);
        if (claimedChar?.claimedAt) {
          claimedDateLine = `\nⴵ Fecha de reclamo » *${new Date(claimedChar.claimedAt).toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}*`;
        }
      }      
      const lastVoteAgo = typeof characterData.lastVotedAt === 'number' ? `hace *${formatElapsed(Date.now() - characterData.lastVotedAt)}*` : '*Nunca*';
      const allCharacters_data = [];
      for (const c of allCharacters) {
        const charData = db.getCharacter(c.id);
        if (charData?.value) {
          allCharacters_data.push({ name: c.name, value: charData.value });
        }
      }      
      const sorted = allCharacters_data.sort((a, b) => b.value - a.value);
      const rank = sorted.findIndex(c => c.name === character.name) + 1 || '—';     
      const caption = `❀ Nombre » *${characterData.name}*
⚥ Género » *${character.gender || 'Desconocido'}*
✰ Valor » *${characterData.value.toLocaleString()}*
♡ Estado » ${userEntry ? `Reclamado por *${ownerName}*` : '*Libre*'}${claimedDateLine}
❖ Fuente » *${source}*
❏ Puesto » *#${rank}*
ⴵ Último voto » ${lastVoteAgo}`.trim();     
      await sock.sendMessage(msg.chat, { text: caption }, { quoted: msg });     
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};