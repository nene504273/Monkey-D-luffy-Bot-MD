import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

let welcomeText = ''
let byeText = ''
let kickText = ''

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;
  let who = m.messageStubParameters[0]
  let taguser = `@${who.split('@')[0]}`
  let chat = global.db.data.chats[m.chat]
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https:                               
  let img = await (await fetch(`${pp}`)).buffer()
  let totalMembers = participants.length

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    if (!welcomeText) welcomeText = ` 🎉 **¡BIENVENIDO A LA TRIPULACIÓN, AMIGO!** 🎉 ${taguser} se ha unido al grupo: ${groupMetadata.subject} 🤝 Ahora somos ${totalMembers + 1} miembros 👥 ¡Vamos a encontrar el One Piece juntos! 🏴‍☠️ ¡Yo soy Luffy y quiero ser el rey de los piratas! 💪`
    await conn.sendMessage(m.chat, { image: img, caption: welcomeText.replace('//files.catbox.moe/xr2m6u.jpg')
  let img = await (await fetch(`${pp}`)).buffer()
  let totalMembers = participants.length

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    if (!welcomeText) welcomeText = ` 🎉 **¡BIENVENIDO A LA TRIPULACIÓN, AMIGO!** 🎉 ${taguser} se ha unido al grupo: ${groupMetadata.subject} 🤝 Ahora somos ${totalMembers + 1} miembros 👥 ¡Vamos a encontrar el One Piece juntos! 🏴‍☠️ ¡Yo soy Luffy y quiero ser el rey de los piratas! 💪`
    await conn.sendMessage(m.chat, { image: img, caption: welcomeText.replace('{taguser}', taguser).replace('{group}', groupMetadata.subject).replace('{members}', totalMembers + 1), mentions: [who] })
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
    if (!byeText) byeText = ` 😢 **¡ADIÓS, AMIGO!** 😢 ${taguser} ha salido del grupo: ${groupMetadata.subject} 👋 Ahora somos ${totalMembers - 1} miembros 👥 ¡Que tengas un buen viaje y no te olvides de nosotros! 🌊 ¡Volveremos a navegar juntos! 🌟`
    await conn.sendMessage(m.chat, { image: img, caption: byeText.replace('{taguser}', taguser).replace('{group}', groupMetadata.subject).replace('{members}', totalMembers - 1), mentions: [who] })
  }

  if (chat.welcome && m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
    if (!kickText) kickText = ` 😢 **¡ADIÓS, AMIGO!** 😢 ${taguser} ha sido expulsado del grupo: ${groupMetadata.subject} 👋 Ahora somos ${totalMembers - 1} miembros 👥 ¡No te rindas nunca y sigue adelante! 💪 ¡La amistad es lo más importante! 🤝`
    await conn.sendMessage(m.chat, { image: img, caption: kickText.replace('{taguser}', taguser).replace('{group}', groupMetadata.subject).replace('{members}', totalMembers - 1), mentions: [who] })
  }
}

export async function handler(m, { conn }) {
  if (m.text.startsWith('function handler(m, { conn }) {
  if (m.text.startsWith('#setwelcome')) {
    welcomeText = m.text.replace('#setwelcome ', '')
    m.reply('Bienvenida configurada correctamente')
  }

  if (m.text.startsWith('#setbye')) {
    byeText = m.text.replace('#setbye ', '')
    m.reply('Despedida configurada correctamente')
  }

  if (m.text.startsWith('#setkick')) {
    kickText = m.text.replace('#setkick ', '')
    m.reply('Mensaje de expulsión configurado correctamente')
  }
}