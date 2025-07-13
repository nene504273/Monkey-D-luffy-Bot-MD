
```javascript
import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: "0@s.whatsapp.net"
  };

  const username = encodeURIComponent(m.messageStubParameters[0].split('@')[0]);
  const guildName = encodeURIComponent(groupMetadata.subject);
  const memberCount = participants.length + (m.messageStubType === 27 ? 1 : 0) - ((m.messageStubType === 28 || m.messageStubType === 32) ? 1 : 0);
  const avatar = encodeURIComponent(await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(() => 'https://files.catbox.moe/emwtzj.png'));

  const backgroundWelcome = encodeURIComponent('https://files.catbox.moe/o871ey.jpg');
  const backgroundGoodbye = encodeURIComponent('https://files.catbox.moe/3lw6bx.jpg');

  const welcomeApiUrl = `https://api.siputzx.my.id/api/canvas/welcomev1?username=${username}&guildName=${guildName}&memberCount=${memberCount}&avatar=${avatar}&background=${backgroundWelcome}&quality=80`;
  const goodbyeApiUrl = `https://api.siputzx.my.id/api/canvas/welcomev1?username=${username}&guildName=${guildName}&memberCount=${memberCount}&avatar=${avatar}&background=${backgroundGoodbye}&quality=80`;

  async function fetchImage(url, fallbackUrl) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('No se pudo descargar');
      return await res.buffer();
    } catch {
      const resFallback = await fetch(fallbackUrl);
      if (!resFallback.ok) throw new Error('No se pudo descargar fallback');
      return await resFallback.buffer();
    }
  }

  let chat = global.db.data.chats[m.chat];
  let txtWelcome = 'ゲ◜៹ New Member ៹◞ゲ';
  let txtGoodbye = 'ゲ◜