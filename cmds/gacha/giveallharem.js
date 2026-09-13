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

const pending = {};

export default {
  command: ['giveallharem'],
  category: 'gacha',
  description: 'Regalar todos tus personajes a otro usuario.',
  before: async ({ msg, sock }) => {
    const data = pending[msg.sender];
    if (!data) return;
    if (msg.text?.trim().toLowerCase() !== 'aceptar') return;
    if (msg.sender !== data.sender || data.chat !== msg.chat) return;
    try {
      const chatId = msg.chat;
      let sender = db.getChatUser(chatId, data.sender);
      let receiver = db.getChatUser(chatId, data.to);
      if (!Array.isArray(receiver.characters)) receiver.characters = [];
      for (const id of data.ids) {
        const giftKey = chatId + '__' + id;
        let character = db.getCharacter(giftKey);
        if (!character || character.user !== data.sender) continue;
        character.user = data.to;
        character.claimedAt = Date.now();
        db.setCharacter(giftKey, character);
        if (!receiver.characters.includes(id)) receiver.characters.push(id);
        sender.characters = sender.characters.filter(c => c !== id);
        if (sender.favorite === id) {
          db.setChatUser(chatId, data.sender, 'favorite', '');
          db.setUser(data.sender, 'favorite', '');
        }
      }
      db.setChatUser(chatId, data.sender, 'characters', sender.characters);
      db.setChatUser(chatId, data.to, 'characters', receiver.characters);
      clearTimeout(data.timeout);
      delete pending[msg.sender];
      const name = await getDisplayName(data.to);
      await msg.reply(`「✿」 Has regalado con éxito todos tus personajes a *${name}*!\n\n> ❏ Personajes regalados: *${data.count}*\n> ⴵ Valor total: *${data.value.toLocaleString()}*`);
    } catch (e) {
      await msg.reply(`⚠︎ Se ha producido un problema.\n> [Error: *${e.message}*]`);
    }
    return true;
  },
  run: async ({ msg, sock, usedPrefix, command }) => {
    try {
      const chatId = msg.chat;
      db.setCreate('chats', chatId, 'regalosPendientes', []);
      const chat = db.getChat(chatId);
      if (chat.adminonly || !chat.gacha) {
        return msg.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}gacha on*`);
      }
      const realSender = msg.sender;
      const user = db.getChatUser(chatId, realSender);
      const target = msg.mentionedJid?.[0] || msg.quoted?.sender || null;
      if (!target) return msg.reply('❀ Debes mencionar a quien quieras regalarle tus personajes.');
      if (target === realSender) return msg.reply('ꕥ No puedes regalarte personajes a ti mismo.');
      const json = await loadCharacters();
      const all = flattenCharacters(json);
      const ids = Array.isArray(user.characters) ? user.characters : [];
      const list = [];
      for (const id of ids) {
        const chatKey = chatId + '__' + id;
        const character = db.getCharacter(chatKey);
        if (character && character.user === realSender) {
          const ref = all.find((c) => c.id === id);
          const value = character.value || ref?.value || 0;
          list.push({ id, name: character.name || ref?.name || `ID:${id}`, value });
        }
      }
      if (!list.length) return msg.reply('ꕥ No tienes personajes para regalar.');
      const total = list.reduce((s, c) => s + c.value, 0);
      const nameTarget = await getDisplayName(target);
      const nameSender = await getDisplayName(realSender);
      await sock.reply(chatId, `「✿」 *${nameSender}*, ¿confirmas regalar todo tu harem a *${nameTarget}*?\n\n❏ Personajes a transferir: *${list.length}*\n❏ Valor total: *${total.toLocaleString()}*\n\n✐ Para confirmar responde con *aceptar*.\n> Esta acción no se puede deshacer.`, msg, { mentions: [target] });
      pending[realSender] = { sender: realSender, to: target, ids: list.map(c => c.id), value: total, count: list.length, chat: chatId, timeout: setTimeout(() => delete pending[realSender], 60000) };
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*.\n> [Error: *${e.message}*]`);
    }
  }
};