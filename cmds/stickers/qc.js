import axios from 'axios';
import fs from 'fs';
import db from '#db';

export default {
  command: ['qc'],
  category: 'stickers',
  description: 'Crear un sticker con texto estilo quote.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    try {
      let textFinal = args.join(' ') || msg.quoted?.text;
      if (!textFinal) {
        return sock.reply(msg.chat, `《✧》 Ingresa un texto para crear el sticker.`, msg);
      }
      let target = msg.quoted ? msg.quoted.sender : msg.sender;
      const pp = await sock.profilePictureUrl(target).catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');
      let userGlobal = db.getUser(target);
      const nombre = userGlobal?.name || target.split('@')[0];
      if (textFinal.length > 30) {
        await msg.react('✖️');
        return sock.reply(msg.chat, `《✧》 El texto no puede tener más de 30 caracteres.`, msg);
      }
      await msg.react('🕒');
      const quoteObj = { type: 'quote', format: 'png', backgroundColor: '#000000', width: 512, height: 768, scale: 2, messages: [{ entities: [], avatar: true, from: { id: 1, name: nombre, photo: { url: pp } }, text: textFinal, replyMessage: {} }] };
      const json = await axios.post('https://bot.lyo.su/quote/generate', quoteObj, { headers: { 'Content-Type': 'application/json' }});      
      const buffer = Buffer.from(json.data.result.image, 'base64');
      let user = db.getUser(msg.sender);
      const name = user.name || msg.sender.split('@')[0];
      const meta1 = user.metadatos ? String(user.metadatos).trim() : '';
      const meta2 = user.metadatos2 ? String(user.metadatos2).trim() : '';
      let texto1 = meta1 ? meta1 : 'ʏᴜᴋɪ 🧠 Wᴀʙᴏᴛ';
      let texto2 = meta1 ? (meta2 ? meta2 : '') : `@${name}`;      
      const tmpFile = `./tmp/qc-${Date.now()}.webp`;
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