import fetch from 'node-fetch'

const emoji = '📌'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`${emoji} Por favor, ingresa el término de búsqueda.\nEjemplo: *${usedPrefix + command} Nevi*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

  try {
    const apiUrl = `https://api.alyacore.xyz/dl/pinvideo?query=${encodeURIComponent(text)}&key=LUFFY-GEAR4`
    const response = await fetch(apiUrl)

    // Verificar que la respuesta sea JSON antes de parsear
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('La API no devolvió JSON. Posible error en el servidor o clave inválida.')
    }

    const json = await response.json()

    // Validar estructura esperada
    if (!json.status || !json.data || !Array.isArray(json.data.videos) || json.data.videos.length === 0) {
      throw new Error('No se encontraron videos para esa búsqueda.')
    }

    // Tomar el primer video de la lista
    const video = json.data.videos[0]
    const { title, dl, duration, likes, thumb, link } = video

    // Construir caption
    const caption = `*${emoji} Título:* ${title || 'Sin título'}\n` +
                    `*⏱ Duración:* ${duration || 'N/A'}\n` +
                    `*❤️ Likes:* ${likes || 0}\n` +
                    `*🔗 Enlace original:* ${link || 'No disponible'}`

    // Enviar miniatura primero (opcional) y luego el video
    // Enviar miniatura como imagen con caption y luego el video sin caption para evitar duplicado
    if (thumb) {
      await conn.sendFile(m.chat, thumb, 'thumb.jpg', caption, m)
    }

    // Enviar el video
    await conn.sendFile(m.chat, dl, `${title || 'pinterest_video'}.mp4`, '', m)

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