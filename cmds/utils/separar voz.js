import db from "#db"
import fs from 'fs'
import fetch from 'node-fetch'

export default {
  command: ['vocalremover', 'separar', 'vr'],
  category: 'audio',
  description: 'Separa la voz y el instrumental de un enlace de YouTube o audio',
  
  run: async ({ msg, sock, text, usedPrefix: prefix, command }) => {
    try {
      // 1. Obtener la URL
      let inputUrl = text.trim()
      if (!inputUrl && msg.quoted) {
        inputUrl = msg.quoted.text || ''
      }

      const isUrl = (str) => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gi.test(str)

      if (!inputUrl || !isUrl(inputUrl)) {
        return sock.reply(msg.chat, `❀ Proporciona un enlace de YouTube o audio.\n*Ejemplo:* ${prefix + command} https://youtube.com/watch?v=...`, msg)
      }

      msg.react('⏳')
      await msg.reply('🔄 Procesando audio... Esto puede tardar unos segundos.')

      // 2. Consumir la API
      const apiKey = 'LUFFY-FIX67'
      const apiUrl = `https://api.alyacore.xyz/tools/vocalremover?url=${encodeURIComponent(inputUrl)}&key=${apiKey}`
      
      const res = await fetch(apiUrl)
      const data = await res.json()

      if (!res.ok || !data.status) {
        msg.react('❌')
        return msg.reply(`❖ Error: ${data.message || 'No se pudo procesar el audio.'}`)
      }

      // 3. Crear carpeta temporal si no existe
      if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp')
      }

      // 4. Descargar los archivos ANTES de que expiren
      const vocalUrl = data.vocal
      const instrumentalUrl = data.instrumental
      
      const vocalFile = `./temp/vocal_${Date.now()}.mp3`
      const instrumentalFile = `./temp/instrumental_${Date.now()}.mp3`

      // Descargar vocal
      const vocalRes = await fetch(vocalUrl)
      const vocalBuffer = Buffer.from(await vocalRes.arrayBuffer())
      fs.writeFileSync(vocalFile, vocalBuffer)

      // Descargar instrumental
      const instRes = await fetch(instrumentalUrl)
      const instBuffer = Buffer.from(await instRes.arrayBuffer())
      fs.writeFileSync(instrumentalFile, instBuffer)

      // 5. Enviar como archivos locales (no URLs)
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

      msg.react('✅')
      
      // 6. Limpiar archivos temporales
      fs.unlinkSync(vocalFile)
      fs.unlinkSync(instrumentalFile)

    } catch (e) {
      console.error('Error en vocalremover:', e)
      msg.react('❌')
      return msg.reply('✿꙳. Ocurrió un error al separar el audio. Intenta con otro enlace.')
    }
  }
}