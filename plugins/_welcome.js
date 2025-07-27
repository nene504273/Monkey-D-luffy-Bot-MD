import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, groupMetadata }) {
  try {
    if (!m.isGroup || !m.messageStubType) return;

    const chat = global.db.data.chats[m.chat];
    const who = m.messageStubParameters?.[0] ?? null;

    if (!chat?.welcome || !who) return;

    const taguser = `@${who.split('@')[0]}`;
    const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https:                                              
    const img = await fetch(pp).then(res => res.buffer()).catch(() => null);

    let text = '//telegra.ph/file/6e0b8d8f2c3b44b27df5d.jpg');
    const img = await fetch(pp).then(res => res.buffer()).catch(() => null);

    let text = '';

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      text = (chat.welcome || global.welcome || '👋 Bienvenido/a a *%subject* %user').replace('%user', taguser).replace('%subject', groupMetadata.subject);
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      text = (chat.bye || global.bye || '👋 Adiós %user de *%subject*, te esperamos pronto.').replace('%user', taguser).replace('%subject', groupMetadata.subject);
    }

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