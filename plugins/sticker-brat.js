import axios from 'axios'
import { sticker } from '../lib/sticker.js'

// ✐ ֹ ִ ── [ APARTADO DE CONFIGURACIÓN ] ── ֹ ִ ✐
const API_KEY = 'LUFFY-GEAR4' 
const BASE_URL = 'https://api.alyacore.xyz/tools/brat'
// ─────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Captura el texto del mensaje actual o de un mensaje citado
  const content = text ? text : m.quoted && m.quoted.text ? m.quoted.text : null

  if (!content) {
    return conn.sendMessage(m.chat, {
      text: `✐ ֹ ִ 🏴‍☠️ *¡Oye Nakama! Falta el texto.* \n\n> *Uso:* _${usedPrefix + command} <tu mensaje>_`
    }, { quoted: m })
  }

  // Reacción de "procesando" para indicar que el bot está trabajando
  try { await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }) } catch (e) {}

  try {
    const pushName = m.pushName || 'Nakama'
    const botName = 'Monkey D. Luffy Bot - MD'
    const packname = `✐ ֹ ִ ${botName}`
    const author = `⚓ ${pushName}`

    // Construcción de la URL con la lógica de la API
    const finalUrl = `${BASE_URL}?text=${encodeURIComponent(content)}&key=${API_KEY}`

    // Petición a la API configurada para recibir datos binarios (Buffer)
    const response = await axios.get(finalUrl, { 
      responseType: 'arraybuffer',
      timeout: 20000 // Tiempo de espera para evitar bloqueos
    })

    if (!response.data) throw new Error('La API no devolvió contenido visual.')

    // Generación del sticker con los metadatos del bot
    const stickerBuffer = await sticker(response.data, false, packname, author)

    if (!stickerBuffer) throw new Error('Error al transformar la imagen en sticker.')

    // Envío del sticker y reacción final de éxito
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '🍖', key: m.key } })

  } catch (err) {
    console.error(`[ERROR EN ${command.toUpperCase()}]:`, err.message)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    
    // Notificación de error al usuario
    conn.sendMessage(m.chat, { 
      text: `❌ *Hubo un problema en el Grand Line:* \n\n${err.message}` 
    }, { quoted: m })
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = /^(brat|luffy)$/i // El comando responde a !brat o !luffy
handler.register = true

export default handler