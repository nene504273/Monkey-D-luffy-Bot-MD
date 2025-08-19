import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;
  let who = m.messageStubParameters[0]
  let taguser = `@${who.split('@')[0]}`
  let chat = global.db.data.chats[m.chat]
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https:                               
  let img = await (await fetch(`${pp}`)).buffer()

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    let bienvenida = ` 🎉 **¡BIENVENIDO A BORDO, NAKAMA!** 🎉 ${taguser} se ha unido al grupo: ${groupMetadata.subject} 🤝 ¡Vamos a encontrar el One Piece juntos! 🏴‍☠️ •(=^●ω●^=)• Disfruta tu estadía en el grupo y no te rindas nunca! 💪 > ✐ Puedes usar *#help* para ver la lista de comandos. `
    await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] })
  }

  if (chat.welcome && [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE].includes(m.messageStubType)) {
    let texto = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE ? '//files.catbox.moe/xr2m6u.jpg')
  let img = await (await fetch(`${pp}`)).buffer()

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    let bienvenida = ` 🎉 **¡BIENVENIDO A BORDO, NAKAMA!** 🎉 ${taguser} se ha unido al grupo: ${groupMetadata.subject} 🤝 ¡Vamos a encontrar el One Piece juntos! 🏴‍☠️ •(=^●ω●^=)• Disfruta tu estadía en el grupo y no te rindas nunca! 💪 > ✐ Puedes usar *#help* para ver la lista de comandos. `
    await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] })
  }

  if (chat.welcome && [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, WAMessageStubType.GROUP_PARTICIPANT_REMOVE].includes(m.messageStubType)) {
    let texto = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE ? 'ha salido del grupo' : 'ha sido expulsado del grupo'
    let bye = ` 😢 **¡ADIÓS, NAKAMA!** 😢 ${taguser} ${texto}: ${groupMetadata.subject} 👋 ¡No te rindas nunca y sigue adelante! 💪 •(=^●ω●^=)• Te esperamos pronto! > ✐ Puedes usar *#help* para ver la lista de comandos. `
    await conn.sendMessage(m.chat, { image: img, caption: bye, mentions: [who] })
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_PROMOTE) {
    let promoteText = ` 👑 **¡FELICIDADES!** 👑 ${taguser} ha sido promovido a administrador del grupo ${groupMetadata.subject}! 🎉`
    await conn.sendMessage(m.chat, { text: promoteText, mentions: [who] })
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_DEMOTE) {
    let demoteText = ` 👑 **¡NOTICIAS!** 👑 ${taguser} ha sido degradado de administrador del grupo ${groupMetadata.subject}! 😅`
    await conn.sendMessage(m.chat, { text: demoteText, mentions: [who] })
  }
}