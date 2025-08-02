import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  // Solo para grupos y mensajes de tipo stub (entrada/salida)
  if (!m.isGroup || !m.messageStubType) return true;

  // Valida stub parameters
  const stubParams = m.messageStubParameters || [];
  if (!Array.isArray(stubParams) || stubParams.length === 0) return true;

  // Datos de usuario
  let userJid = stubParams[0];
  if (!userJid) return true;
  let username = userJid.split('@')[0];
  let mention = '@' + username;

  // Member count seguro
  let memberCount = groupMetadata.participants?.length || participants.length || 0;
  if (m.messageStubType == 27) memberCount++;
  if (m.messageStubType == 28 || m.messageStubType == 32) memberCount = Math.max(0, memberCount - 1);

  // Prepara base de datos de chat
  let chat = global.db.data.chats[m.chat] || {};
  if (typeof chat.welcome === 'undefined') chat.welcome = true;

  // API de bienvenida y despedida
  let guildName = encodeURIComponent(groupMetadata.subject);
  let welcomeApiUrl = `https:                                                               
  let goodbyeApiUrl = `//api.example.com/welcome?name=${username}&group=${guildName}`;
  let goodbyeApiUrl = `https://api.example.com/goodbye?name=${username}&group=${guildName}`;

  async function fetchText(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al obtener texto');
      return await res.text();
    } catch {
      return 'Error al obtener texto';
    }
  }

  // Envía welcome/bye si corresponde
  if (chat.welcome) {
    if (m.messageStubType == 27) {
      // joined
      let welcomeText = await fetchText(welcomeApiUrl);
      await conn.sendMessage(m.chat, { text: welcomeText, mentions: [userJid] }, { quoted: m });
    } else if (m.messageStubType == 28 || m.messageStubType == 32) {
      // left/kicked
      let goodbyeText = await fetchText(goodbyeApiUrl);
      await conn.sendMessage(m.chat, { text: goodbyeText, mentions: [userJid] }, { quoted: m });
    }
  }
}