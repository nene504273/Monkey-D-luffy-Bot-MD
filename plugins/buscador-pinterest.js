import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, args, usedPrefix }) => {
    if (!text) return m.reply(`❀ Por favor, ingresa lo que deseas buscar por Pinterest.`)
    
    try {
        await m.react('🕒')
        
        if (text.includes("https://")) {
            // Lógica para descargar desde un link directo
            let i = await dl(args[0])
            let isVideo = i.download.includes(".mp4")
            await conn.sendMessage(m.chat, { [isVideo ? "video" : "image"]: { url: i.download }, caption: i.title }, { quoted: m })
            await m.react('✔️')
        } else {
            // Lógica para buscar por texto
            const results = await pins(text)
            if (!results.length) {
                await m.react('✖️')
                return conn.reply(m.chat, `ꕥ No se encontraron resultados para "${text}".`, m)
            }

            // Seleccionamos la primera imagen para enviar (o puedes hacer un bucle)
            let img = results[0].image_large_url
            
            await conn.sendMessage(m.chat, { 
                image: { url: img }, 
                caption: `❀ *Pinterest Search* ❀\n\n✧ *Búsqueda:* ${text}\n\n> Se ha enviado la imagen principal.` 
            }, { quoted: m })
            
            await m.react('✔️')
        }
    } catch (e) {
        console.error(e)
        await m.react('✖️')
        conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n` + e.message, m)
    }
}

handler.help = ['pinterest']
handler.command = ['pinterest', 'pin']
handler.tags = ["download"]
handler.group = true

export default handler

// --- Funciones de ayuda (se mantienen igual pero corregidas) ---

async function dl(url) {
    try {
        let res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } })
        let $ = cheerio.load(res.data)
        let tag = $('script[data-test-id="video-snippet"]')
        if (tag.length) {
            let result = JSON.parse(tag.text())
            return { title: result.name, download: result.contentUrl }
        } else {
            let json = JSON.parse($("script[data-relay-response='true']").eq(0).text())
            let result = json.response.data["v3GetPinQuery"].data
            return { title: result.title, download: result.imageLargeUrl }
        }
    } catch {
        return { msg: "Error" }
    }
}

const pins = async (judul) => {
    const link = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(judul)}&data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(judul)}%22%2C%22scope%22%3A%22pins%22%7D%2C%22context%22%3A%7B%7D%7D`
    try {
        const res = await axios.get(link)
        const data = res.data.resource_response.data.results
        return data.map(item => ({
            image_large_url: item.images.orig?.url || null
        })).filter(img => img.image_large_url !== null)
    } catch (error) {
        return []
    }
}