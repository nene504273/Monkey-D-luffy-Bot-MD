import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'  // Asegúrate de tenerlo: npm i node-fetch

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    const currentSize = (participants || []).length
    const groupName = groupMetadata?.subject || 'este grupo'
    const defaultImg = 'https://raw.githubusercontent.com/danielalejandrobasado-glitch/Yotsuba-MD-Premium/main/uploads/f3dec04bc1df5762.jpg'

    /**
     * Envía imagen + caption con formato de reenvío desde newsletter
     */
    const sendMsg = async (jid, text, user, title) => {
      let imageUrl
      try {
        imageUrl = await conn.profilePictureUrl(user, 'image')
      } catch (e) {
        imageUrl = defaultImg
      }

      // Descargar la imagen como buffer
      const res = await fetch(imageUrl)
      const imageBuffer = await res.buffer()

      // Contexto que genera el texto "Reenviado muchas veces · [nombre del newsletter]"
      const contextInfo = {
        mentionedJid: [user],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363420846835529@newsletter',   // Cambia si quieres
          newsletterName: '🎄 Jolly Roger Navideño V2 🎄',    // Nombre visible
          serverMessageId: String(Date.now())
        }
      }

      await conn.sendMessage(jid, {
        image: imageBuffer,
        caption: text,
        contextInfo
      }, { quoted: m })
    }

    // --- BIENVENIDA ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD || m.messageStubType === 27) {
      const users = m.messageStubParameters || []
      for (const user of users) {
        const jid = user.includes('@') ? user : `${user}@s.whatsapp.net`
        const mentionTag = '@' + jid.split('@')[0]
        const realSize = currentSize + 1

        const welcomeText = `
🕊️ *BIENVENIDO/DA* 🕊️
─── ˗ˏˋ 🍖 ˎˊ˗ ───

∫ ⚓ *USUARIO* : ${mentionTag}
∫ 🌍 *GRUPO* : ${groupName}
∫ 👥 *MIEMBROS* : ${realSize}
∫ 📅 *FECHA* : ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}

*¡Yoshaaa! Un nuevo nakama se une a la tripulación.*`.trim()

        await sendMsg(m.chat, welcomeText, jid, '✨ B I E N V E N I D O ✨')
      }
    }

    // --- ADIÓS ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === 32) {
      const users = m.messageStubParameters || []
      for (const user of users) {
        const jid = user.includes('@') ? user : `${user}@s.whatsapp.net`
        const mentionTag = '@' + jid.split('@')[0]
        const realSize = currentSize - 1

        const byeText = `
🥀 *ADIÓS NAKAMA* 🥀
─── ˗ˏˋ 🌊 ˎˊ˗ ───

∫ 👤 *USUARIO* : ${mentionTag}
∫ 🚢 *GRUPO* : ${groupName}
∫ 👥 *QUEDAN* : ${realSize}

*¡Esperamos verte de nuevo en Grand Line!*`.trim()

        await sendMsg(m.chat, byeText, jid, '┖ [ 🖇️ A D I O S / B Y E ] ───⊚')
      }
    }

    return true
  } catch (e) {
    console.error('Error en plugin welcome:', e)
    return true
  }
}