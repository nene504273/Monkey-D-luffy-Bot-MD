import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    const groupSize = (participants || []).length
    const groupName = groupMetadata?.subject || 'este grupo'
    
    // Imagen de respaldo (Luffy) si el usuario no tiene foto de perfil
    const defaultImg = 'https://files.catbox.moe/x4sc8b.jpg'

    const sendMsg = async (jid, text, user, title) => {
      let pp
      try {
        // Busca la foto de perfil del usuario
        pp = await conn.profilePictureUrl(user, 'image')
      } catch (e) {
        // Si no tiene foto, usa la de Catbox
        pp = defaultImg
      }

      await conn.sendMessage(jid, {
        text: text,
        contextInfo: {
          mentionedJid: [user],
          forwardingScore: 999,
          isForwarded: true,
          // Vinculación a tu canal
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
            // ESTO HACE QUE LA FOTO SALGA GRANDE
            renderLargerThumbnail: true, 
            sourceUrl: 'Power by ɴ͡ᴇ͜ɴᴇ❀᭄☂️' 
          }
        }
      }, { quoted: m })
    }

    // --- LÓGICA DE BIENVENIDA ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD || m.messageStubType === 27) {
      const users = m.messageStubParameters || []
      for (const user of users) {
        const jid = user.includes('@') ? user : `${user}@s.whatsapp.net`
        const mentionTag = '@' + jid.split('@')[0]
        
        const welcomeText = `
🕊️ *BIENVENIDO/DA* 🕊️
─── ˗ˏˋ 🍖 ˎˊ˗ ───

∫ ⚓ *USUARIO* : ${mentionTag}
∫ 🌍 *GRUPO* : ${groupName}
∫ 👥 *MIEMBROS* : ${groupSize}
∫ 📅 *FECHA* : ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}

*¡Yoshaaa! Un nuevo nakama se une a la tripulación.*`.trim()
        
        await sendMsg(m.chat, welcomeText, jid, '✨ B I E N V E N I D O ✨')
      }
    }

    // --- LÓGICA DE ADIÓS ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === 32) {
      const users = m.messageStubParameters || []
      for (const user of users) {
        const jid = user.includes('@') ? user : `${user}@s.whatsapp.net`
        const mentionTag = '@' + jid.split('@')[0]

        const byeText = `
🥀 *ADIÓS NAKAMA* 🥀
─── ˗ˏˋ 🌊 ˎˊ˗ ───

∫ 👤 *USUARIO* : ${mentionTag}
∫ 🚢 *GRUPO* : ${groupName}
∫ 👥 *QUEDAN* : ${groupSize}

*¡Esperamos verte de nuevo en Grand Line!*`.trim()
        
        await sendMsg(m.chat, byeText, jid, '┖ [ 🖇️ A D I O S / B Y E ] ───⊚')
      }
    }

    return true
  } catch (e) {
    console.error('Error en el plugin de bienvenida:', e)
    return true
  }
}