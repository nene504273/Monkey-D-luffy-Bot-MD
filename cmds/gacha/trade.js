import { promises as fs } from 'fs';
import db from '#db';

const file = './core/characters.json';

async function loadCharacters() {
  const data = await fs.readFile(file, 'utf-8');
  return JSON.parse(data);
}

function flattenCharacters(data) {
  return Object.values(data).flatMap((d) => Array.isArray(d.characters) ? d.characters : []);
}

const getDisplayName = async (jid) => {
  const user = db.getUser(jid);
  return user?.name?.trim() || jid.split('@')[0];
};

const pendingTrade = {};

export default {
  command: ['trade', 'intercambiar'],
  category: 'gacha',
  description: 'Intercambiar un personaje con otro usuario.',
  before: async ({ msg, sock }) => {
    if (msg.text?.trim().toLowerCase() !== 'aceptar') return;
    const entry = Object.entries(pendingTrade).find(([_, d]) => d.chat === msg.chat);
    if (!entry) return;
    const [key, data] = entry;
    try {
      if (msg.sender !== data.to) {
        const receiverName = await getDisplayName(data.to);
        await msg.reply(`ꕥ Solo *${receiverName}* puede aceptar la solicitud de intercambio.`);
        return true;
      }
      const chatId = msg.chat;
      const keyA = chatId + '__' + data.give;
      const keyB = chatId + '__' + data.get;
      let pA = db.getCharacter(keyA);
      let pB = db.getCharacter(keyB);
      if (!pA || !pB || pA.user !== data.from || pB.user !== data.to) {
        delete pendingTrade[key];
        await msg.reply(`⚠︎ Uno de los personajes ya no está disponible para el intercambio.`);
        return true;
      }
      pA.user = data.to;
      pB.user = data.from;
      db.setCharacter(keyA, pA);
      db.setCharacter(keyB, pB);
      let sender = db.getChatUser(chatId, data.from);
      let receiver = db.getChatUser(chatId, data.to);
      if (!receiver.characters.includes(data.give)) receiver.characters.push(data.give);
      if (!sender.characters.includes(data.get)) sender.characters.push(data.get);
      sender.characters = sender.characters.filter(id => id !== data.give);
      receiver.characters = receiver.characters.filter(id => id !== data.get);
      db.setChatUser(chatId, data.from, 'characters', sender.characters);
      db.setChatUser(chatId, data.to, 'characters', receiver.characters);
      if (sender.favorite === data.give) {
        db.setChatUser(chatId, data.from, 'favorite', '');
        db.setUser(data.from, 'favorite', '');
      }
      if (receiver.favorite === data.get) {
        db.setChatUser(chatId, data.to, 'favorite', '');
        db.setUser(data.to, 'favorite', '');
      }
      clearTimeout(data.timeout);
      delete pendingTrade[key];
      const nameFrom = await getDisplayName(data.from);
      const nameTo = await getDisplayName(data.to);
      await msg.reply(`「✿」 Intercambio aceptado!\n\n✦ *${nameTo}* » ${pA.name}\n✦ *${nameFrom}* » ${pB.name}`);
    } catch (e) {
      await msg.reply(`⚠︎ Se ha producido un problema.\n> [Error: *${e.message}*]`);
    }
    return true;
  },
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    try {
      const chatId = msg.chat;
      const userId = msg.sender;
      db.setCreate('chats', chatId, 'intercambios', []);
      db.setCreate('chats', chatId, 'timeTrade', 0);
      const chat = db.getChat(chatId);
      if (chat.adminonly || !chat.gacha) {
        return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
      }
      if (chat.timeTrade && chat.timeTrade - Date.now() > 0) {
        return msg.reply('《✧》 Ya hay un intercambio en curso. Espera a que se complete o expire.');
      }
      if (!args.length || !msg.text.includes('/')) {
        return msg.reply(`❀ Debes especificar dos personajes para intercambiarlos.\n> ✐ Ejemplo: *${usedPrefix + command} Personaje1 / Personaje2*`);
      }
      const raw = msg.text.slice(msg.text.indexOf(' ') + 1).trim();
      const [nameA, nameB] = raw.split('/').map(s => s.trim().toLowerCase());
      const json = await loadCharacters();
      const all = flattenCharacters(json);
      const findId = (name) => all.find((c) => c.name.toLowerCase() === name)?.id;
      const idA = findId(nameA);
      const idB = findId(nameB);
      if (!idA || !idB) {
        return msg.reply(`ꕥ No se ha encontrado al personaje *${!idA ? nameA : nameB}*.`);
      }
      const keyA = chatId + '__' + idA;
      const keyB = chatId + '__' + idB;
      const pA = db.getCharacter(keyA);
      const pB = db.getCharacter(keyB);
      if (!pA || !pB) return msg.reply(`ꕥ No se encontraron datos de los personajes.`);
      if (pB.user === userId) return msg.reply(`ꕥ El personaje *${pB.name}* ya está reclamado por ti.`);
      if (!pB.user) return msg.reply(`ꕥ El personaje *${pB.name}* no está reclamado por nadie.`);
      if (!pA.user || pA.user !== userId) return msg.reply(`ꕥ *${pA.name}* no está reclamado por ti.`);
      const receiverId = pB.user;
      const globalA = db.getCharacter(idA) || {};
      const globalB = db.getCharacter(idB) || {};
      const valueA = typeof globalA.value === 'number' ? globalA.value : pA.value || 0;
      const valueB = typeof globalB.value === 'number' ? globalB.value : pB.value || 0;
      const senderName = await getDisplayName(userId);
      const receiverName = await getDisplayName(receiverId);
      pendingTrade[receiverId] = { from: userId, to: receiverId, chat: chatId, give: idA, get: idB, timeout: setTimeout(() => delete pendingTrade[receiverId], 60000) };
      db.setChat(chatId, 'timeTrade', Date.now() + 60000);
      await sock.sendMessage(chatId, { text: `「✿」 *${receiverName}*, *${senderName}* te ha enviado una solicitud de intercambio.\n\n✦ [${receiverName}] *${pB.name}* (${valueB.toLocaleString()})\n✦ [${senderName}] *${pA.name}* (${valueA.toLocaleString()})\n\n✐ Para aceptar responde con *aceptar*, la solicitud expira en 60 segundos.`, mentions: [userId, receiverId] }, { quoted: msg });
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*.\n> [Error: *${e.message}*]`);
    }
  }
};