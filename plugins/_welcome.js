import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;
  let who = m.messageStubParameters[0]
  let taguser = `@${who.split('@')[0]}`
  let chat = global.db.data.chats[m.chat]
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')
  let img = await (await fetch(`${pp}`)).buffer()

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    let bienvenida = `
🎉 **¡BIENVENIDO A BORDO, NAKAMA!** 🎉
${taguser} se ha unido al grupo: ${groupMetadata.subject} 🤝
¡Vamos a encontrar el One Piece juntos! 🏴‍☠️
•(=^●ω●^=)• Disfruta tu estadía en el grupo y no te rindas nunca! 💪
> ✐ Puedes usar *#help* para ver la lista de comandos.
`
    await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] })
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
    let bye = `
😢 **¡ADIÓS, NAKAMA!** 😢
${taguser} ha salido del grupo: ${groupMetadata.subject} 👋
¡Que tengas un buen viaje y no te olvides de nosotros! 🌊
•(=^●ω●^=)• Te esperamos pronto!
> ✐ Puedes usar *#help* para ver la lista de comandos.
`
    await conn.sendMessage(m.chat, { image: img, caption: bye, mentions: [who] })
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
    let kick = `
😢 **¡ADIÓS, NAKAMA!** 😢
${taguser} ha sido expulsado del grupo: ${groupMetadata.subject} 👋
¡No te rindas nunca y sigue adelante! 💪
•(=^●ω●^=)• Te esperamos pronto!
> ✐ Puedes usar *#help* para ver la lista de comandos.
`
    await conn.sendMessage(m.chat, { image: img, caption: kick, mentions: [who] })
  }
}