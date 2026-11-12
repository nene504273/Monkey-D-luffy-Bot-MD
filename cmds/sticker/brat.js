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
      // 0. IMPORTANTE: Crear carpeta temp si no existe para evitar errores
      if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp')
      }

      // 1. Validar texto
      const textoSticker = text.trim()
      if (!textoSticker) {
        return sock.reply(msg.chat, `❀ Ingresa un texto para generar tu sticker Brat.\n*Ejemplo:* ${prefix + command} Hola mundo`, msg)
      }

      // 2. Obtener datos del usuario
      let user = await db.getUser(msg.sender)
      const name = user.name
      let texto1 = user.metadatos || `S'ᴛʟᴀʀ 🧠 WBᴏᴛ`
      let texto2 = user.metadatos2 || `@${name}`

      let pack = texto1
      let author = texto2

      // 3. Consumir API Brat
      const apiKey = 'LUFFY-FIX67'
      const apiUrl = `https://api.alyacore.xyz/tools/brat?text=${encodeURIComponent(textoSticker)}&key=${apiKey}`
      
      msg.react('⏳')
      
      const res = await fetch(apiUrl)
      if (!res.ok) {
        msg.react('❌')
        return msg.reply('❖ Error al conectar con la API de Brat.')
      }

      // 4. Convertir a buffer
      const buffer = Buffer.from(await res.arrayBuffer())
      
      // Guardar imagen temporal (ahora en la carpeta que acabamos de asegurar)
      const tempInput = `./temp/brat_${Date.now()}.png`
      const tempOutput = `./temp/brat_${Date.now()}.webp`
      
      fs.writeFileSync(tempInput, buffer)

      // 5. Convertir a WebP con ffmpeg
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white" -c:v libwebp -lossless 1 -loop 0 -an -vsync 0 "${tempOutput}"`, (error) => {
          if (error) reject(error)
          else resolve()
        })
      })

      // 6. Leer WebP y aplicar metadata
      const webpBuffer = fs.readFileSync(tempOutput)
      const media = { mimetype: 'image/webp', data: webpBuffer }
      const metadata = { packname: pack, author: author, categories: [''] }
      
      const stickerPath = await writeExif(media, metadata)

      // 7. Enviar sticker
      await sock.sendMessage(msg.chat, { 
        sticker: { url: stickerPath } 
      }, { quoted: msg })
      
      msg.react('✅')
      
      // 8. Limpieza final
      fs.unlinkSync(tempInput)
      fs.unlinkSync(tempOutput)
      fs.unlinkSync(stickerPath)

    } catch (e) {
      console.error('Error completo:', e)
      msg.react('❌')
      // Fallback por si msgglobal no está definido
      const errorMsg = typeof msgglobal !== 'undefined' ? msgglobal : '✿꙳.˖ Ocurrió un problema al crear el sticker.'
      return msg.reply(errorMsg)
    }
  }
}