import fs from 'fs';
import { tmpdir } from 'os';
import Crypto from 'crypto';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import * as cheerio from 'cheerio';

async function webp2mp4(source) {
  let form = new FormData();
  let isUrl = typeof source === 'string' && /https?:\/\//.test(source);
  form.append('new-image-url', isUrl ? source : '');
  form.append('new-image', source, 'image.webp');  
  let res = await fetch('https://ezgif.com/webp-to-mp4', { method: 'POST', body: form });  
  let html = await res.text();
  const $ = cheerio.load(html);
  let form2 = new FormData();
  let obj = {};  
  $('form input[name]').each((i, input) => {
    const name = $(input).attr('name');
    const value = $(input).val();
    obj[name] = value;
    form2.append(name, value);
  });
  let res2 = await fetch('https://ezgif.com/webp-to-mp4/' + obj.file, { method: 'POST', body: form2 });  
  let html2 = await res2.text();
  const $2 = cheerio.load(html2);
  const videoUrl = new URL($2('div#output > p.outfile > video > source').attr('src'), res2.url).toString();  
  let videoRes = await fetch(videoUrl);
  let videoBuffer = await videoRes.buffer();
  return videoBuffer;
}

async function webp2png(source) {
  let form = new FormData();
  let isUrl = typeof source === 'string' && /https?:\/\//.test(source);
  form.append('new-image-url', isUrl ? source : '');
  form.append('new-image', source, 'image.webp');  
  let res = await fetch('https://ezgif.com/webp-to-png', { method: 'POST', body: form });  
  let html = await res.text();
  const $ = cheerio.load(html);
  let form2 = new FormData();
  let obj = {};  
  $('form input[name]').each((i, input) => {
    const name = $(input).attr('name');
    const value = $(input).val();
    obj[name] = value;
    form2.append(name, value);
  });
  let res2 = await fetch('https://ezgif.com/webp-to-png/' + obj.file, { method: 'POST', body: form2 });  
  let html2 = await res2.text();
  const $2 = cheerio.load(html2);
  const imgUrl = new URL($2('div#output > p.outfile > img').attr('src'), res2.url).toString();  
  let imgRes = await fetch(imgUrl);
  let imgBuffer = await imgRes.buffer();
  return imgBuffer;
}

export default {
  command: ['toimg', 'toimage'],
  category: 'utils',
  description: 'Convertir un sticker a imagen o GIF.',
  run: async ({ msg, sock }) => {
    if (!msg.quoted) {
      return sock.reply(msg.chat, `《✧》 Debes citar un sticker para convertir.`, msg);
    }    
    await msg.react('🕒');    
    try {
      const quoted = msg.quoted;
      const buffer = await quoted.download();      
      if (!buffer) {
        await msg.react('✖️');
        return sock.reply(msg.chat, `《✧》 No se pudo descargar el sticker.`, msg);
      }      
      const isAnimated = quoted.msg && quoted.msg.isAnimated;      
      if (isAnimated) {
        const mp4Buffer = await webp2mp4(buffer);
        await sock.sendMessage(msg.chat, { video: mp4Buffer, caption: 'ꕥ *Aquí tienes ฅ^•ﻌ•^ฅ*', gifPlayback: true }, { quoted: msg });
      } else {
        const pngBuffer = await webp2png(buffer);
        await sock.sendMessage(msg.chat, { image: pngBuffer, caption: 'ꕥ *Aquí tienes ฅ^•ﻌ•^ฅ*' }, { quoted: msg });
      }      
      await msg.react('✔️');
    } catch (error) {
      await msg.react('✖️');
      sock.reply(msg.chat, `《✧》 Error al convertir el sticker.\n${error.message}`, msg);
    }
  }
};
