import axios from 'axios'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Captura el texto del mensaje o del mensaje citado
  const txt = text ? text : m.quoted && m.quoted.text ? m.quoted.text : null

  if (!txt) {
    return conn.sendMessage(m.chat, {
      text: `✐ ֹ ִ 🏴‍☠️ *¡Oye Nakama! Necesitas un texto.* \n\n> *Ejemplo:* _${usedPrefix + command} Hola_`
    }, { quoted: m })
  }

  // Reacción inicial (Procesando)
  try { 
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }) 
  } catch (e) {}

  try {
    const nombre = m.pushName || 'Nakama'
    const packname = 'Luffy Bot MD ✐ ֹ ִ' // Branding corregido
    const author = `⚓ ${nombre}`

    // URL de la API con el texto codificado y tu Key
    const apiURL = `https://api.alyacore.xyz/tools/brat?text=${encodeURIComponent(txt)}&key=LUFFY-GEAR4`

    // Petición con axios asegurando el tipo de respuesta
    const response = await axios.get(apiURL, { responseType: 'arraybuffer' })

    if (!response.data) throw new Error('La API no devolvió datos.')

    // Conversión a sticker usando tu librería interna
    const stickerBuffer = await sticker(response.data, false, packname, author)

    if (!stickerBuffer) throw new Error('No se pudo procesar el sticker.')

    // Envío del sticker y reacción de éxito
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: '🍖', key: m.key } })

  } catch (err) {
    console.error('[ERROR BRAT]:', err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    
    // Mensaje de error para el usuario
    conn.sendMessage(m.chat, { 
      text: `❌ *Error en el sistema:* \n\n${err.message}` 
    }, { quoted: m })
  }
}

handler.help = ['brat <texto>', 'luffy <texto>']
handler.tags = ['sticker']
handler.command = /^(brat|luffy)$/i // Soporta ambos nombres de comando
handler.register = true

export default handler