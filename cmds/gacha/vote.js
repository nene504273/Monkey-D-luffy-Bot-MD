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

function getSeriesNameByCharacter(structure, characterId) {
  return Object.values(structure).find(s => Array.isArray(s.characters) && s.characters.some(c => String(c.id) === String(characterId)))?.name || 'Desconocido';
}

export default {
  command: ['vote', 'votar'],
  category: 'gacha',
  description: 'Votar por un personaje para subir su valor.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    try {
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const settings = db.getSettings(botId);
      const isOficialBot = botId === ((global.sock?.user?.id?.split(':')[0] ?? null) && ((global.sock?.user?.id?.split(':')[0] ?? null) && (global.sock.user.id.split(':')[0] + '@s.whatsapp.net')));
      const isPremiumBot = settings?.botprem === 1;
      const isModBot = settings?.botmod === 1;
      if (!isOficialBot && !isPremiumBot && !isModBot) {
        return sock.reply(msg.chat, `《✧》El comando *${command}* no está disponible en *Sub-Bots.*`, msg);
      }
      const chat = db.getChat(msg.chat);
      if (chat.adminonly || !chat.gacha) {
        return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
      }
      db.setCreate('users', msg.sender, 'lastVote', 0);
      const user = db.getUser(msg.sender);
      const now = Date.now();
      const cooldown = 1 * 60 * 60 * 1000;
      if (user.lastVote && now < user.lastVote) {
        const timeLeft = Math.ceil((user.lastVote - now) / 1000);
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        let timeText = '';
        if (hours > 0) timeText += `${hours} hora${hours !== 1 ? 's' : ''} `;
        if (minutes > 0) timeText += `${minutes} minuto${minutes !== 1 ? 's' : ''} `;
        if (seconds > 0 || timeText === '') timeText += `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
        return msg.reply(`ꕥ Debes esperar *${timeText.trim()}* para usar *${command}* de nuevo.`);
      }      
      const name = args.join(' ').trim();
      if (!name) return msg.reply('❀ Debes especificar un personaje para votarlo.');
      const structure = await loadCharacters();
      const allCharacters = flattenCharacters(structure);
      const character = allCharacters.find(c => c.name.toLowerCase() === name.toLowerCase());      
      if (!character) {
        return msg.reply(`ꕥ Personaje no encontrado. Asegúrate de que el nombre esté correcto.`);
      }      
      let characterData = db.getCharacter(character.id);      
      if (!characterData) {
        characterData = { name: character.name, value: Number(character.value || 0), votes: 0, dailyIncrement: {} };
      }      
      if (!characterData.dailyIncrement) characterData.dailyIncrement = {};      
      if (characterData.lastVotedAt && now < characterData.lastVotedAt + cooldown) {
        const remaining = characterData.lastVotedAt + cooldown - now;
        const totalSec = Math.ceil(remaining / 1000);
        const h = Math.floor(totalSec / 3600);
        const m_ = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        let timeText = '';
        if (h > 0) timeText += `${h} hora${h !== 1 ? 's' : ''} `;
        if (m_ > 0) timeText += `${m_} minuto${m_ !== 1 ? 's' : ''} `;
        if (s > 0 || timeText === '') timeText += `${s} segundo${s !== 1 ? 's' : ''}`;
        return msg.reply(`ꕥ *${characterData.name}* ha sido votada recientemente.\n> Debes esperar *${timeText.trim()}* para votarla de nuevo.`);
      }      
      const today = new Date().toISOString().slice(0, 10);
      const currentValue = characterData.dailyIncrement[today] || 0;     
      if (currentValue >= 900) {
        return msg.reply(`ꕥ El personaje *${characterData.name}* ya tiene el valor máximo.`);
      }      
      const increment = Math.min(900 - currentValue, Math.floor(Math.random() * 201) + 50);
      characterData.value = (characterData.value || 0) + increment;
      characterData.votes = (characterData.votes || 0) + 1;
      characterData.lastVotedAt = now;
      characterData.dailyIncrement[today] = currentValue + increment;      
      db.setCharacter(character.id, characterData);
      db.setUser(msg.sender, 'lastVote', now + cooldown);      
      const source = getSeriesNameByCharacter(structure, character.id);
      await sock.reply(msg.chat, `❀ Votaste por *${characterData.name}* (*${source}*)\n> Su nuevo valor es *${characterData.value.toLocaleString()}*`, msg);      
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};