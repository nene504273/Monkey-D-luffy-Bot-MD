import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, groupMetadata }) {
  try {
    console.log('m:', m);
    if (!m.isGroup || !m.messageStubType) return console.log('No es un grupo o no hay messageStubType');

    const chat = global.db.data.chats[m.chat];
    console.log('chat:', chat);
    const who = m.messageStubParameters?.[0] ?? null;
    console.log('who:', who);

    if (!chat?.welcome || !who) return console.log('No hay welcome o who');

    const taguser = `@${who.split('@')[0]}`;
    const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https:                                              
    console.log('//telegra.ph/file/6e0b8d8f2c3b44b27df5d.jpg');
    console.log('pp:', pp);
    const img = await fetch(pp).then(res => res.buffer()).catch(() => null);
    console.log('img:', img);

    let text = '';

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      text = (chat.welcome || global.welcome || '👋 Bienvenido/a a *%subject* %user').replace('%user', taguser).replace('%subject', groupMetadata.subject);
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      text = (chat.bye || global.bye || '👋 Adiós %user de *%subject*, te esperamos pronto.').replace('%user', taguser).replace('%subject', groupMetadata.subject);
    }

    console.log('text:', text);

    if (text) {
      if (img) {
        await conn.sendMessage(m.chat, { image: img, caption: text, mentions: [who] });
      } else {
        await conn.sendMessage(m.chat, { text, mentions: [who] });
      }
    }
  } catch (error) {
    console.error('Error en la función before:', error);
  }
}