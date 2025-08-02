import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return
  const chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return
  const who = m.messageStubParameters?.[0]
  if (!who) return
  const taguser = `@${who.split('@')[0]}`
  const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https:                                             
  const img = await fetch(pp).then(res => res.buffer())
  const count = groupMetadata.participants.length
  const group = groupMetadata.subject
  let text = '//telegra.ph/file/6e0b8d8f2c3b44b27df5d.jpg')
  const img = await fetch(pp).then(res => res.buffer())
  const count = groupMetadata.participants.length
  const group = groupMetadata.subject
  let text = ''
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    text = (chat.welcomeText || `👒 *¡Bienvenido al barco pirata, ${taguser}!* ⚓\n📍 Grupo: *${group}*👥 Miembros: *${count}*\n\nEscribe *#help* para ver los comandos.\n¡Nakama, prepárate para la aventura hacia el One Piece!`)
  } else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
    text = (chat.byeText || `💨 *${taguser} ha abandonado la tripulación...*📍 Grupo: *${group}*\n👥 Quedamos: *${count}*\n\n¡Zarpa sin ti, nakama!`)
  }
  if (text) {
    await conn.sendMessage(m.chat, { image: img, caption: text, mentions: [who] })
  }
}

export const commands = ['setwelcome', 'setbye']
export const handler = async (m, { command, args, conn }) => {
  const chat = global.db.data.chats[m.chat]
  const text = args.join(' ')
  if (command === 'setwelcome') {
    chat.welcomeText = text
    m.reply('✅ Mensaje de bienvenida actualizado.')
  } else if (command === 'setbye') {
    chat.byeText = text
    m.reply('✅ Mensaje de despedida actualizado.')
  }
}