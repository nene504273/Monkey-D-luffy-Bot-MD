import db from "#db"
import fs from 'fs'
import fetch from 'node-fetch'
import { exec } from 'child_process'
import exif from '../../lib/exif.js'
const { writeExif } = exif

export default {
  command: ['brat', 'sbrat'],
  category: 'stickers',
  description: 'Crea un sticker estilo Brat con el texto que envíes',
  
  run: async ({ msg, sock, text, usedPrefix: prefix, command }) => {
    try {
      // Validar texto
      const textoSticker = text.trim()
      if (!textoSticker) {
        return sock.reply(msg.chat, `❀ Ingresa un texto para generar tu sticker Brat.\n*Ejemplo:* ${prefix + command} Hola mundo`, msg)
      }

      // Obtener datos del usuario
      let user = await db.getUser(msg.sender)
      const name = user.name
      let texto1 = user.metadatos || `S'ᴛʟʟᴀʀ 🧠 WᴀBᴏᴛ`
      let texto2 = user.metadatos2 || `@${name}`

      let pack = texto1
      let author = texto2

      // Consumir API Brat
      const apiKey = 'LUFFY-FIX67'
      const apiUrl = `https://api.alyacore.xyz/tools/brat?text=${encodeURIComponent(textoSticker)}&key=${apiKey}`
      
      msg.react('⏳')
      
      const res = await fetch(apiUrl)
      if (!res.ok) {
        console.error(`Error API: ${res.status} ${res.statusText}`)
        msg.react('❌')
        return msg.reply('❖ Error al conectar con la API de Brat.')
      }

      // Convertir a buffer
      const buffer = Buffer.from(await res.arrayBuffer())
      
      // Verificar que el buffer tenga datos
      if (buffer.length === 0) {
        console.error('Buffer vacío recibido')
        msg.react('❌')
        return msg.reply('❖ La API devolvió datos vacíos.')
      }

      // Guardar temporalmente la imagen original
      const tempInput = `./temp/brat_${Date.now()}.png`
      fs.writeFileSync(tempInput, buffer)

      // Convertir a WebP usando ffmpeg
      const tempOutput = `./temp/brat_${Date.now()}.webp`
      
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" -c:v libwebp -lossless 1 -loop 0 -an -vsync 0 "${tempOutput}"`, (error) => {
          if (error) {
            console.error('Error en conversión:', error)
            reject(error)
          } else {
            resolve()
          }
        })
      })

      // Leer el WebP convertido
      const webpBuffer = fs.readFileSync(tempOutput)

      // Crear metadata y procesar con exif
      const media = { mimetype: 'image/webp', data: webpBuffer }
      const metadata = { packname: pack, author: author, categories: [''] }
      
      const stickerPath = await writeExif(media, metadata)

      // Enviar sticker
      await sock.sendMessage(msg.chat, { 
        sticker: { url: stickerPath } 
      }, { quoted: msg })
      
      msg.react('✅')
      
      // Limpiar archivos temporales
      fs.unlinkSync(tempInput)
      fs.unlinkSync(tempOutput)
      fs.unlinkSync(stickerPath)

    } catch (e) {
      console.error('Error completo:', e)
      msg.react('❌')
      return msg.reply(typeof msgglobal !== 'undefined' ? msgglobal : '❖ Ocurrió un error inesperado.')
    }
  }
}