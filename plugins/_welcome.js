import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

    const chat = global.db.data.chats[m.chat]

    if (chat.welcome === undefined) chat.welcome = true
    if (!chat.welcome) return true

    const groupSize = (participants || []).length
    const groupName = groupMetadata?.subject || 'este grupo'
    
    // --- IMAGEN FIJA DE LUFFY ---
    const luffyImg = 'https://files.catbox.moe/03uko8.jpg'

    const sendSingleWelcome = async (jid, text, user, quoted, type) => {
      try {
        await conn.sendMessage(jid, {
          text: text,
          contextInfo: {
            mentionedJid: [user],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420846835529@newsletter',
              newsletterName: '🎄 Jolly Roger Navideño V2 🎄',
              serverMessageId: -1
            },
            externalAdReply: {
              title: type === 'welcome' ? '✨ B I E N V E N I D O ✨' : '🥀 A D I Ó S  N A K A M A 🥀',
              body: `Nakama #${groupSize} en el barco 🏴‍☠️`,
              thumbnailUrl: luffyImg,
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: 'https://whatsapp.com/channel/0029VajVv9sEwEjwjS0S9q0S'
            }
          }
        }, { quoted })
      } catch (err) {
        console.log('Error en sendSingleWelcome:', err)
      }
    }

    // --- Lógica de Bienvenida (Detección Corregida) ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD || m.messageStubType === 27) {
      const users = m.messageStubParameters || []
      for (const user of users) {
        if (!user) continue
        const mentionTag = '@' + user.replace(/@.+/, '')

        const welcomeText = `
🕊️ *BIENVENIDO/DA* 🕊️
─── ˗ˏˋ 🍖 ˎˊ˗ ───

∫ ⚓ *USUARIO* : ${mentionTag}
∫ 🌍 *GRUPO* : ${groupName}
∫ 👥 *MIEMBROS* : ${groupSize}
∫ 📅 *FECHA* : ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}

*¡Yoshaaa! Un nuevo nakama se une a la tripulación.*`.trim()

        await sendSingleWelcome(m.chat, welcomeText, user, m, 'welcome')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // --- Lógica de Despedida (Detección Corregida) ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === 28 || m.messageStubType === 32) {
      const users = m.messageStubParameters || []
      for (const user of users) {
        if (!user) continue
        const mentionTag = '@' + user.replace(/@.+/, '')

        const byeText = `
🥀 *ADIÓS NAKAMA* 🥀
─── ˗ˏˋ 🌊 ˎˊ˗ ───

∫ 👤 *USUARIO* : ${mentionTag}
∫ 🚢 *GRUPO* : ${groupName}
∫ 👥 *QUEDAN* : ${groupSize}

*¡Esperamos verte de nuevo en Grand Line!*`.trim()

        await sendSingleWelcome(m.chat, byeText, user, m, 'bye')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return true

  } catch (e) {
    console.error('Error en plugins/_welcome:', e)
    return true
  }
}
