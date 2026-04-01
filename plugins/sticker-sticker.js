import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false
    try {
        // Mejoramos la detección del mensaje citado para que no falle en ningún número
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''
        
        // Verificación más robusta del tipo de archivo
        if (!mime || !/webp|image|video/g.test(mime)) {
            return conn.reply(m.chat, `🗺️ ¡Necesito algo de carne! Responde a una *imagen* o *video* con *${usedPrefix + command}* para crear tu sticker pirata. 🏴‍☠️`, m, { contextInfo: { externalAdReply: { title: 'M O N K E Y  D  L U F F Y - M D', body: 'By: ɴ͡ᴇ͜ɴᴇ❀᭄☂️', sourceUrl: 'https://github.com', thumbnail: imagen1 }}})
        }

        // Validación de tiempo para videos
        let seconds = (q.msg || q).seconds || (q.msg || q).duration || 0
        if (/video/.test(mime) && seconds > 15) {
            return conn.reply(m.chat, '⚓️ ¡Oi! El video no puede durar más de *15 segundos*.', m)
        }

        await m.react('👒') 
        let buffer = await q.download?.()

        if (!buffer) throw 'No se pudo descargar el contenido. Intenta reenviando el mensaje.'

        // --- DATOS DE TU BOT ---
        let nombreBot = '—͟͟͞͞🍖 M͢ᴏɴᴋᴇʏ D L͢ᴜғғʏ-𝘉𝘰𝘵-𝑴𝑫✰⃔⃝'
        let autor = 'ɴ͡ᴇ͜ɴᴇ❀᭄☂️'

        stiker = await sticker(buffer, false, nombreBot, autor)

    } catch (e) {
        console.error(e)
        await m.react('😵‍💫')
        // Si falla, enviamos el error detallado
        await conn.reply(m.chat, `💥 ¡Gomu Gomu no! Algo salió mal.`, m)
    } finally {
        if (stiker) {
            // Usamos conn.sendMessage para mayor compatibilidad con stickers
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await m.react('👑') 
        }
    }
}

handler.help = ['s', 'sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'mugiwara']
handler.register = true

export default handler