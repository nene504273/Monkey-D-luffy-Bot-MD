import axios from 'axios'
import { sticker } from '../lib/sticker.js' // Verifica que la ruta a lib/sticker.js sea correcta

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
  let txt = m.quoted ? m.quoted.text : text
  if (!txt) return conn.reply(m.chat, `🏴‍☠️ ¡Oye! Necesito un texto.\nEjemplo: *${usedPrefix + command}* hola`, m)

  await m.react('🏴‍☠️')

  try {
    const userName = m.pushName || 'Nakama'
    const date = new Date().toLocaleDateString('es-ES')
    let packname = `🏴‍☠️ Luffy Bot - ${userName}`
    let author = `🚢 Generado el: ${date}`

    // 1. Obtenemos la imagen (Buffer)
    const buffer = await fetchSticker(txt)

    // 2. Convertimos el buffer en un sticker con metadatos
    const stiker = await sticker(buffer, false, packname, author)

    // 3. Enviamos el sticker usando el método estándar de Baileys
    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      await m.react('🍖')
    } else {
      throw new Error('No se pudo procesar el sticker')
    }

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