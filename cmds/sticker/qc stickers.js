import db from "#db"
import fs from 'fs'
import fetch from 'node-fetch'
import { exec } from 'child_process'
import exif from '../../lib/exif.js'
const { writeExif } = exif

export default {
  command: ['qc', 'quote'],
  category: 'stickers',
  description: 'Crea un sticker de cita (quote) con el texto o mensaje citado',

  run: async ({ msg, sock, args, text, usedPrefix: prefix, command }) => {
    try {
      // 1. Obtener el texto
      let textoSticker = text.trim()
      if (!textoSticker && msg.quoted) {
        textoSticker = msg.quoted.text || ''
      }

      if (!textoSticker) {
        return sock.reply(msg.chat, `❀ Te faltó el texto o cita un mensaje.\n*Ejemplo:* ${prefix + command} Hola mundo`, msg)
      }

      if (textoSticker.length > 40) {
        return sock.reply(msg.chat, `❖ El texto no puede tener más de 40 caracteres.`, msg)
      }

      msg.react('⏳')

      // 2. Determinar el target de la cita
      const targetJid = msg.quoted ? msg.quoted.sender : msg.sender

      // ✅ NOMBRE: usamos tu DB (ya no usamos sock.getName)
      let nombre = 'Usuario'
      try {
        const userTarget = await db.getUser(targetJid)
        if (userTarget && userTarget.name) {
          nombre = userTarget.name
        } else if (msg.pushName && msg.pushName.trim()) {
          nombre = msg.pushName
        } else {
          nombre = targetJid.split('@')[0]
        }
      } catch {
        nombre = (msg.pushName && msg.pushName.trim()) || targetJid.split('@')[0]
      }

      // 3. Foto de perfil (con fallback seguro)
      let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
      try {
        if (typeof sock.profilePictureUrl === 'function') {
          pp = await sock.profilePictureUrl(targetJid, 'image')
        }
      } catch {
        // sin foto → se queda con la por defecto
      }

      // 4. Payload de la API
      const obj = {
        type: "quote",
        format: "png",
        backgroundColor: "#000000",
        width: 512,
        height: 768,
        scale: 2,
        messages: [{
          entities: [],
          avatar: true,
          from: {
            id: 1,
            name: nombre,
            photo: { url: pp }
          },
          text: textoSticker,
          replyMessage: {}
        }]
      }

      // 5. Consumir la API
      const res = await fetch('https://bot.lyo.su/quote/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
      })

      const data = await res.json()

      if (!res.ok || !data.result || !data.result.image) {
        msg.react('❌')
        return sock.reply(msg.chat, '❖ Error al generar la cita. Intenta de nuevo.', msg)
      }

      // 6. Base64 → Buffer
      const buffer = Buffer.from(data.result.image, 'base64')

      // 7. Carpeta temporal
      if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp')
      }

      const timestamp = Date.now()
      const tempInput = `./temp/qc_${timestamp}.png`
      const tempOutput = `./temp/qc_${timestamp}.webp`

      fs.writeFileSync(tempInput, buffer)

      // 8. PNG → WebP (obligatorio para tu writeExif)
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" -c:v libwebp -lossless 1 -loop 0 -an -vsync 0 "${tempOutput}"`, (error) => {
          if (error) reject(error)
          else resolve()
        })
      })

      // 9. Marca de agua desde tu DB
      let user = await db.getUser(msg.sender)
      const name = user.name
      let texto1 = user.metadatos || `S'ᴛᴇʟʟᴀʀ 🧠 WᴀBᴏᴛ`
      let texto2 = user.metadatos2 || `@${name}`

      // 10. Exif + envío
      const webpBuffer = fs.readFileSync(tempOutput)
      const media = { mimetype: 'image/webp', data: webpBuffer }
      const metadata = { packname: texto1, author: texto2, categories: [''] }

      const stickerPath = await writeExif(media, metadata)

      await sock.sendMessage(msg.chat, {
        sticker: { url: stickerPath }
      }, { quoted: msg })

      msg.react('✅')

      // 11. Limpieza
      fs.unlinkSync(tempInput)
      fs.unlinkSync(tempOutput)
      fs.unlinkSync(stickerPath)

    } catch (e) {
      console.error('Error en qc/quote:', e)
      msg.react('❌')
      return sock.reply(msg.chat, '✿꙳.˖ Ocurrió un error al crear la cita.', msg)
    }
  }
}