import axios from 'axios';
import fs from 'fs';
import db from '#db';

const fetchStickerVideo = async (text) => {
  const response = await axios.get(`https://skyzxu-brat.hf.space/brat-animated`, { params: { text }, responseType: 'arraybuffer' });  
  if (!response.data) throw new Error('Error al obtener el video de la API.');
  return response.data;
};

export default {
  command: ['bratv'],
  category: 'stickers',
  description: 'Crear un video-sticker estilo brat.',
  run: async ({ msg, sock, usedPrefix, command, text }) => {
    try {
      text = msg.quoted?.text || text;
      if (!text) {
        return sock.reply(msg.chat, '《✧》 Por favor, responde a un mensaje o ingresa un texto para crear el Sticker.', msg);
      }
      await msg.react('🕒');
      let user = db.getUser(msg.sender);
      const name = user.name || msg.sender.split('@')[0];
      const meta1 = user.metadatos ? String(user.metadatos).trim() : '';
      const meta2 = user.metadatos2 ? String(user.metadatos2).trim() : '';
      let texto1 = meta1 ? meta1 : 'ʏᴜᴋɪ 🧠 Wᴀʙᴏᴛ';
      let texto2 = meta1 ? (meta2 ? meta2 : '') : `@${name}`;
      const videoBuffer = await fetchStickerVideo(text);
      const tmpFile = `./tmp/bratv-${Date.now()}.mp4`;
      fs.writeFileSync(tmpFile, videoBuffer);
      await sock.sendVideoAsSticker(msg.chat, tmpFile, msg, { packname: texto1, author: texto2 });
      fs.unlinkSync(tmpFile);
      await msg.react('✔️');
    } catch (e) {
      await msg.react('✖️');
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};