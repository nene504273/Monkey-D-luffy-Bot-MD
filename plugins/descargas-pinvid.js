import fetch from 'node-fetch'

const emoji = '📌'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`${emoji} Por favor, ingresa el término de búsqueda.\nEjemplo: *${usedPrefix + command} Gotica*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

  try {
    const apiUrl = `https://api.alyacore.xyz/search/pinterestvideo?query=${encodeURIComponent(text)}&key=LUFFY-GEAR6`
    const response = await fetch(apiUrl)

    if (!response.ok) throw new Error(`Error del servidor: ${response.status}`)

    const json = await response.json()

    if (!json.status || !json.data?.videos || json.data.videos.length === 0) {
      throw new Error('No se encontraron videos para esta búsqueda.')
    }

    // Elegir un video aleatorio
    const randomIndex = Math.floor(Math.random() * json.data.videos.length)
    const video = json.data.videos[randomIndex]
    const { title, dl, duration, likes, thumb, link } = video

    // Descargar el video como buffer (evita fallos con URLs directas)
    const videoRes = await fetch(dl)
    if (!videoRes.ok) throw new Error('No se pudo descargar el video.')
    const videoBuffer = await videoRes.buffer()

    // Descargar miniatura (opcional, para thumbnail)
    let thumbBuffer = null
    if (thumb) {
      try {
        const thumbRes = await fetch(thumb)
        if (thumbRes.ok) thumbBuffer = await thumbRes.buffer()
      } catch {}
    }

    const caption = `🎬 *Título:* ${title || 'Sin título'}\n⏱ *Duración:* ${duration || 'N/A'}\n❤️ *Likes:* ${likes || 0}\n🔗 *Fuente:* ${link || 'No disponible'}`.trim()

    // Enviar video con buffer
    await conn.sendMessage(m.chat, {
      video: videoBuffer,
      caption: caption,
      gifPlayback: false,
      jpegThumbnail: thumbBuffer || undefined
    }, { quoted: m })

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