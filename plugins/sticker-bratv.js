import axios from 'axios'
import { sticker } from '../lib/sticker.js'

const API_KEY = 'LUFFY-GEAR4'
const API_URL = 'https://api.alyacore.xyz/tools/bratv2'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let txt = text
    if (!txt && m.quoted) {
        txt = m.quoted.text || m.quoted.caption || ''
    }
    if (!txt || !txt.trim()) {
        return conn.reply(m.chat, `⚠️ *Escribe el texto para el sticker.*\nEjemplo: ${usedPrefix + command} Hola mundo`, m)
    }

    try {
        await m.react('⏳')

        const name = conn.getName(m.sender)
        const now = new Date()
        const fecha = now.toLocaleDateString('es-ES')
        const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

        const response = await axios.get(API_URL, {
            params: {
                text: txt.trim(),
                key: API_KEY
            },
            responseType: 'arraybuffer',
            timeout: 15000
        })

        if (!response.data || response.data.byteLength === 0) {
            throw new Error('La API no devolvió datos válidos')
        }

        // ⚡ Sticker animado → true
        const stikerBuffer = await sticker(
            response.data,
            true,   // ← animado
            `☼ Usuario: ${name} ☼ Fecha: ${fecha} ☼ ${hora}`,
            `—͟͟͞͞🍖 ‧˚꒰🏴‍☠️꒱ M͢ᴏɴᴋᴇʏ D L͢ᴜғғʏ-𝘉𝘰𝘵-𝑴𝑫`
        )
        if (!stikerBuffer) throw new Error('No se pudo generar el sticker')

        await conn.sendFile(m.chat, stikerBuffer, 'sticker.webp', '', m, { asSticker: true })
        await m.react('✅')

    } catch (err) {
        console.error('Error en bratv2:', err)
        await m.react('❌')
        conn.reply(m.chat, `❌ *Error:* ${err.message || err}`, m)
    }
}

handler.help = ['bratv2']
handler.tags = ['sticker']
handler.command = ['bratv']

export default handler