import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;

  const fkontak = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Halo',
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Monkey D. Luffy;;;\nFN:Luffy\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Pirata\nEND:VCARD`,
      },
    },
    participant: '0@s.whatsapp.net',
  };

  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(() => 'https:                                
  let img = await (await fetch(pp)).buffer();
  let chat = global.db.data.chats[m.chat];
  let txt = '//files.catbox.moe/wm4w1x.jpg');
  let img = await (await fetch(pp)).buffer();
  let chat = global.db.data.chats[m.chat];
  let txt = '🏴‍☠️ ¡Nuevo Tripulante! 🏴‍☠️';
  let txt1 = '🌊 ¡Adiós, Amigo! 🌊';
  let groupSize = participants.length;

  if (m.messageStubType == 27) {
    groupSize++;
  } else if (m.messageStubType == 28 || m.messageStubType == 32) {
    groupSize--;
  }

  if (chat.welcome && m.messageStubType == 27) {
    let bienvenida = `🎉 *¡Bienvenido a la tripulación!* 🎉\n\n🏴‍☠️ @${m.messageStubParameters[0].split('@')[0]} 🏴‍☠️\n\n💪 ${global.welcom1} 💪\n\n🌟 ¡Ahora somos ${groupSize} piratas en busca de One Piece! 🌟\n\n🏴‍☠️ ¡Prepárate para la aventura! 🏴‍☠️\n\n> 🎤 Usa *#help* para ver todos los comandos del capitán Luffy! ✨\n> 𝙋𝙄𝙍𝘼𝙏𝘼𝙎 𝘿𝙀𝙇 𝙈𝙊𝙉𝙆𝙀𝙔`;
    await conn.sendMini(m.chat, txt, dev, bienvenida, img, img, redes, fkontak, m, rcanal);
  }

  if (chat.welcome && (m.messageStubType == 28 || m.messageStubType == 32)) {
    let bye = `🌊 *¡Hasta luego, amigo!* 🌊\n\n🏴‍☠️ @${m.messageStubParameters[0].split('@')[0]} 🏴‍☠️\n\n💪 ${global.welcom2} 💪\n\n🌟 Ahora somos ${groupSize} piratas esperándote 🌟\n\n🏴‍☠️ ¡Esperamos verte pronto en nuestro próximo viaje! 🏴‍☠️\n\n> 🎵 ¡La música de los piratas siempre te acompañará! ✨\n> 𝙋𝙄𝙍𝘼𝙏𝘼𝙎 𝘿𝙀𝙇 𝙈𝙊𝙉𝙆𝙀𝙔`;
    await conn.sendMini(m.chat, txt1, dev, bye, img, img, redes, fkontak, m, rcanal);
  }
}