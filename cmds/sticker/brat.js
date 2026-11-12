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
      // 1. Validar que el usuario haya escrito un texto
      const textoSticker = text.trim()
      if (!textoSticker) {
        return sock.reply(msg.chat, `❀ Ingresa un texto para generar tu sticker Brat.\n*Ejemplo:* ${prefix + command} Hola mundo`, msg)
      }

      // 2. Lógica de usuario y marca de agua (Replicando tu lógica)
      let user = await db.getUser(msg.sender)
      const name = user.name
      let texto1 = user.metadatos || `S'ᴛᴇʟʟᴀʀ 🧠 WᴀBᴏᴛ`
      let texto2 = user.metadatos2 || `@${name}`

      // Usamos los datos de la DB como pack y author por defecto
      let pack = texto1
      let author = texto2

      // 3. Consumo de la API Brat
      const apiKey = 'LUFFY-FIX67'
      const apiUrl = `https://api.alyacore.xyz/tools/brat?text=${encodeURIComponent(textoSticker)}&key=${apiKey}`
      
      msg.react('⏳') // Reacción mientras carga (si tu lib lo soporta)
      
      const res = await fetch(apiUrl)
      if (!res.ok) {
        msg.react('❌')
        return msg.reply('❖ La API de Brat no respondió correctamente. Inténtalo más tarde.')
      }

      // Convertimos la respuesta en Buffer (Misma lógica que usas para URLs)
      const buffer = Buffer.from(await res.arrayBuffer())

      // 4. Inyectar Metadata (Exif) para que tenga tu marca de agua
      // Asumimos mimetype webp para que writeExif lo procese correctamente
      const media = { mimetype: 'image/webp', data: buffer }
      const metadata = { packname: pack, author: author, categories: [''] }
      
      const stickerPath = await writeExif(media, metadata)

      // 5. Enviar sticker y limpiar archivo temporal
      await sock.sendMessage(msg.chat, { 
        sticker: { url: stickerPath } 
      }, { quoted: msg })
      
      msg.react('✅')
      fs.unlinkSync(stickerPath)

    } catch (e) {
      console.error(e)
      msg.react('❌')
      return msg.reply(typeof msgglobal !== 'undefined' ? msgglobal : '❖ Ocurrió un error al generar el sticker.')
    }
  }
}