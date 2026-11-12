import db from "#db"
import fs from 'fs'
import fetch from 'node-fetch'

export default {
  command: ['vocalremover', 'separar', 'vr'],
  category: 'audio',
  description: 'Separa la voz y el instrumental de un enlace de YouTube',
  
  run: async ({ msg, sock, text, usedPrefix: prefix, command }) => {
    try {
      // 1. Obtener URL
      let inputUrl = text.trim()
      if (!inputUrl && msg.quoted) {
        inputUrl = msg.quoted.text || ''
      }

      const isUrl = (str) => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gi.test(str)

      if (!inputUrl || !isUrl(inputUrl)) {
        return sock.reply(msg.chat, `❀ Proporciona un enlace de YouTube.\n*Ejemplo:* ${prefix + command} https://youtube.com/watch?v=...`, msg)
      }

      msg.react('⏳')
      await msg.reply('🔄 Procesando audio... Esto puede tardar 30-60 segundos.')

      // 2. Consumir API
      const apiKey = 'LUFFY-FIX67'
      const apiUrl = `https://api.alyacore.xyz/tools/vocalremover?url=${encodeURIComponent(inputUrl)}&key=${apiKey}`
      
      const res = await fetch(apiUrl, { timeout: 120000 }) // Timeout de 2 minutos
      const data = await res.json()

      if (!res.ok || !data.status) {
        msg.react('❌')
        return msg.reply(` Error: ${data.message || 'No se pudo procesar el audio.'}`)
      }

      if (!data.vocal || !data.instrumental) {
        msg.react('❌')
        return msg.reply('❖ La API no devolvió las pistas de audio.')
      }

      // 3. Crear carpeta temp
      if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp')
      }

      const timestamp = Date.now()
      const vocalFile = `./temp/vocal_${timestamp}.mp3`
      const instrumentalFile = `./temp/instrumental_${timestamp}.mp3`

      // 4. Descargar con verificación de contenido
      await msg.reply('⬇️ Descargando pistas separadas...')
      
      // Descargar VOCAL
      const vocalRes = await fetch(data.vocal)
      const vocalBuffer = Buffer.from(await vocalRes.arrayBuffer())
      
      if (vocalBuffer.length === 0 || vocalBuffer.length < 1000) {
        msg.react('❌')
        return msg.reply('❌ Error: La pista de voz está vacía o corrupta. Intenta con otro video.')
      }
      
      fs.writeFileSync(vocalFile, vocalBuffer)
      console.log(`✅ Vocal descargada: ${vocalBuffer.length} bytes`)

      // Descargar INSTRUMENTAL
      const instRes = await fetch(data.instrumental)
      const instBuffer = Buffer.from(await instRes.arrayBuffer())
      
      if (instBuffer.length === 0 || instBuffer.length < 1000) {
        msg.react('❌')
        fs.unlinkSync(vocalFile) // Limpiar vocal ya descargada
        return msg.reply('❌ Error: El instrumental está vacío o corrupto. Intenta con otro video.')
      }
      
      fs.writeFileSync(instrumentalFile, instBuffer)
      console.log(`✅ Instrumental descargado: ${instBuffer.length} bytes`)

      // 5. Enviar con verificación
      await msg.reply(' Enviando pistas de audio...')
      
      // Enviar VOCAL
      await sock.sendMessage(msg.chat, {
        audio: fs.readFileSync(vocalFile),
        mimetype: 'audio/mpeg',
        fileName: '🎤 Voz_Separada.mp3',
        ptt: false
      }, { quoted: msg })

      // Enviar INSTRUMENTAL  
      await sock.sendMessage(msg.chat, {
        audio: fs.readFileSync(instrumentalFile),
        mimetype: 'audio/mpeg',
        fileName: '🎸 Instrumental.mp3',
        ptt: false
      }, { quoted: msg })

      msg.react('✅')
      
      // 6. Limpiar
      fs.unlinkSync(vocalFile)
      fs.unlinkSync(instrumentalFile)

    } catch (e) {
      console.error('Error en vocalremover:', e)
      msg.react('❌')
      return msg.reply('✿.˖ Error al procesar. Verifica que el video sea público e inténtalo de nuevo.')
    }
  }
}