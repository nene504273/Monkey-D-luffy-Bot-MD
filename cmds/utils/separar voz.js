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
      
      const res = await fetch(apiUrl, { timeout: 120000 })
      const data = await res.json()

      if (!res.ok || !data.status) {
        msg.react('❌')
        return msg.reply(`❖ Error: ${data.message || 'No se pudo procesar el audio.'}`)
      }

      if (!data.vocal || !data.instrumental) {
        msg.react('❌')
        return msg.reply('❖ La API no devolvió las pistas de audio.')
      }

      // 3. Intentar descargar con headers de navegador
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/mpeg,audio/*,*/*;q=0.8',
        'Referer': 'https://aivocalremover.com/'
      }

      if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp')
      }

      const timestamp = Date.now()
      const vocalFile = `./temp/vocal_${timestamp}.mp3`
      const instrumentalFile = `./temp/instrumental_${timestamp}.mp3`

      let vocalSuccess = false
      let instrumentalSuccess = false

      // Descargar VOCAL con headers
      try {
        const vocalRes = await fetch(data.vocal, { headers, timeout: 30000 })
        const vocalBuffer = Buffer.from(await vocalRes.arrayBuffer())
        
        if (vocalBuffer.length > 1000) {
          fs.writeFileSync(vocalFile, vocalBuffer)
          vocalSuccess = true
          console.log(`✅ Vocal descargada: ${vocalBuffer.length} bytes`)
        }
      } catch (e) {
        console.log('⚠️ No se pudo descargar vocal automáticamente')
      }

      // Descargar INSTRUMENTAL con headers
      try {
        const instRes = await fetch(data.instrumental, { headers, timeout: 30000 })
        const instBuffer = Buffer.from(await instRes.arrayBuffer())
        
        if (instBuffer.length > 1000) {
          fs.writeFileSync(instrumentalFile, instBuffer)
          instrumentalSuccess = true
          console.log(`✅ Instrumental descargado: ${instBuffer.length} bytes`)
        }
      } catch (e) {
        console.log('⚠️ No se pudo descargar instrumental automáticamente')
      }

      // 4. Enviar resultados
      if (vocalSuccess && instrumentalSuccess) {
        // Ambos descargados correctamente
        await msg.reply('✅ ¡Audio separado! Enviando pistas...')
        
        await sock.sendMessage(msg.chat, {
          audio: fs.readFileSync(vocalFile),
          mimetype: 'audio/mpeg',
          fileName: '🎤 Voz_Separada.mp3',
          ptt: false
        }, { quoted: msg })

        await sock.sendMessage(msg.chat, {
          audio: fs.readFileSync(instrumentalFile),
          mimetype: 'audio/mpeg',
          fileName: '🎸 Instrumental.mp3',
          ptt: false
        }, { quoted: msg })

        fs.unlinkSync(vocalFile)
        fs.unlinkSync(instrumentalFile)
        msg.react('✅')
        
      } else {
        // Falló la descarga automática, enviar enlaces
        msg.react('⚠️')
        await msg.reply(
          `⚠️ No pude descargar los archivos automáticamente, pero aquí están los enlaces de descarga directa:\n\n` +
          `🎤 *Pista de Voz:*\n${data.vocal}\n\n` +
          `🎸 *Instrumental:*\n${data.instrumental}\n\n` +
          `⏰ *Nota:* Estos enlaces expiran rápido, descárgalos ahora.`
        )
      }

    } catch (e) {
      console.error('Error en vocalremover:', e)
      msg.react('❌')
      return msg.reply('✿.˖ Error al procesar. Verifica que el video sea público e inténtalo de nuevo.')
    }
  }
}