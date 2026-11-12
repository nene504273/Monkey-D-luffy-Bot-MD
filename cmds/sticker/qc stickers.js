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
      // 1. Obtener el texto (del argumento o del mensaje citado)
      let textoSticker = text.trim()
      if (!textoSticker && msg.quoted) {
        textoSticker = msg.quoted.text || ''
      }

      if (!textoSticker) {
        return sock.reply(msg.chat, `❀ Te faltó el texto o cita un mensaje.\n*Ejemplo:* ${usedPrefix + command} Hola mundo`, msg)
      }

      // Límite de caracteres (ajustado a 40 para que coincida la lógica)
      if (textoSticker.length > 40) {
        return sock.reply(msg.chat, `❖ El texto no puede tener más de 40 caracteres.`, msg)
      }

      msg.react('⏳')

      // 2. Determinar de quién será la cita (del citado o del usuario que escribe)
      const targetJid = msg.quoted ? msg.quoted.sender : msg.sender
      const nombre = await sock.getName(targetJid) || 'Usuario'
      
      let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png' // Imagen por defecto
      try {
        pp = await sock.profilePictureUrl(targetJid, 'image')
      } catch (e) {
        // Si no tiene foto o da error, se queda con la por defecto
      }

      // 3. Preparar el payload para la API de Quote
      const obj = {
        type: "quote",
        format: "png",
        backgroundColor: "#000000", // Fondo negro estilo dark mode
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

      // 4. Consumir la API
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

      // 5. Convertir el Base64 a Buffer
      const buffer = Buffer.from(data.result.image, 'base64')

      // 6. Crear carpeta temporal si no existe
      if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp')
      }

      const timestamp = Date.now()
      const tempInput = `./temp/qc_${timestamp}.png`
      const tempOutput = `./temp/qc_${timestamp}.webp`
      
      fs.writeFileSync(tempInput, buffer)

      // 7. Convertir PNG a WebP con ffmpeg (OBLIGATORIO para tu writeExif)
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" -c:v libwebp -lossless 1 -loop 0 -an -vsync 0 "${tempOutput}"`, (error) => {
          if (error) reject(error)
          else resolve()
        })
      })

      // 8. Obtener datos del usuario para la marca de agua
      let user = await db.getUser(msg.sender)
      const name = user.name
      let texto1 = user.metadatos || `S'ᴛᴇʟʟᴀʀ 🧠 WᴀBᴏᴛ`
      let texto2 = user.metadatos2 || `@${name}`

      // 9. Aplicar Exif y enviar
      const webpBuffer = fs.readFileSync(tempOutput)
      const media = { mimetype: 'image/webp', data: webpBuffer }
      const metadata = { packname: texto1, author: texto2, categories: [''] }
      
      const stickerPath = await writeExif(media, metadata)

      await sock.sendMessage(msg.chat, { 
        sticker: { url: stickerPath } 
      }, { quoted: msg })

      msg.react('✅')

      // 10. Limpieza de archivos temporales
      fs.unlinkSync(tempInput)
      fs.unlinkSync(tempOutput)
      fs.unlinkSync(stickerPath)

    } catch (e) {
      console.error('Error en qc/quote:', e)
      msg.react('❌')
      return sock.reply(msg.chat, '✿꙳.˖ Ocurrió un error al crear la cita.', msg)
      // O usa: typeof msgglobal !== 'undefined' ? msgglobal : '✿꙳.˖ Ocurrió un error...'
    }
  }
}