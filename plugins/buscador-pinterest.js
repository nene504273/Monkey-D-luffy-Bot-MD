import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verificamos que el usuario escriba algo para buscar
    if (!text) throw `*⚓ ¡Capitán! Escriba qué desea buscar en Pinterest.*\n\n*Ejemplo:* ${usedPrefix + command} Luffy Gear 5`

    try {
        // Configuración de la API (Separada para evitar errores)
        const endpoint = 'https://api.causas.xyz/api/v1/buscadores/pinterest'
        const apiKey = 'causa-f8289f3a4ffa44bb'
        
        // Realizamos la consulta
        const response = await axios.get(`${endpoint}?apikey=${apiKey}&q=${encodeURIComponent(text)}`)
        const res = response.data

        // Validación de datos recibidos
        if (!res.status || !res.data || res.data.length === 0) {
            return m.reply('❌ No se encontraron imágenes para esta búsqueda.')
        }

        // Seleccionamos una imagen aleatoria del array de resultados
        const pin = res.data[Math.floor(Math.random() * res.data.length)]

        // Diseño Aesthetic / One Piece
        let caption = `
✨ *P I N T E R E S T* ✨
──────────────────
🌊 *Búsqueda:* ${text}
📌 *Título:* ${pin.title || 'Sin Título'}
──────────────────
*Monkey D. Luffy Bot MD* 🏴‍☠️`.trim()

        // Enviamos el archivo
        await conn.sendFile(m.chat, pin.image, 'pinterest.jpg', caption, m)

    } catch (e) {
        console.error(e)
        // Si hay un error, lo notificamos de forma más específica en consola para ti
        m.reply('❌ ¡Error! Los mares están agitados y no pude obtener la imagen. Reintente en un momento.')
    }
}

handler.help = ['pin <texto>']
handler.tags = ['buscadores']
handler.command = /^(pin|pinterest)$/i

export default handler