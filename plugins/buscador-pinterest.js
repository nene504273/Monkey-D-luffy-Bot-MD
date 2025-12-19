import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`❀ Por favor, ingresa lo que deseas buscar.\nEjemplo: *${usedPrefix + command} luffy*`)

    try {
        await m.react('🕒')
        
        // Buscamos las imágenes
        const results = await searchPinterest(text)
        
        if (!results || results.length === 0) {
            await m.react('✖️')
            return m.reply(`ꕥ No pude encontrar imágenes para "${text}". Intenta con otra palabra.`)
        }

        // Elegimos una imagen al azar de los resultados
        const chosen = results[Math.floor(Math.random() * results.length)]

        await conn.sendMessage(m.chat, { 
            image: { url: chosen }, 
            caption: `❀ *Pinterest:* ${text}` 
        }, { quoted: m })

        await m.react('✔️')

    } catch (e) {
        console.error("Error en Pinterest:", e)
        await m.react('✖️')
        m.reply(`⚠︎ Error de conexión. Inténtalo de nuevo en unos segundos.`)
    }
}

handler.help = ['pinterest']
handler.command = ['pinterest', 'pin']
handler.tags = ["download"]

export default handler

async function searchPinterest(query) {
    try {
        const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D`
        
        const response = await axios.get(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'referer': 'https://www.pinterest.com/',
                'x-requested-with': 'XMLHttpRequest'
            }
        })

        const data = response.data.resource_response.data.results
        if (!data) return []
        
        return data.map(v => v.images.orig.url)
    } catch (e) {
        return []
    }
}