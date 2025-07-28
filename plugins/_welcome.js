```js
import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

const welcomeMessages = {
  custom: '',
  default: '👋 ¡Luffy te da la bienvenida, {taguser}! Únete a la tripulación de *{group}*!'
};

const byeMessages = {
  custom: '',
  default: '👋 ¡Hasta luego, {taguser}! Esperamos verte de nuevo en *{group}*!'
};

export async function before(m, { conn, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.welcome) return;

  const who = m.messageStubParameters?.[0];
  if (!who) return;

  const taguser = `@${who.split('@')[0]}`;
  const group = groupMetadata.subject;

  const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://telegra.ph/file/6e0b8d8f2c3b44b27df5d.jpg');
  const img = await fetch(pp).then(res => res.buffer());

  let text = '';
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    text = (welcomeMessages.custom || welcomeMessages.default)
      .replace('{taguser}', taguser)
      .replace('{group}', group);
} else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
    text = (byeMessages.custom || byeMessages.default)
      .replace('{taguser}', taguser)
      .replace('{group}', group);
  }

  if (text) {
    await conn.sendMessage(m.chat, { image: img, caption: text, mentions: [who] });
  }
}

export async function handler(m, { conn, isGroup }) {
  const text = m.text || '';
  const command = text.split(' ')[0];
  const content = text.split(' ').slice(1).join(' ');

  if (!isGroup) return;

  if (command === '.setwelcome') {
    welcomeMessages.custom = content || '';
    await conn.reply(m.chat, '✅ Mensaje de bienvenida actualizado.');
  }

  if (command === '.setbye') {
    byeMessages.custom = content || '';
    await conn.reply(m.chat, '✅ Mensaje de despedida actualizado.');
  }

  if (command === '.resetwelcome') {
    welcomeMessages.custom = '';
    await conn.reply(m.chat, '🔄 Mensaje de bienvenida restablecido al predeterminado.');
  }

  if (command === '.resetbye') {
    byeMessages.custom = '';
    await conn.reply(m.chat, '🔄 Mensaje de despedida restablecido al predeterminado.');
  }
}
```
