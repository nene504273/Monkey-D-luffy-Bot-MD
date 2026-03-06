import axios from 'axios'
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Si no hay texto, buscamos si respondió a un mensaje con texto
    let txt = text ? text : m.quoted && (m.quoted.text || m.quoted.caption) ? m.quoted.text : null

    if (!txt) return conn.reply(m.chat, `*¡Oi! Escribe el texto para el sticker animado.*\nEjemplo: ${usedPrefix + command} hola mundo`, m)

    try {
        await m.react('⏳')
        
        // URL de la API para brat animado
        const apiUrl = `https://skyzxu-brat.hf.space/brat-animated?text=${encodeURIComponent(txt)}`
        
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        
        if (!response.data) throw 'No se recibió respuesta de la API'

        // Convertimos el buffer a sticker animado
        let stiker = await sticker(response.data, false, 'Luffy Bot 🏴‍☠️', `@${m.pushName}`)
        
        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, { asSticker: true })
            await m.react('✅')
        } else {
            throw 'Error al procesar el sticker'
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply(`🏴‍☠️ *Error en el barco:* ${e.message || e}`)
    }
}

handler.help = ['bratv']
handler.tags = ['sticker']
handler.command = /^(bratv|bratvideo)$/i

export default handler