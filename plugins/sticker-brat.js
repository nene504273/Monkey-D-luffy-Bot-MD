import axios from 'axios'
import { sticker } from '../lib/sticker.js'

const fetchSticker = async (text, attempt = 1) => {
  try {
    const url = `https://skyzxu-brat.hf.space/brat?text=${encodeURIComponent(text)}`
    const response = await axios.get(url, { responseType: 'arraybuffer' })
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
  let txt = text ? text : (m.quoted && m.quoted.text ? m.quoted.text : null)
  
  if (!txt) return conn.reply(m.chat, `🏴‍☠️ ¡Oye! Necesito un texto.\nEjemplo: *${usedPrefix + command}* hola`, m)

  await m.react('🏴‍☠️')

  try {
    const name = m.pushName || 'Nakama'
    const fecha = new Date().toLocaleDateString('es-ES')
    const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    
    let packname = `—͟͟͞͞🏴‍☠️ ✢ ✧ ✦ ✧ ✦ ✢ 🏴‍☠️`
    let author = `   ｡ ﾟ ﾟ･       ･ ﾟ ﾟ ｡
☼ Usuario: ${name}
☼ Bot: —͟͟͞͞🍖 '‧˚꒰🏴‍☠️꒱ ፝͜⁞ M͢ᴏɴᴋᴇʏ D L͢ᴜғғʏ-𝘉𝘰𝘵-𝑴𝑫✰⃔⃝'
☼ Fecha: ${fecha}
☼ ${hora} • —͟͟͞͞✧ Sombrero de Paja ✧ ͟͟͞͞—`

    const buffer = await fetchSticker(txt)

    if (!buffer) throw new Error('Error de API')

    const stiker = await sticker(buffer, false, packname, author)

    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      await m.react('🍖')
    } else {
      throw new Error('Error al procesar sticker')
    }

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = ['brat']

export default handler
