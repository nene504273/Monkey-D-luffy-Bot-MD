import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`❀ Por favor, ingresa lo que deseas buscar.\nEjemplo: *${usedPrefix + command} luffy*`)

    try {
        await m.react('🕒')
        
        // Usamos una API de búsqueda más directa
        const response = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/`, {
            params: {
                source_url: `/search/pins/?q=${encodeURIComponent(text)}`,
                data: JSON.stringify({
                    options: {
                        isPrefetch: false,
                        query: text,
                        scope: "pins",
                        no_fetch_context_on_resource: false
                    },
                    context: {}
                })
            }
        })

        const results = response.data.resource_response.data.results
        
        if (!results || results.length === 0) {
            await m.react('✖️')
            return m.reply(`ꕥ No se encontraron resultados para "${text}".`)
        }

        // Seleccionamos una imagen al azar de los primeros 10 resultados
        const randomImage = results[Math.floor(Math.random() * Math.min(results.length, 10))]
        const url = randomImage.images.orig.url

        await conn.sendMessage(m.chat, { 
            image: { url: url }, 
            caption: `❀ *Pinterest Search* ❀\n\n✧ *Búsqueda:* ${text}\n🔗 *Link:* https://www.pinterest.com/pin/${randomImage.id}` 
        }, { quoted: m })

        await m.react('✔️')

    } catch (e) {
        console.error(e)
        await m.react('✖️')
        m.reply(`⚠︎ Error al buscar en Pinterest. Inténtalo de nuevo.`)
    }
}

handler.help = ['pinterest']
handler.command = ['pinterest', 'pin']
handler.tags = ["download"]

export default handler