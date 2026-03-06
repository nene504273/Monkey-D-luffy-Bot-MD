import axios from 'axios'
import fs from 'fs'

/**
 * Función de retraso para manejar el Rate Limit (429)
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Función para obtener el sticker desde la API de Brat
 */
const fetchSticker = async (text, attempt = 1) => {
  try {
    const response = await axios.get(`https://skyzxu-brat.hf.space/brat`, { 
      params: { text }, 
      responseType: 'arraybuffer' 
    })
    return response.data
  } catch (error) {
    if (error.response?.status === 429 && attempt <= 3) {
      const retryAfter = error.response.headers['retry-after'] || 5
      await delay(retryAfter * 1000)
      return fetchSticker(text, attempt + 1)
    }
    throw error
  }
}

let handler = async (client, m, { conn, args, usedPrefix, command, text }) => {
  try {
    // Prioriza el texto citado, luego el argumento, luego nada
    text = m.quoted?.text || text
    if (!text) return client.reply(m.chat, '🍖 ¡Oye! Necesito un texto para crear el sticker. ¡No puedo ser el Rey de los Piratas sin instrucciones!', m)

    await m.react('🏴‍☠️') // Reacción temática de One Piece

    // Configuración de usuario y tiempo
    let user = globalThis.db?.data?.users[m.sender] || {}
    const userName = m.pushName || m.sender.split('@')[0]
    const botName = 'Luffy Bot' // Puedes cambiar esto al nombre real de tu bot
    
    // Formateo de fecha y hora
    const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    // Estilo del Sticker (Packname y Author)
    let packname = `🏴‍☠️ Monkey D. Luffy - Nakama: ${userName}`
    let author = `🚢 ${botName} | ${date} • ${time}`

    // Obtención del buffer de imagen
    const buffer = await fetchSticker(text)
    const tmpFile = `./tmp-${Date.now()}.webp`
    
    // Escritura y envío
    fs.writeFileSync(tmpFile, buffer)
    await client.sendImageAsSticker(m.chat, tmpFile, m, { 
      packname: packname, 
      author: author 
    })

    // Limpieza
    fs.unlinkSync(tmpFile)
    await m.react('🍖')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    return m.reply(`🏴‍☠️ ¡Un error ha hundido el barco! Inténtalo de nuevo, Nakama.\n> [Error: *${e.message}*]`)
  }
}

handler.command = ['brat', 'luffy']
handler.help = ['brat <texto>']
handler.tags = ['sticker']

export default handler