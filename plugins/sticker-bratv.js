import axios from 'axios'
import fs from 'fs'
import { join } from 'path'

const handler = async (m, { conn, args, usedPrefix, command, text }) => {
    // Detectar texto de mensaje citado o argumentos
    text = text || m.quoted?.text 
    
    if (!text) {
        return conn.reply(m.chat, '🍖 ¡Oi! Necesito un texto para crear tu sticker de Brat. Úsalo así:\n' + `> *${usedPrefix + command}* Hola Mundo`, m)
    }

    try {
        await m.react('🍖') // Reacción de carne (Luffy)
        
        // Configuración de metadatos del sticker (Personalizable)
        let user = global.db.data.users[m.sender] || {}
        let packname = user.metadatos || 'Luffy - Monkey D. Luffy 🏴‍☠️'
        let author = user.metadatos2 || `@${m.pushName || 'Pirata'}`

        // Llamada a la API
        const response = await axios.get(`https://skyzxu-brat.hf.space/brat-animated`, { 
            params: { text }, 
            responseType: 'arraybuffer' 
        })

        if (!response.data) throw new Error('No se recibió data de la API')

        // Manejo de archivo temporal
        const tmpFile = join(process.cwd(), `./tmp/brat_${Date.now()}.mp4`)
        await fs.promises.writeFile(tmpFile, response.data)

        // Envío del sticker
        await conn.sendVideoAsSticker(m.chat, tmpFile, m, { 
            packname: packname, 
            author: author 
        })

        // Limpieza y confirmación
        await fs.promises.unlink(tmpFile)
        await m.react('🏴‍☠️')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply(`🏴‍☠️ ¡Rayos! Algo salió mal en el barco:\n> *${e.message}*`)
    }
}

handler.help = ['bratv']
handler.tags = ['sticker']
handler.command = /^(bratv|bratvideo)$/i

export default handler