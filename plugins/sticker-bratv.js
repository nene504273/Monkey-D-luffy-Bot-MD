import axios from 'axios'
import fs from 'fs'
import { join } from 'path'
import { sticker } from '../lib/sticker.js' // Verifica que esta ruta sea correcta en tu bot

const handler = async (m, { conn, args, usedPrefix, command, text }) => {
    text = text || m.quoted?.text 
    
    if (!text) return conn.reply(m.chat, '🍖 ¡Oi! Pasa un texto para tu sticker de Brat.', m)

    try {
        await m.react('🕒')
        
        let user = global.db.data.users[m.sender] || {}
        let packname = user.metadatos || 'Luffy Bot 🏴‍☠️'
        let author = user.metadatos2 || `@${m.pushName || 'Pirata'}`

        const response = await axios.get(`https://skyzxu-brat.hf.space/brat-animated`, { 
            params: { text }, 
            responseType: 'arraybuffer' 
        })

        if (!response.data) throw new Error('API Error')

        // Método alternativo usando la función nativa del Handler
        let stiker = await sticker(response.data, false, packname, author)
        
        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
            await m.react('✔️')
        } else {
            throw new Error('No se pudo convertir a sticker')
        }

    } catch (e) {
        console.error(e)
        await m.react('✖️')
        m.reply(`🏴‍☠️ ¡Algo salió mal en el barco!\n> *${e.message}*`)
    }
}

handler.help = ['bratv']
handler.tags = ['sticker']
handler.command = /^(bratv|bratvideo)$/i

export default handler