import axios from 'axios'
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let txt = text ? text : m.quoted && (m.quoted.text || m.quoted.caption) ? m.quoted.text : null

    if (!txt) return conn.reply(m.chat, `*¡Oi! Escribe el texto para el sticker animado.*\nEjemplo: ${usedPrefix + command} hola mundo`, m)

    try {
        await m.react('⏳')

        const name = conn.getName(m.sender)
        const now = new Date()
        const fecha = now.toLocaleDateString('es-ES')
        const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

        const apiUrl = `https://skyzxu-brat.hf.space/brat-animated?text=${encodeURIComponent(txt)}`
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })

        if (!response.data) throw 'No se recibió respuesta de la API'

        let stiker = await sticker(
            response.data,
            false,
            `☼ Usuario: ${name} ☼ Fecha: ${fecha} ☼ ${hora}`,
            `—͟͟͞͞🍖 ‧˚꒰🏴‍☠️꒱ M͢ᴏɴᴋᴇʏ D L͢ᴜғғʏ-𝘉𝘰𝘵-𝑴𝑫`
        )

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, { asSticker: true })
            await m.react('✅')
        } else {
            throw 'Error al procesar el sticker'
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply(`*Error:* ${e.message || e}`)
    }
}

handler.help = ['bratv']
handler.tags = ['bratv']
handler.command = ['bratv']

export default handler