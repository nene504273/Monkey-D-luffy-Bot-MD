import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, participants, groupMetadata }) {
    if (!m.isGroup || !m.messageStubType) return true

    // --- CONFIGURACIÓN ---
    const apiKey = "stellar-LarjcWHD"
    const fotoRespaldo = "https://files.catbox.moe/xr2m6u.jpg"
    const canalId = '120363420846835529@newsletter'
    const canalNombre = 'monkey D. luffy'

    const id = m.chat
    const user = m.messageStubParameters[0] 
    const userName = conn.getName(user) || "Nakama"
    const groupName = groupMetadata.subject
    const memberCount = participants.length

    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    let pp
    try {
        pp = await conn.profilePictureUrl(user, 'image')
    } catch {
        pp = fotoRespaldo
    }

    // --- ACCIÓN: BIENVENIDA ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_INVITE_VIA_LINK) {
        
        const urlImagen = `https://rest.alyabotpe.xyz/whatsapp/welcome?name=${encodeURIComponent(userName)}&gcname=${encodeURIComponent(groupName)}&pp=${pp}&member=${memberCount}&key=${apiKey}`

        const textoBienvenida = `🕊️ *BIENVENIDO/DA* 🕊️
─── ˗ˏˋ 🍖 ˎˊ˗ ───

∫ ⚓ *USUARIO* : @${user.split('@')[0]}
∫ 🌍 *GRUPO* : ${groupName}
∫ 👥 *MIEMBROS* : ${memberCount}
∫ 📅 *FECHA* : ${fechaActual}

*¡Yoshaaa! Un nuevo nakama se une a la tripulación.*`

        await conn.sendMessage(id, { 
            image: { url: urlImagen }, 
            caption: textoBienvenida, 
            mentions: [user],
            contextInfo: {
                mentionedJid: [user],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: canalId,
                    newsletterName: canalNombre,
                    serverMessageId: -1
                }
            }
        })
    }

    // --- ACCIÓN: DESPEDIDA ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
        
        const urlImagen = `https://rest.alyabotpe.xyz/whatsapp/goodbye?name=${encodeURIComponent(userName)}&gcname=${encodeURIComponent(groupName)}&pp=${pp}&member=${memberCount}&key=${apiKey}`

        const textoDespedida = `⚓ *PARTIDA DE NAKAMA* ⚓
─── ˗ˏˋ 🌊 ˎˊ˗ ───

∫ 👤 *USUARIO* : @${user.split('@')[0]}
∫ 🌍 *GRUPO* : ${groupName}
∫ 👥 *QUEDAN* : ${memberCount}

*¡Buen viaje! Aunque dejes la tripulación, siempre recordaremos tu camino.*`

        await conn.sendMessage(id, { 
            image: { url: urlImagen }, 
            caption: textoDespedida, 
            mentions: [user],
            contextInfo: {
                mentionedJid: [user],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: canalId,
                    newsletterName: canalNombre,
                    serverMessageId: -1
                }
            }
        })
    }

    return true
}