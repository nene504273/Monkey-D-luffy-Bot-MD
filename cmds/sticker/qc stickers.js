import db from "#db"
import fs from 'fs'
import fetch from 'node-fetch'
import { exec } from 'child_process'
import exif from '../../lib/exif.js'
const { writeExif } = exif

// 🌐 Instancia oficial ACTUAL (bot.lyo.su murió → ahora es quote.yuri.ly)
const QUOTE_API = 'https://quote.yuri.ly'

// Respaldo: PNG → WebP con ffmpeg (por si la ruta webp directa falla)
const pngAWebp = (buffer) => new Promise((resolve, reject) => {
  if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')
  const inp = `./temp/qc_${Date.now()}.png`
  const out = `./temp/qc_${Date.now()}.webp`
  fs.writeFileSync(inp, buffer)
  exec(`ffmpeg -i "${inp}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" -c:v libwebp -lossless 1 -loop 0 -an -vsync 0 "${out}"`, (err) => {
    try { fs.unlinkSync(inp) } catch {}
    if (err) return reject(err)
    const webp = fs.readFileSync(out)
    try { fs.unlinkSync(out) } catch {}
    resolve(webp)
  })
})

export default {
  command: ['qc', 'quote'],
  category: 'stickers',
  description: 'Crea un sticker de cita (quote) con el texto o mensaje citado',

  run: async ({ msg, sock, args, text, usedPrefix: prefix, command }) => {
    try {
      // 1. Texto
      let textoSticker = text.trim()
      if (!textoSticker && msg.quoted) textoSticker = msg.quoted.text || ''

      if (!textoSticker) {
        return sock.reply(msg.chat, `❀ Te faltó el texto o cita un mensaje.\n*Ejemplo:* ${prefix + command} Hola mundo`, msg)
      }
      if (textoSticker.length > 40) {
        return sock.reply(msg.chat, `❖ El texto no puede tener más de 40 caracteres.`, msg)
      }

      msg.react('⏳')

      // 2. Nombre desde tu DB (sin sock.getName)
      const targetJid = msg.quoted ? msg.quoted.sender : msg.sender
      let nombre = 'Usuario'
      try {
        const userTarget = await db.getUser(targetJid)
        if (userTarget?.name) nombre = userTarget.name
        else if (msg.pushName?.trim()) nombre = msg.pushName
        else nombre = targetJid.split('@')[0]
      } catch {
        nombre = msg.pushName?.trim() || targetJid.split('@')[0]
      }

      // 3. Foto de perfil con fallback
      let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
      try {
        if (typeof sock.profilePictureUrl === 'function') {
          pp = await sock.profilePictureUrl(targetJid, 'image')
        }
      } catch {}

      // 4. Payload
      const obj = {
        type: 'quote',
        backgroundColor: '#000000',
        width: 512,
        height: 768,
        scale: 2,
        messages: [{
          entities: [],
          avatar: true,
          from: { id: 1, name: nombre, photo: { url: pp } },
          text: textoSticker,
          replyMessage: {}
        }]
      }

      let webpBuffer = null

      // 5. INTENTO 1: WebP binario directo (sin ffmpeg)
      try {
        const r1 = await fetch(`${QUOTE_API}/generate.webp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...obj, format: 'webp' })
        })
        if (r1.ok) {
          const b = Buffer.from(await r1.arrayBuffer())
          if (b.length > 100 && b.slice(0, 4).toString('ascii') === 'RIFF') webpBuffer = b
        }
      } catch (e) {
        console.log('⚠️ Ruta webp directa falló, uso respaldo:', e.message)
      }

      // 6. INTENTO 2: base64 PNG + conversión ffmpeg
      if (!webpBuffer) {
        const r2 = await fetch(`${QUOTE_API}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...obj, format: 'png' })
        })
        const data = await r2.json()
        if (!r2.ok || !data.image) {
          msg.react('❌')
          return sock.reply(msg.chat, '❖ Error al generar la cita. Intenta de nuevo.', msg)
        }
        webpBuffer = await pngAWebp(Buffer.from(data.image, 'base64'))
      }

      // 7. Marca de agua desde tu DB
      let user = await db.getUser(msg.sender)
      const name = user.name
      let texto1 = user.metadatos || `S'ᴛᴇʟᴀʀ  WᴀBᴏᴛ`
      let texto2 = user.metadatos2 || `@${name}`

      // 8. Exif + envío
      const media = { mimetype: 'image/webp', data: webpBuffer }
      const metadata = { packname: texto1, author: texto2, categories: [''] }
      const stickerPath = await writeExif(media, metadata)

      await sock.sendMessage(msg.chat, { sticker: { url: stickerPath } }, { quoted: msg })
      msg.react('✅')
      fs.unlinkSync(stickerPath)

    } catch (e) {
      console.error('Error en qc/quote:', e)
      msg.react('❌')
      return sock.reply(msg.chat, '✿꙳. Ocurrió un error al crear la cita.', msg)
    }
  }
}