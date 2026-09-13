import fetch from "node-fetch";
import db from '#db';

export default {
  command: ['waifu', 'neko'],
  category: 'anime',
  description: 'Obtener una imagen de waifu aleatoria.',
  run: async ({ msg, sock, usedPrefix, command }) => {
    try {
      await msg.react('🕒');
      const chat = db.getChat(msg.chat);
      let mode = chat?.nsfw ? 'nsfw' : 'sfw';
      let url = `https://nekos.best/api/v2/${command}${mode === 'nsfw' ? '?type=nsfw' : ''}`;
      let res = await fetch(url);
      if (!res.ok) return;
      let json = await res.json();
      if (!json.results?.[0]?.url) return;
      let img = Buffer.from(await (await fetch(json.results[0].url)).arrayBuffer());
      await sock.sendFile(msg.chat, img, 'thumbnail.jpg', `✿ ¡Aquí tienes tu *${command.toUpperCase()}*!`, msg);      
      await msg.react('✔️');
    } catch (e) {
      await msg.react('✖️');
      await msg.reply(`> Ocurrió un error inesperado al ejecutar el comando *${usedPrefix + command}*.
> [Error: *${e.message}*]`);
    }
  },
};
