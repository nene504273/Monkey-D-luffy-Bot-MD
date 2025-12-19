import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`❀ Por favor, ingresa lo que deseas buscar.\nEjemplo: *${usedPrefix + command} luffy*`)

    try {
        await m.react('🕒')
        
        // Usamos una API de búsqueda pública para obtener resultados de Pinterest
        // Esta URL es un ejemplo de una API que suele estar activa para bots
        const res = await axios.get(`https://api.lolhuman.xyz/api/pinterest?apikey=GataDios&query=${encodeURIComponent(text)}`)
        
        // Nota: Si la API de arriba falla, es porque el "apikey" expiró. 
        // Intentaremos con una segunda opción de respaldo:
        let images = res.data.result
        
        if (!images || images.length === 0) {
            // Intento con API secundaria si la primera no da resultados
            const res2 = await axios.get(`https://api.agatz.xyz/api/pinterest?message=${encodeURIComponent(text)}`)
            images = res2.data.data
        }

        if (!images || images.length === 0) {
            await m.react('✖️')
            return m.reply(`ꕥ No se encontraron resultados en ninguna fuente para "${text}".`)
        }

        // Seleccionamos una imagen al azar de los resultados
        const chosen = Array.isArray(images) ? images[Math.floor(Math.random() * images.length)] : images

        await conn.sendMessage(m.chat, { 
            image: { url: chosen }, 
            caption: `❀ *Pinterest:* ${text}` 
        }, { quoted: m })

        await m.react('✔️')

    } catch (e) {
        console.error(e)
        await m.react('✖️')
        m.reply(`⚠︎ Las fuentes de Pinterest están saturadas. Intenta más tarde.`)
    }
}

handler.help = ['pinterest']
handler.command = ['pinterest', 'pin']
handler.tags = ["download"]

export default handler