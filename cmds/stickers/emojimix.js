import fetch from 'node-fetch';
import fs from 'fs';
import db from '#db';

const fetchJson = (url, options) => new Promise((resolve, reject) => { fetch(url, options).then(res => res.json()).then(json => resolve(json)).catch(err => reject(err)) });

export default {
  command: ['emojimix'],
  category: 'stickers',
  description: 'Mezclar dos emojis en un sticker.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    try {
      if (!args[0]) {
        return msg.reply(`《✧》 Ingresa 2 emojis para combinar.\n> Ejemplo: *${usedPrefix + command}* 👻+👀`);
      }
      let [emoji1, emoji2] = text.split('+');
      await msg.react('🕒');
      let user = db.getUser(msg.sender);
      const name = user.name || msg.sender.split('@')[0];
      const meta1 = user.metadatos ? String(user.metadatos).trim() : '';
      const meta2 = user.metadatos2 ? String(user.metadatos2).trim() : '';
      let texto1 = meta1 ? meta1 : 'ʏᴜᴋɪ 🧠 Wᴀʙᴏᴛ';
      let texto2 = meta1 ? (meta2 ? meta2 : '') : `@${name}`;
      const res = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
      if (!res.results || res.results.length === 0) {
        throw new Error('《✧》 No se encontraron stickers para esos emojis.');
      }
      for (let result of res.results) {
        const tmpFile = `./tmp/emojimix-${Date.now()}.webp`;
        const buffer = await (await fetch(result.url)).arrayBuffer();
        fs.writeFileSync(tmpFile, Buffer.from(buffer));
        await sock.sendImageAsSticker(msg.chat, tmpFile, msg, { packname: texto1, author: texto2 });
        fs.unlinkSync(tmpFile);
      }
      await msg.react('✔️');
    } catch (e) {
      await msg.react('✖️');
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};