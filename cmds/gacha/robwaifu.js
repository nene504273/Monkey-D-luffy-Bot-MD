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
  command: ['robwaifu', 'robarwaifu'],
  category: 'gacha',
  description: 'Robar un personaje a otro usuario.',
  run: async ({ msg, sock, usedPrefix, command }) => {
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
      db.setCreate('chat_users', [msg.chat, msg.sender], 'lastrobwaifu', 0);
      db.setCreate('chat_users', [msg.chat, msg.sender], 'robVictims', {});      
      let userData = db.getChatUser(msg.chat, msg.sender);
      if (userData.robVictims && typeof userData.robVictims === 'string') {
        try { userData.robVictims = JSON.parse(userData.robVictims); } catch { userData.robVictims = {}; }
      }
      const now = Date.now();
      const cooldown = 3 * 60 * 60 * 1000;
      const nextAllowed = userData.lastrobwaifu;
      if (userData.lastrobwaifu > 0 && now < nextAllowed) {
        const timeLeft = Math.ceil((nextAllowed - now) / 1000);
        const h = Math.floor(timeLeft / 3600);
        const m_ = Math.floor((timeLeft % 3600) / 60);
        const s = timeLeft % 60;
        let timeText = '';
        if (h > 0) timeText += `${h} hora${h !== 1 ? 's' : ''} `;
        if (m_ > 0) timeText += `${m_} minuto${m_ !== 1 ? 's' : ''} `;
        if (s > 0 || timeText === '') timeText += `${s} segundo${s !== 1 ? 's' : ''}`;
        return msg.reply(`ꕥ Debes esperar ${timeText.trim()} para usar *${usedPrefix + command}* de nuevo.`);
      }
      const target = msg.mentionedJid?.[0] || msg.quoted?.sender || null;
      if (!target) return msg.reply(`❀ Por favor, cita o menciona al usuario a quien quieras robarle una waifu.`);
      if (target === msg.sender) {
        const robberName = (db.getUser(msg.sender))?.name?.trim() || msg.sender.split('@')[0];
        return msg.reply(`ꕥ No puedes robarte a ti mismo, *${robberName}*.`);
      }
      const targetUser = db.getChatUser(msg.chat, target);
      const lastCmd = targetUser?.lastCmd || 0;
      const tiempoInactivo = now - lastCmd;
      if (tiempoInactivo < 3600000) {
        const targetName = (db.getUser(target))?.name?.trim() || target.split('@')[0];
        return msg.reply(`ꕥ *${targetName}* estuvo activo recientemente. Solo puedes robarle waifus si ha estado inactivo más de 1 hora.`);
      }
      db.setCreate('chat_users', [msg.chat, target], 'favorite', '');
      let victim = db.getChatUser(msg.chat, target);
      if (!Array.isArray(victim.characters) || victim.characters.length === 0) {
        const targetName = (db.getUser(target))?.name?.trim() || target.split('@')[0];
        return msg.reply(`ꕥ *${targetName}* no tiene waifus que puedas robar.`);
      }
      if (!userData.robVictims) userData.robVictims = {};
      const last = userData.robVictims[target];
      if (last && now - last < 24 * 60 * 60 * 1000) {
        const targetName = (db.getUser(target))?.name?.trim() || target.split('@')[0];
        return msg.reply(`ꕥ Ya robaste a *${targetName}* hoy. Solo puedes robarle a alguien una vez cada 24 horas.`);
      }      
      const targetName = (db.getUser(target))?.name?.trim() || target.split('@')[0];
      const robberName = (db.getUser(msg.sender))?.name?.trim() || msg.sender.split('@')[0];      
      const success = Math.random() < 0.4;
      userData.lastrobwaifu = now + cooldown;
      db.setChatUser(msg.chat, msg.sender, 'lastrobwaifu', userData.lastrobwaifu);      
      if (!success) {
        return msg.reply(`ꕥ El intento de robo ha fallado. *${targetName}* defendió a su waifu heroicamente.`);
      }
      userData.robVictims[target] = now;
      db.setChatUser(msg.chat, msg.sender, 'robVictims', userData.robVictims);
      const victimFavorite = victim.favorite;
      const stealableCharacters = victim.characters.filter(id => id !== victimFavorite);
      if (stealableCharacters.length === 0) {
        return msg.reply(`ꕥ *${targetName}* solo tiene a su favorito protegido, no puedes robarlo.`);
      }      
      const stolenId = stealableCharacters[Math.floor(Math.random() * stealableCharacters.length)];
      const charKey = msg.chat + '__' + stolenId;
      db.setCreate('characters', charKey, 'name', '');
      let characterData = db.getCharacter(charKey);
      if (!characterData) {
        const structure = await loadCharacters();
        const allCharacters = flattenCharacters(structure);
        const jsonChar = allCharacters.find(c => c.id === stolenId);
        characterData = { name: jsonChar?.name || '???', value: jsonChar?.value || 100, votes: 0 };
      }
      characterData.user = msg.sender;
      characterData.claimedAt = now;
      db.setCharacter(charKey, characterData);
      victim.characters = victim.characters.filter(id => id !== stolenId);
      db.setChatUser(msg.chat, target, 'characters', victim.characters);
      if (!userData.characters.includes(stolenId)) {
        userData.characters.push(stolenId);
        db.setChatUser(msg.chat, msg.sender, 'characters', userData.characters);
      }
      if (victim.favorite === stolenId) {
        db.setChatUser(msg.chat, target, 'favorite', '');
        db.setUser(target, 'favorite', '');
      }      
      const charName = characterData.name || `ID:${stolenId}`;
      await msg.reply(`❀ *${robberName}* ha robado a *${charName}* del harem de *${targetName}*.`);      
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};