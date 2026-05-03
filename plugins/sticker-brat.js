import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

// ⚠️ Coloca aquí tu API key (si cambia, solo edita esta línea)
const API_KEY = 'LUFFY-GEAR4'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // 1. Obtener el texto
  const txt = text?.trim() || m.quoted?.text?.trim() || ''

  if (!txt) {
    return conn.sendMessage(m.chat, {
      text: `🏴‍☠️ *Escribe un texto para el sticker*\nEjemplo: *${usedPrefix + command}* Hola`
    }, { quoted: m })
  }

  // 2. Reacción de espera
  try { await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }) } catch {}

  try {
    // 3. Construir la URL con la key
    const url = `https://api.alyacore.xyz/tools/brat?text=${encodeURIComponent(txt)}&key=${API_KEY}`

    // 4. Descargar la imagen
    const res = await fetch(url, { timeout: 15000 })
    if (!res.ok) throw new Error('La API no respondió correctamente')

    const buffer = Buffer.from(await res.arrayBuffer())

    // 5. Convertir a sticker con tu librería
    const stickerBuffer = await sticker(buffer, false, '', '')

    // 6. Metadatos del sticker
    const nombre = m.pushName || 'Nakama'
    const fecha = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'numeric', year: 'numeric' })
    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

    // 7. Enviar el sticker
    await conn.sendMessage(m.chat, {
      sticker: stickerBuffer,
      packname: 'Brat Sticker',
      author: `${nombre} • ${fecha} ${hora}`
    }, { quoted: m })

    // 8. Reacción de éxito
    try { await conn.sendMessage(m.chat, { react: { text: '🍖', key: m.key } }) } catch {}

  } catch (err) {
    console.error('[brat]', err)
    try { await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } }) } catch {}
    conn.sendMessage(m.chat, { text: `❌ Error: ${err.message}` }, { quoted: m })
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = ['brat', 'luffy']
handler.register = true

export default handler