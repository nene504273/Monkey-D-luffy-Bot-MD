import axios from 'axios';
import fs from 'fs';
import db from '#db';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchSticker = async (text, attempt = 1) => {
  try {
    const response = await axios.get(`https://skyzxu-brat.hf.space/brat`, { params: { text }, responseType: 'arraybuffer' });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429 && attempt <= 3) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      await delay(retryAfter * 1000);
      return fetchSticker(text, attempt + 1);
    }
    throw error;
  }
};

export default {
  command: ['brat'],
  category: 'stickers',
  description: 'Crear un sticker estilo brat con texto.',
  run: async ({ msg, sock, usedPrefix, command, text }) => {
    try {
      text = msg.quoted?.text || text;
      if (!text) {
        return sock.reply(msg.chat, `《✧》 Por favor, responde a un mensaje o ingresa un texto para crear el Sticker.`, msg);
      }      
      await msg.react('🕒');      
      let user = db.getUser(msg.sender);
      const name = user.name || msg.sender.split('@')[0];
      const hasMeta1 = user.metadatos ? String(user.metadatos).trim() : '';
      const hasMeta2 = user.metadatos2 ? String(user.metadatos2).trim() : '';
      let texto1 = hasMeta1 ? user.metadatos : 'ʏᴜᴋɪ 🧠 Wᴀʙᴏᴛ';
      let texto2 = hasMeta1 ? (hasMeta2 ? user.metadatos2 : '') : `@${name}`;      
      const buffer = await fetchSticker(text);
      const tmpFile = `./tmp/brat-${Date.now()}.webp`;
      fs.writeFileSync(tmpFile, buffer);      
      await sock.sendImageAsSticker(msg.chat, tmpFile, msg, { packname: texto1, author: texto2 });      
      fs.unlinkSync(tmpFile);
      await msg.react('✔️');
    } catch (e) {
      await msg.react('✖️');
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};
