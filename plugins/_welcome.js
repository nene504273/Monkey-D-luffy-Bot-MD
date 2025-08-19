const WAMessageStubType = {
  GROUP_PARTICIPANT_ADD: 27,
  GROUP_PARTICIPANT_REMOVE: 28,
  GROUP_PARTICIPANT_PROMOTE: 29,
  GROUP_PARTICIPANT_DEMOTE: 30,
};

module.exports = {
  async before(m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return;

    const pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(() => 'https:                                
    const img = await (await fetch(pp)).buffer();

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const welcomeText = `🎉 *¡Bienvenido a ${groupMetadata.subject}!* 🎉\n\n👑 @${m.messageStubParameters[0].split('//files.catbox.moe/wm4w1x.jpg');
    const img = await (await fetch(pp)).buffer();

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const welcomeText = `🎉 *¡Bienvenido a ${groupMetadata.subject}!* 🎉\n\n👑 @${m.messageStubParameters[0].split('@')[0]} 👑\n\n💪 ¡Ahora somos ${participants.length} piratas en busca de One Piece en este barco llamado ${groupMetadata.subject}! 💪\n\n🏴‍☠️ ¡Prepárate para la aventura! 🏴‍☠️\n\n👉 *Disfruta tu estancia en nuestro grupo!* 👈`;
      await conn.sendMessage(m.chat, { image: img, caption: welcomeText, mentions: [m.messageStubParameters[0]] });
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
      const goodbyeText = `🌊 *¡Hasta luego, amigo!* 🌊\n\n👑 @${m.messageStubParameters[0].split('@')[0]} 👑\n\n💔 ¡Esperamos verte pronto en nuestro próximo viaje en ${groupMetadata.subject}! 💔\n\n🏴‍☠️ ¡La música de los piratas siempre te acompañará! 🎵\n\n👉 *¡Que tengas un buen viaje!* 👈`;
      const pp2 = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(() => 'https://files.catbox.moe/wm4w1x.jpg');
      const img2 = await (await fetch(pp2)).buffer();
      await conn.sendMessage(m.chat, { image: img2, caption: goodbyeText, mentions: [m.messageStubParameters[0]] });
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_PROMOTE) {
      const promoteText = `👑 *¡Felicidades!* 👑\n\n@${m.messageStubParameters[0].split('@')[0]} ha sido promovido a administrador del grupo ${groupMetadata.subject}! 🎉`;
      await conn.sendMessage(m.chat, { text: promoteText, mentions: [m.messageStubParameters[0]] });
    }

    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_DEMOTE) {
      const demoteText = `👑 *¡Noticias!* 👑\n\n@${m.messageStubParameters[0].split('@')[0]} ha sido degradado de administrador del grupo ${groupMetadata.subject}! 😅`;
      await conn.sendMessage(m.chat, { text: demoteText, mentions: [m.messageStubParameters[0]] });
    }
  },
};