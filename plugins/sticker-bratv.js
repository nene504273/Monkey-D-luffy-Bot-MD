import axios from 'axios'
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Obtener texto del mensaje o de una respuesta citada
    let txt = text ? text : m.quoted && (m.quoted.text || m.quoted.caption) ? m.quoted.text : null

    if (!txt) {
        return conn.reply(m.chat, `*¡Oi! Escribe el texto para el sticker.*\nEjemplo: ${usedPrefix + command} hola mundo`, m)
    }

    try {
        await m.react('⏳')

        const name = conn.getName(m.sender)
        const now = new Date()
        const fecha = now.toLocaleDateString('es-ES')
        const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

        // ─── Construir URL con la API de Alyacore ───
        const apiKey = 'LUFFY-GEAR4'  // Puedes cambiarla o tomarla de una variable de entorno
        const apiUrl = `https://api.alyacore.xyz/tools/bratv2?text=${encodeURIComponent(txt)}&key=${apiKey}`

        // Petición GET → la API devuelve el archivo del sticker (buffer)
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer'
        })

        if (!response.data) throw new Error('No se recibió respuesta de la API')

        // Crear sticker (asumimos animado, pero la librería lo detectará si puede)
        // El segundo parámetro `true` indica que se espera un sticker animado (GIF/WebP animado)
        let stiker = await sticker(
            response.data,
            true,   // <─ si la imagen es estática no hay problema, la librería lo maneja
            `☼ Usuario: ${name} ☼ Fecha: ${fecha} ☼ ${hora}`,
            `—͟͟͞͞🍖 ‧˚꒰🏴‍☠️꒱ M͢ᴏɴᴋᴇʏ D L͢ᴜғғʏ-𝘉𝘰𝘵-𝑴𝑫`
        )

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, { asSticker: true })
            await m.react('✅')
        } else {
            throw new Error('Error al procesar el sticker')
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply(`*Error:* ${e.message || e}`)
    }
}

handler.help = ['bratv2']
handler.tags = ['sticker']
handler.command = ['bratv2']

export default handler