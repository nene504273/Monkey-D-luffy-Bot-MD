let handler = async (m, { conn, command, args, text }) => {
    const isCommand1 = /^(inspect|inspeccionar)\b$/i.test(command)

    if (!isCommand1) return

    let md = 'https://github.com/dev-fedexyzz'
    let icons = 'https://raw.githubusercontent.com/danielalejandrobasado-glitch/Yotsuba-MD-Premium/main/uploads/91ea84fc3ce47e5a.jpg'

    let fkontak = { 
        "key": { 
            "participants": "0@s.whatsapp.net", 
            "remoteJid": "status@broadcast", 
            "fromMe": false, 
            "id": "Halo" 
        }, 
        "message": { 
            "contactMessage": { 
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
            }
        }, 
        "participant": "0@s.whatsapp.net" 
    }

    if (!text) return conn.reply(m.chat, '```ⓘ Ingrese un enlace de grupo, comunidad o canal.```', m)

    // Detectar tipo de enlace
    const groupUrl = text.match(/(?:https?:\/\/)?(?:chat\.whatsapp\.com\/)([0-9A-Za-z]{22,24})/i)?.[1]
    const channelUrl = text.match(/(?:https?:\/\/)?(?:whatsapp\.com\/channel\/)([0-9A-Za-z@.]+)/i)?.[1]

    let caption = ''
    let thumb = icons
    let sourceUrl = md

    // ─── CANAL ───
    if (channelUrl) {
        try {
            const info = await conn.newsletterMetadata("invite", channelUrl).catch(() => null)
            if (!info) return conn.reply(m.chat, `❌ No se encontró información del canal. Verifique que el enlace sea correcto.`, m)

            const id = info.id || 'No encontrado'
            const nombre = info.name || 'Sin nombre'
            const descripcion = info.description || 'Sin descripción'
            const suscriptores = info.subscriberCount ?? 'No disponible'
            const verificado = info.verified ? '✅ Verificado' : '❌ No verificado'

            // Intentar obtener foto del canal
            try {
                thumb = info.picture?.directPath 
                    ? `https://mmg.whatsapp.net${info.picture.directPath}` 
                    : icons
            } catch { thumb = icons }

            sourceUrl = `https://whatsapp.com/channel/${channelUrl}`

            caption = `📢 *INFORMACIÓN DEL CANAL*\n\n` +
                `🪪 *Nombre:* ${nombre}\n` +
                `🆔 *ID:* ${id}\n` +
                `👥 *Suscriptores:* ${suscriptores}\n` +
                `${verificado}\n` +
                `📝 *Descripción:* ${descripcion}`

        } catch (e) {
            console.error('Error canal:', e)
            return conn.reply(m.chat, `❌ Error al obtener información del canal.`, m)
        }

    // ─── GRUPO / COMUNIDAD ───
    } else if (groupUrl) {
        try {
            const info = await conn.groupGetInviteInfo(groupUrl).catch(() => null)
            if (!info) return conn.reply(m.chat, `❌ No se encontró información. Verifique que el enlace sea válido.`, m)

            const id = info.id || 'No encontrado'
            const nombre = info.subject || 'Sin nombre'
            const descripcion = info.desc || 'Sin descripción'
            const participantes = info.size ?? info.participants?.length ?? 'No disponible'
            const tipo = info.isCommunity ? '🏘️ Comunidad' : '👥 Grupo'
            const creacion = info.creation 
                ? new Date(info.creation * 1000).toLocaleDateString('es-ES') 
                : 'No disponible'

            // Intentar obtener foto del grupo
            try {
                thumb = await conn.profilePictureUrl(info.id, 'image').catch(() => icons)
            } catch { thumb = icons }

            sourceUrl = `https://chat.whatsapp.com/${groupUrl}`

            caption = `${tipo === '🏘️ Comunidad' ? '🏘️ *INFORMACIÓN DE LA COMUNIDAD*' : '👥 *INFORMACIÓN DEL GRUPO*'}\n\n` +
                `📛 *Nombre:* ${nombre}\n` +
                `🆔 *ID:* ${id}\n` +
                `👥 *Participantes:* ${participantes}\n` +
                `📅 *Creado:* ${creacion}\n` +
                `📝 *Descripción:* ${descripcion}`

        } catch (e) {
            console.error('Error grupo/comunidad:', e)
            return conn.reply(m.chat, `❌ Error al obtener información del grupo o comunidad.`, m)
        }

    } else {
        return conn.reply(m.chat, `❌ No se detectó un enlace válido de grupo, comunidad o canal de WhatsApp.`, m)
    }

    // ─── ENVIAR RESULTADO ───
    await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            mentionedJid: conn.parseMention(caption),
            externalAdReply: {
                title: `🔍 Inspector de WhatsApp`,
                body: `Grupos • Comunidades • Canales`,
                thumbnailUrl: thumb,
                sourceUrl: sourceUrl,
                mediaType: 1,
                showAdAttribution: false,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: fkontak })
}

handler.tags = ['herramientas']
handler.help = ['inspect <enlace>', 'inspeccionar <enlace>']
handler.command = ['inspect', 'inspeccionar']

export default handler