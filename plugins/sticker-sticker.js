import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        
        if (!/webp|image|video/g.test(mime)) {
            return conn.reply(m.chat, `🗺️ ¡Necesito algo de carne! Responde a una *imagen* o *video* con *${usedPrefix + command}* para crear tu sticker pirata. 🏴‍☠️`, m, global.rcanal)
        }

        if (/video/.test(mime) && (q.msg || q).seconds > 15) {
            return conn.reply(m.chat, '⚓️ ¡Oi! El video no puede durar más de *15 segundos*. ¡Necesitas rapidez para este viaje! 💨', m, global.rcanal)
        }

        await m.react('👒') 
        let buffer = await q.download()

        // --- MARCA PERSONAL INVISIBLE ---
        // Definimos los datos que aparecerán al tocar el sticker en WhatsApp
        let nombreBot = '—͟͟͞͞🍖 M͢ᴏɴᴋᴇʏ D L͢ᴜғғʏ-𝘉𝘰𝘵-𝑴𝑫✰⃔⃝'
        let autor = 'ɴ͡ᴇ͜ɴᴇ❀᭄☂️'

        // Generamos el sticker con tu firma fija para que "todos la vean"
        stiker = await sticker(buffer, false, nombreBot, autor)

    } catch (e) {
        console.error(e)
        await m.react('😵‍💫')
        await conn.reply(m.chat, `💥 ¡Gomu Gomu no! Algo explotó: ${e.message}`, m, global.rcanal)
    } finally {
        if (stiker) {
            // Enviamos el sticker asegurando que sea tratado como tal
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, { asSticker: true })
            await m.react('👑') 
        }
    }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'mugiwara']
handler.register = true

export default handler