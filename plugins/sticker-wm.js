import { addExif } from '../lib/sticker.js';
// 'sticker' no se usa, puedes eliminarlo si quieres
import { sticker } from '../lib/sticker.js'; 
import fetch from 'node-fetch';
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.quoted) return m.reply(`${emoji} Por favor, responde a un sticker con el comando *${usedPrefix + command}* seguido del nuevo nombre.\nEjemplo: *${usedPrefix + command} Nuevo Nombre*`);

  const buffer = await m.quoted.download();
  if (!buffer || !Buffer.isBuffer(buffer)) return m.reply(`${emoji2} No se pudo descargar el archivo.`);

  // Validar que sea un WebP (cabecera RIFF....WEBP)
  if (
    buffer.length < 12 ||
    buffer.slice(0, 4).toString() !== 'RIFF' ||
    buffer.slice(8, 12).toString() !== 'WEBP'
  ) {
    return m.reply(`${emoji2} El mensaje respondido no es un sticker válido (formato WebP esperado).`);
  }

  const textoParts = text.split(/[\u2022|]/).map(part => part.trim());
  const userId = m.sender;
  let packstickers = global.db.data.users[userId] || {};
  let texto1 = textoParts[0] || packstickers.text1 || global.packsticker;
  let texto2 = textoParts[1] || packstickers.text2 || global.packsticker2;

  const exif = await addExif(buffer, texto1, texto2);

  await conn.sendMessage(m.chat, { sticker: exif }, { quoted: m });
};

handler.help = ['wm'];
handler.tags = ['tools'];
handler.command = ['take', 'robar', 'wm'];
handler.register = true;

export default handler;