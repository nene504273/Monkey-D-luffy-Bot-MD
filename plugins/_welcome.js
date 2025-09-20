import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;

  let who = m.messageStubParameters[0];
  let taguser = `@${who.split('@')[0]}`;
  let chat = global.db.data.chats[m.chat];
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(() => '');
  let img = await (await fetch(pp)).buffer();

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    let bienvenida = `
    ¡Voy a ser el Rey de los Piratas! 
    *¡Bienvenido/a!* ${taguser} a ${groupMetadata.subject}
    Disfruta tu estadía en el grupo y no olvides leer las reglas.
    Usa *#help* para ver la lista de comandos disponibles.
    `;
    await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] });
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
    let bye = `
    ¡Hasta luego! ${taguser} de ${groupMetadata.subject}
    Esperamos verte de nuevo pronto.
    Recuerda que puedes usar *#help* para obtener ayuda en cualquier momento.
    `;
    await conn.sendMessage(m.chat, { image: img, caption: bye, mentions: [who] });
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
    let kick = `
    ¡Adiós! ${taguser} de ${groupMetadata.subject}
    Esperamos que vuelvas pronto.
    Si necesitas ayuda, no dudes en usar *#help*.
    `;
    await conn.sendMessage(m.chat, { image: img, caption: kick, mentions: [who] });
  }
}

// Powered by Monkey-D-luffy-Bot-MD
// "¡No voy a perder contra nadie, porque voy a ser el Rey de los Piratas!" - Monkey D. Luffy