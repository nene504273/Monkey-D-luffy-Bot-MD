import axios from 'axios'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const txt = text?.trim() || (m.quoted?.text?.trim()) || null

  if (!txt) {
    return conn.sendMessage(m.chat, {
      text: `🏴‍☠️ *¡Oye! Necesitas un texto.*\nEjemplo: _${usedPrefix + command} Hola_`
    }, { quoted: m })
  }

  // Reacción inicial (si el conector lo soporta)
  try { await conn.sendMessage(m.chat, { react: { text: '🏴‍☠️', key: m.key } }) } catch {}

  try {
    const nombre = m.pushName || 'Nakama'
    const fecha = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'numeric', year: 'numeric' })
    const tiempo = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    // Metadatos simples (evita multilínea larga que puede fallar)
    const packname = 'Luffy Bot MD'
    const author = `Usuario: ${nombre} | ${fecha} ${tiempo}`

    // URL con tu key
    const url = `https://api.alyacore.xyz/tools/brat?text=${encodeURIComponent(txt)}&key=LUFFY-GEAR4`

    // Descarga con timepo y verificando que sea imagen
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000
    })

    const contentType = response.headers['content-type']
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`La API no devolvió una imagen (recibido: ${contentType})`)
    }

    const buffer = Buffer.from(response.data)

    // Convierte a sticker (tu función original)
    const stickerBuf = await sticker(buffer, false, packname, author)
    if (!stickerBuf) throw new Error('No se pudo generar el sticker')

    // Envía el sticker
    await conn.sendMessage(m.chat, { sticker: stickerBuf }, { quoted: m })

    // Reacción final
    try { await conn.sendMessage(m.chat, { react: { text: '🍖', key: m.key } }) } catch {}

  } catch (e) {
    console.error('[brat]', e)
    try { await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } }) } catch {}
    conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = ['brat', 'luffy']
handler.register = true

export default handler