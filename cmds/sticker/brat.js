import db from "#db"
import fs from 'fs'
import fetch from 'node-fetch'
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
      let texto1 = user.metadatos || `S'ᴛᴇʟʟᴀʀ 🧠 WᴀBᴏᴛ`
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

      // Verificar contenido tipo
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('image')) {
        console.error('La API no devolvió una imagen:', contentType)
        msg.react('')
        return msg.reply('❖ La API no devolvió una imagen válida.')
      }

      // Convertir a buffer
      const buffer = Buffer.from(await res.arrayBuffer())
      
      // Verificar que el buffer tenga datos
      if (buffer.length === 0) {
        console.error('Buffer vacío recibido')
        msg.react('❌')
        return msg.reply(' La API devolvió datos vacíos.')
      }

      // Crear metadata y procesar con exif
      const media = { mimetype: 'image/webp', data: buffer }
      const metadata = { packname: pack, author: author, categories: [''] }
      
      const stickerPath = await writeExif(media, metadata)

      // Enviar sticker
      await sock.sendMessage(msg.chat, { 
        sticker: { url: stickerPath } 
      }, { quoted: msg })
      
      msg.react('✅')
      fs.unlinkSync(stickerPath)

    } catch (e) {
      console.error('Error completo:', e)
      msg.react('❌')
      return msg.reply(typeof msgglobal !== 'undefined' ? msgglobal : '❖ Ocurrió un error inesperado.')
    }
  }
}