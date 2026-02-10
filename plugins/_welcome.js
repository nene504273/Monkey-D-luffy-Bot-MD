import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    // Obtener la cantidad actual de miembros
    const currentSize = (participants || []).length
    const groupName = groupMetadata?.subject || 'este grupo'
    const defaultImg = 'https://raw.githubusercontent.com/danielalejandrobasado-glitch/Yotsuba-MD-Premium/main/uploads/f3dec04bc1df5762.jpg' 

    const sendMsg = async (jid, text, user, title) => {
      let pp
      try {
        pp = await conn.profilePictureUrl(user, 'image')
      } catch (e) {
        pp = defaultImg
      }

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
            title: title,
            body: '', 
            thumbnailUrl: pp,
            mediaType: 1,
            renderLargerThumbnail: true, 
            sourceUrl: 'Power by ɴ͡ᴇ͜ɴᴇ❀᭄☂️' 
          }
        }
      }, { quoted: m })
    }

    // --- LÓGICA DE BIENVENIDA (Suma 1 al conteo) ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD || m.messageStubType === 27) {
      const users = m.messageStubParameters || []
      for (const user of users) {
        const jid = user.includes('@') ? user : `${user}@s.whatsapp.net`
        const mentionTag = '@' + jid.split('@')[0]

        // Sumamos 1 porque el evento ocurre mientras se añaden
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

    // --- LÓGICA DE ADIÓS (Resta 1 al conteo) ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === 32) {
      const users = m.messageStubParameters || []
      for (const user of users) {
        const jid = user.includes('@') ? user : `${user}@s.whatsapp.net`
        const mentionTag = '@' + jid.split('@')[0]

        // Restamos 1 porque el bot todavía cuenta a la persona que se acaba de ir
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
    console.error(e)
    return true
  }
}