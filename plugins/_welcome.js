// Código Creado por Félix OFC https://GitHub.com/mantis-has
// No quites los Créditos
// Se recomienda MakiBaileys para tus proyectos

import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;
  if (m.chat === "120363416711925079@g.us") return;
  let who = m.messageStubParameters[0];
  let taguser = `@${who.split("@")[0]}`;
  let chat = global.db.data.chats[m.chat];
  let totalMembers = participants.length;
  let date = new Date().toLocaleString("es-ES", { timeZone: "America/Mexico_City" });
  let imagenUrl = 'https://qu.ax/aFAdU.jpg';

  // Frases de bienvenida
  let frasesBienvenida = [
    "¡Bienvenido a bordo, nakama! ¡Vamos a navegar hacia el One Piece!",
    "¡Un nuevo tripulante se une a la aventura! ¡Bienvenido!",
    "¡La tripulación del Sombrero de Paja te da la bienvenida!",
    "¡Prepárate para la aventura de tu vida, nakama!",
    "¡Bienvenido al equipo de los piratas más poderosos del mundo!"
  ];

  // Frases de despedida
  let frasesDespedida = [
    "¡Hasta luego, nakama! ¡Que tengas un viaje seguro!",
    "¡La tripulación del Sombrero de Paja te echará de menos!",
    "¡Que la suerte te acompañe en tus futuras aventuras!",
    "¡No te olvides de nosotros, nakama!",
    "¡La puerta del Sombrero de Paja siempre estará abierta para ti!"
  ];

  // Frases random de Luffy
  let frasesLuffy = [
    "¡Voy a ser el rey de los piratas!",
    "¡No me rendiré nunca!",
    "¡La amistad es lo más importante!",
    "¡Vamos a encontrar el One Piece!",
    "¡Nunca te rindas, nakama!"
  ];

  // Selecciona una frase random de bienvenida/despedida/Luffy
  let fraseRandomBienvenida = frasesBienvenida[Math.floor(Math.random() * frasesBienvenida.length)];
  let fraseRandomDespedida = frasesDespedida[Math.floor(Math.random() * frasesDespedida.length)];
  let fraseRandomLuffy = frasesLuffy[Math.floor(Math.random() * frasesLuffy.length)];

  if (chat.welcome) {
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      let bienvenida = ` 
━━━─────━━━─── ¡BIENVENIDO A BORDO! ━━━─────━━━───
${taguser} se ha unido al grupo: ${groupMetadata.subject}
Miembros: ${totalMembers + 1}
${fraseRandomBienvenida}
${fraseRandomLuffy}
¡Vamos a encontrar el One Piece juntos!
`.trim();
      await conn.sendMessage(m.chat, { image: { url: imagenUrl }, caption: bienvenida, mentions: [who] });
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      let despedida = ` 
━━━─────━━━─── ¡ADIÓS, NAKAMA! ━━━─────━━━───
${taguser} ha salido del grupo: ${groupMetadata.subject}
Ahora somos ${totalMembers - 1} miembros.
${fraseRandomDespedida}
${fraseRandomLuffy}
¡Que tengas un buen viaje, nakama!
`.trim();
      await conn.sendMessage(m.chat, { image: { url: imagenUrl }, caption: despedida, mentions: [who] });
    }
  }
}