import fetch from 'node-fetch'

const emoji = '📌'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`${emoji} Por favor, ingresa el término de búsqueda.\nEjemplo: *${usedPrefix + command} Nevi*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

  try {
    // *** CORRECCIÓN: Nuevo endpoint de búsqueda ***
    const apiUrl = `https://api.alyacore.xyz/search/pinterestvideo?query=${encodeURIComponent(text)}&key=LUFFY-GEAR6`
    
    const response = await fetch(apiUrl)
    
    // *** MEJORA: Manejo más robusto de la respuesta ***
    // Si la respuesta no es OK, lanzamos un error descriptivo.
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`)
    }
    
    const json = await response.json()

    // *** CORRECCIÓN: Adaptación a la nueva estructura de la API ***
    if (!json.status || !json.data || !Array.isArray(json.data.videos) || json.data.videos.length === 0) {
      throw new Error('No se encontraron videos para esta búsqueda.')
    }

    // *** NUEVO: Seleccionar un video aleatorio de la lista para variar ***
    const randomIndex = Math.floor(Math.random() * json.data.videos.length)
    const video = json.data.videos[randomIndex]
    const { title, dl, duration, likes, thumb, link } = video

    const caption = `🎬 *Título:* ${title || 'Sin título'}\n⏱ *Duración:* ${duration || 'N/A'}\n❤️ *Likes:* ${likes || 0}\n🔗 *Fuente:* ${link || 'No disponible'}`.trim()

    // Enviar el video con su caption
    await conn.sendFile(m.chat, dl, `${title || 'pinterest_video'}.mp4`, caption, m)

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (error) {
    console.error(error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return m.reply(`${emoji} Ocurrió un error: ${error.message}`)
  }
}

handler.help = ['pinvid *<búsqueda>*']
handler.tags = ['descargas']
handler.command = ['pinvideo', 'pinvid']
handler.premium = false
handler.group = true
handler.register = true
handler.coin = 2

export default handler