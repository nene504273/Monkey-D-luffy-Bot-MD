import axios from 'axios'

// Eliminamos fs para hacerlo todo en memoria (más rápido y limpio)
const fetchSticker = async (text, attempt = 1) => {
  try {
    const response = await axios.get(`https://skyzxu-brat.hf.space/brat`, { 
      params: { text }, 
      responseType: 'arraybuffer' 
    })
    return response.data
  } catch (error) {
    if (error.response?.status === 429 && attempt <= 3) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      return fetchSticker(text, attempt + 1)
    }
    throw error
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // 1. Validación de texto (Prioriza citado)
  let txt = m.quoted ? m.quoted.text : text
  if (!txt) return conn.reply(m.chat, `🏴‍☠️ ¡Oye! Necesito un texto.\nEjemplo: *${usedPrefix + command}* hola`, m)

  await m.react('🏴‍☠️')

  try {
    // 2. Metadatos del sticker
    const userName = m.pushName || 'Nakama'
    const date = new Date().toLocaleDateString('es-ES')
    let packname = `🏴‍☠️ Luffy Bot - ${userName}`
    let author = `🚢 Generado el: ${date}`

    // 3. Obtener el Buffer directamente
    const buffer = await fetchSticker(txt)

    // 4. Envío usando la función nativa de tu framework (conn.sendFile o conn.sendImageAsSticker)
    // Nota: En la mayoría de bots tipo "Luffy", la función es conn.sendImageAsSticker
    await conn.sendImageAsSticker(m.chat, buffer, m, { 
      packname: packname, 
      author: author 
    })

    await m.react('🍖')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    m.reply(`❌ Error en el motor de stickers: ${e.message}`)
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = ['brat', 'luffy']

export default handler