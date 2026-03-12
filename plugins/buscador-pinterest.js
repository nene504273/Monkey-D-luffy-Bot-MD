import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verificamos que el usuario haya ingresado un término de búsqueda
    if (!text) throw `*⚓ ¡Capitán! Indique qué buscar.*\n\n*Ejemplo:* ${usedPrefix + command} Nami aesthetic`

    try {
        // Llamada a la API con tu Key
        let response = await axios.get(`https://api.causas.xyz/api/v1/buscadores/pinterest?apikey=causa-f8289f3a4ffa44bb&q=${encodeURIComponent(text)}`)
        let res = response.data

        if (!res.status || !res.data || res.data.length === 0) throw '❌ No encontré ningún tesoro con ese nombre.'

        // Seleccionamos un resultado al azar de la lista
        let image = res.data[Math.floor(Math.random() * res.data.length)]

        let caption = `
✨ *P I N T E R E S T* ✨
──────────────────
🌊 *Búsqueda:* ${text}
📌 *Título:* ${image.title || 'Imagen de Pinterest'}
──────────────────
*Monkey D. Luffy Bot MD* 🏴‍☠️`.trim()

        // Enviamos la imagen con el diseño estilizado
        await conn.sendFile(m.chat, image.image, 'pinterest.jpg', caption, m)

    } catch (e) {
        console.error(e)
        m.reply('❌ Hubo un error al navegar por los mares de Pinterest.')
    }
}

handler.help = ['pin <texto>', 'pinterest <texto>']
handler.tags = ['buscadores']
handler.command = /^(pin|pinterest)$/i

export default handler