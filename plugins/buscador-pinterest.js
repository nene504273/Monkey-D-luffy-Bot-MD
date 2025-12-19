import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validar que el usuario haya escrito algo
    if (!text) return m.reply(`❀ Por favor, ingresa lo que deseas buscar.\nEjemplo: *${usedPrefix + command} luffy*`)

    const NEVI_API_URL = 'http://neviapi.ddns.net:5000'
    const NEVI_API_KEY = 'ellen'

    try {
        await m.react('🕒')

        // 2. Hacer la petición a la API de Nevi
        // Usamos el endpoint de Pinterest (asumiendo /pinterest o /api/pinterest según la estructura común de Nevi)
        const response = await axios.get(`${NEVI_API_URL}/api/pinterest`, {
            params: {
                q: text,
                apikey: NEVI_API_KEY
            }
        })

        // 3. Extraer los datos (Nevi suele devolver un array en .result o .data)
        const results = response.data.result || response.data.data
        
        if (!results || results.length === 0) {
            await m.react('✖️')
            return m.reply(`ꕥ No se encontraron resultados para "${text}" en la API.`)
        }

        // 4. Elegir una imagen aleatoria del resultado
        const randomImage = results[Math.floor(Math.random() * results.length)]

        // 5. Enviar la imagen
        await conn.sendMessage(m.chat, { 
            image: { url: randomImage }, 
            caption: `❀ *Pinterest Search* ❀\n\n✧ *Búsqueda:* ${text}\n✨ *Powered by:* Nevi API` 
        }, { quoted: m })

        await m.react('✔️')

    } catch (e) {
        console.error("ERROR NEVI API:", e.response?.data || e.message)
        await m.react('✖️')
        
        // Mensaje de error más detallado para debug
        m.reply(`⚠︎ Error al conectar con Nevi API.\n> Detalle: ${e.response?.data?.message || e.message}`)
    }
}

handler.help = ['pinterest']
handler.command = ['pinterest', 'pin']
handler.tags = ["download"]

export default handler