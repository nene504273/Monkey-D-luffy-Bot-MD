import db from "#db"
import fetch from 'node-fetch'

export default {
  command: ['vocalremover', 'separar', 'vr'],
  category: 'audio',
  description: 'Separa la voz y el instrumental de un enlace de YouTube o audio',
  
  run: async ({ msg, sock, text, usedPrefix: prefix, command }) => {
    try {
      // 1. Obtener la URL (del texto escrito o del mensaje citado)
      let inputUrl = text.trim()
      if (!inputUrl && msg.quoted) {
        inputUrl = msg.quoted.text || ''
      }

      // Validación básica de URL
      const isUrl = (str) => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/gi.test(str)

      if (!inputUrl || !isUrl(inputUrl)) {
        return sock.reply(msg.chat, `❀ Por favor, proporciona un enlace de YouTube o un enlace de audio directo.\n\n*Ejemplo:* ${usedPrefix + command} https://youtube.com/watch?v=...`, msg)
      }

      msg.react('⏳')

      // 2. Consumir la API
      const apiKey = 'LUFFY-FIX67'
      const apiUrl = `https://api.alyacore.xyz/tools/vocalremover?url=${encodeURIComponent(inputUrl)}&key=${apiKey}`
      
      const res = await fetch(apiUrl)
      const data = await res.json()

      // 3. Validar respuesta de la API
      if (!res.ok || !data.status) {
        msg.react('❌')
        return msg.reply(`❖ Error: ${data.message || 'No se pudo procesar el audio. Verifica que el enlace sea válido y público.'}`)
      }

      // 4. Enviar los resultados a WhatsApp
      // Usamos 'audio' con mimetype 'audio/mpeg' para que WhatsApp lo muestre como música/reproductor
      
      // Enviar Pista Vocal
      await sock.sendMessage(msg.chat, {
        audio: { url: data.vocal },
        mimetype: 'audio/mpeg',
        fileName: 'Voz_Separada.mp3',
        ptt: false // false = se muestra como canción, true = como nota de voz
      }, { quoted: msg })

      // Enviar Pista Instrumental
      await sock.sendMessage(msg.chat, {
        audio: { url: data.instrumental },
        mimetype: 'audio/mpeg',
        fileName: 'Instrumental_Separado.mp3',
        ptt: false
      }, { quoted: msg })

      msg.react('✅')
      return msg.reply('✅ ¡Audio separado con éxito! 🎤🎸\nAquí tienes la pista de voz y el instrumental.')

    } catch (e) {
      console.error('Error en vocalremover:', e)
      msg.react('❌')
      return msg.reply('✿꙳.˖ Ocurrió un problema inesperado al separar el audio. Intenta con otro enlace.')
    }
  }
}