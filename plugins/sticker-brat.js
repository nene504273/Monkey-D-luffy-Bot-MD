
import axios from 'axios'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const txt = text?.trim() || (m.quoted?.text?.trim()) || null

  if (!txt) return m.reply(`🏴‍☠️ ¡Oye! Necesita un texto.\nEjemplo: *${usedPrefix + command}* hola`)

  await m.react('🏴‍☠️')

  try {
    const nombre = m.pushName || 'Nakama'
    const fecha = new Date().toLocaleDateString('es-CO', {
      day: '2-digit', month: 'numeric', year: 'numeric'
    })
    const tiempo = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    })

    const packname = ``
    const author = [
      `𖤓 Usuario: ${nombre}`,
      `𖤓 Bot: —͞ू⃪🍖 Lᴜғғʏ-Bᴏᴛ-MD ◖🏴‍☠️`,
      `𖤓 Fecha: ${fecha}`,
      `𖤓 ${tiempo} • —͞ू⃪✧ Sombrero de Paja`
    ].join('\n')

    const url = `https://api.alyacore.xyz/tools/brat?text=${encodeURIComponent(txt)}&key=LUFFY-GEAR4`
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const buffer = response.data

    if (!buffer) throw new Error('Sin respuesta de la API')

    const stickerBuf = await sticker(buffer, false, packname, author)
    if (!stickerBuf) throw new Error('Error al procesar el sticker')

    await conn.sendFile(m.chat, stickerBuf, 'sticker.webp', '', m)
    await m.react('🍖')

  } catch (e) {
    console.error('[brat]', e)
    await m.react('✖️')
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['brat <texto>']
handler.tags = ['sticker']
handler.command = ['brat', 'luffy']
handler.register = true

export default handler