import fetch from 'node-fetch'

const emoji = '📌' // Puedes cambiarlo si tu bot usa otro emoji

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`${emoji} Por favor, ingresa el término de búsqueda.\nEjemplo: *${usedPrefix + command} Nevi*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

  try {
    const apiUrl = `https://api.alyacore.xyz/dl/pinvideo?query=${encodeURIComponent(text)}&key=LUFFY-GEAR4`
    const response = await fetch(apiUrl)
    const json = await response.json()

    if (!json.status || !json.data || !json.data.dl) {
      throw new Error('No se encontró el video. Prueba con otra palabra clave.')
    }

    const { titulo, autor, pin, dl, type } = json.data
    const extension = type === 'video' ? '.mp4' : '.jpg' // por si acaso

    const caption = `
*${emoji} Título:* ${titulo || 'Desconocido'}
*👤 Autor:* ${autor || 'Desconocido'}
*🔗 Pin:* ${pin || 'No disponible'}
*📁 Tipo:* ${type || 'video'}
    `.trim()

    await conn.sendFile(m.chat, dl, `${titulo || 'pinterest'}${extension}`, caption, m)
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