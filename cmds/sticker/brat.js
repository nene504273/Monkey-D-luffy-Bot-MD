import db from "#db"
import fs from 'fs'
import fetch from 'node-fetch'
import exif from '../../lib/exif.js'
const { writeExif } = exif

export default {
  command: ['brat', 'sbrat'],
  category: 'stickers',
  run: async ({ msg, sock, text, usedPrefix: prefix, command }) => {
    try {
      const textoSticker = text.trim()
      if (!textoSticker) {
        return sock.reply(msg.chat, `❀ Escribe un texto para tu sticker Brat.\n*Ejemplo:* ${prefix + command} Hola`, msg)
      }

      const user = await db.getUser(msg.sender)
      const pack = user.metadatos || `S'ᴛᴇʟʟᴀʀ  WᴀBᴏᴛ`
      const author = user.metadatos2 || `@${user.name}`

      const apiUrl = `https://api.alyacore.xyz/tools/brat?text=${encodeURIComponent(textoSticker)}&key=LUFFY-FIX67`

      const res = await fetch(apiUrl)
      if (!res.ok) return msg.reply('❖ La API de Brat falló, intenta de nuevo.')

      // 🔑 AQUÍ ESTABA EL BUG: ahora usamos el mimetype REAL que devuelve la API
      // (devuelve "image/png", así writeExif sí hace la conversión PNG → WebP)
      const mime = (res.headers.get('content-type') || 'image/png').split(';')[0].trim()
      const buffer = Buffer.from(await res.arrayBuffer())

      const media = { mimetype: mime, data: buffer }   // ← image/png, NO image/webp
      const metadata = { packname: pack, author: author, categories: [''] }
      const stickerPath = await writeExif(media, metadata)

      await sock.sendMessage(msg.chat, { sticker: { url: stickerPath } }, { quoted: msg })
      fs.unlinkSync(stickerPath)
    } catch (e) {
      console.error(e)
      return msg.reply(msgglobal)
    }
  }
}