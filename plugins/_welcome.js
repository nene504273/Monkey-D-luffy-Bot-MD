import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

const welcomeMessages = {
  default: '¡¡¡Luffy te da la bienvenida, {taguser}!!! ¡Únete a la tripulación!',
  custom: ''
};

const byeMessages = {
  default: '¡Hasta luego, {taguser}! ¡Esperamos verte pronto en el Gran Line!',
  custom: ''
};

export async function before(m, { conn, groupMetadata }) {
  try {
    if (!m.isGroup || !m.messageStubType) return;

    const chat = global.db.data.chats[m.chat];
    if (!chat?.welcome) return;

    const who = m.messageStubParameters[0];
    const taguser = `@${who.split('@')[0]}`;
    const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https:                                              
    const img = await fetch(pp).then(res => res.buffer());

    let text = '//telegra.ph/file/6e0b8d8f2c3b44b27df5d.jpg');
    const img = await fetch(pp).then(res => res.buffer());

    let text = '';
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      text = welcomeMessages.custom || welcomeMessages.default;
      text = text.replace('{taguser}', taguser);
    } else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      text = byeMessages.custom || byeMessages.default;
      text = text.replace('{taguser}', taguser);
    }

    if (text) {
      await conn.sendMessage(m.chat, { image: img, caption: text, mentions: [who] });
    }
  } catch (error) {
    console.error('Error en el plugin _welcome.js:', error);
  }
}

export async function handler(m, { conn }) {
  try {
    if (!m.isGroup) return;

    const args = m.text.split('function handler(m, { conn }) {
  try {
    if (!m.isGroup) return;

    const args = m.text.split(' ');
    if (args[0] === '.setwelcome') {
      welcomeMessages.custom = args.slice(1).join(' ');
      await conn.reply(m.chat, 'Puedes editar el mensaje de bienvenida a tu manera, nakama. ¡Listo!');
    } else if (args[0] === '.setbye') {
      byeMessages.custom = args.slice(1).join(' ');
      await conn.reply(m.chat, 'Puedes editar el mensaje de despedida a tu manera, nakama. ¡Listo!');
    } else if (args[0] === '.help') {
      await conn.reply(m.chat, 'Comandos disponibles:\n.setwelcome <mensaje>\n.setbye <mensaje>');
    }
  } catch (error) {
    console.error('Error en el plugin _welcome.js:', error);
  }
}