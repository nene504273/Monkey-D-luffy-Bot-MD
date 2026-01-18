import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, participants, groupMetadata }) {
    // 1. Validaciones de seguridad
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    // --- CONFIGURACIÓN ---
    const apiKey = "stellar-LarjcWHD"
    const fotoRespaldo = "https://files.catbox.moe/xr2m6u.jpg"
    const canalId = '120363420846835529@newsletter'
    const canalNombre = '🎄 Jolly Roger Navideño V2 🎄'

    const id = m.chat
    const user = m.messageStubParameters[0] // El usuario que entra o sale
    const userName = conn.getName(user) || "Nakama"
    const groupName = groupMetadata.subject
    const memberCount = participants.length

    // Fecha automática
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    // 2. Lógica de foto (Perfil o Respaldo)
    let pp
    try {
        pp = await conn.profilePictureUrl(user, 'image')
    } catch {
        pp = fotoRespaldo
    }

    // --- ACCIÓN: ALGUIEN SE UNE (WELCOME) ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_INVITE_VIA_LINK) {
        
        const urlImagen = `https://rest.alyabotpe.xyz/whatsapp/welcome?name=${encodeURIComponent(userName)}&gcname=${encodeURIComponent(groupName)}&pp=${pp}&member=${memberCount}&key=${apiKey}`

        let textoBienvenida = `🕊️ *BIENVENIDO/DA* 🕊️\n`
        textoBienvenida += `─── ˗ˏˋ 🍖 ˎˊ˗ ───\n\n`
        textoBienvenida += `∫ ⚓ *USUARIO* : @${user.split('@')[0]}\n`
        textoBienvenida += `∫ 🌍 *GRUPO* : ${groupName}\n`
        textoBienvenida += `∫ 👥 *MIEMBROS* : ${memberCount}\n`
        textoBienvenida += `∫ 📅 *FECHA* : ${fechaActual}\n\n`
        textoBienvenida += `*¡Yoshaaa! Un nuevo nakama se une a la tripulación.*`

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

    // --- ACCIÓN: ALGUIEN SE VA (GOODBYE) ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
        
        const urlImagen = `https://rest.alyabotpe.xyz/whatsapp/goodbye?name=${encodeURIComponent(userName)}&gcname=${encodeURIComponent(groupName)}&pp=${pp}&member=${memberCount}&key=${apiKey}`

        let textoDespedida = `⚓ *PARTIDA DE NAKAMA* ⚓\n`
        textoDespedida += `─── ˗ˏˋ 🌊 ˎˊ˗ ───\n\n`
        textoDespedida += `∫ 👤 *USUARIO* : @${user.split('@')[0]}\n`
        textoDespedida += `∫ 🌍 *GRUPO* : ${groupName}\n`
        textoDespedida += `∫ 👥 *QUEDAN* : ${memberCount}\n\n`
        textoDespedida += `*¡Buen viaje! Aunque dejes la tripulación, siempre recordaremos tu camino.*`

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