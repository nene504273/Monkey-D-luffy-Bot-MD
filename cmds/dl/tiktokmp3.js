import fetch from 'node-fetch'
import { getBuffer } from '#serialize'

export default {
  command: ['ttaudio', 'tiktokaudio', 'ttmp3', 'tiktokmp3', 'playtt'],
  category: 'downloader',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) {
        return msg.reply('《✧》 Por favor, ingresa el enlace de un video de TikTok para extraer su audio.')
      }

      const text = args.join(' ')
      const tiktokRegex = /(https?:\/\/)?(www\.|vt\.|vm\.)?tiktok\.com\/[^\s]+/i
      const match = text.match(tiktokRegex)

      if (!match) {
        return msg.reply('《✧》 Por favor, ingresa un enlace válido de TikTok.')
      }

      const tiktokUrl = match[0]

      // 🔗 Llamada a la API de TikTok Audio
      const apiUrl = `https://api.alyacore.xyz/dl/tiktokmp3?url=${encodeURIComponent(tiktokUrl)}&key=LUFFY-FIX67`

      let res
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          return msg.reply(`《✧》 La API falló con el código de estado: ${response.status}`)
        }

        res = await response.json()
      } catch (parseError) {
        return msg.reply('《✧》 La API no respondió con un JSON válido o ocurrió un error en la conexión.')
      }

      // Validación de respuesta
      if (!res?.status || !res.data?.dl) {
        const motivo = res?.message || res?.error || 'No se pudo obtener el enlace de descarga'
        return msg.reply(`《✧》 Falló la descarga.\n📌 Razón de la API: ${motivo}`)
      }

      const { data } = res
      const title = data.title || 'Audio de TikTok'
      const author = data.author?.nickname || data.author?.unique_id || 'Desconocido'
      const duration = data.music_info?.duration || data.duration || 'Desconocida'
      const plays = (data.stats?.plays || 0).toLocaleString()
      const thumb = data.thumbnail || data.author?.avatar

      // Banner con miniatura
      const caption = `【　✿　】 _\`୨୧  TikTok Audio\` ───── *${author}*_

> _✐ \`Autor\` ── ${author}_
> _ⴵ \`Duración\` ── ${duration}_
> _✰ \`Vistas\` ── ${plays}_
> _🜸 \`Título\` ── ${title.slice(0, 60)}..._

> _──  ִ    ۟  *¡Enviando audio, por favor espera!*_`

      if (thumb) {
        try {
          const thumbBuffer = await getBuffer(thumb)
          await sock.sendMessage(msg.chat, { image: thumbBuffer, caption }, { quoted: msg })
        } catch {
          await msg.reply(caption)
        }
      } else {
        await msg.reply(caption)
      }

      // Envío del audio en formato MP3 / PTT
      const audioMessage = {
        audio: { url: data.dl },
        mimetype: 'audio/mp4',
        fileName: `${title.slice(0, 30)}.mp3`
      }

      await sock.sendMessage(msg.chat, audioMessage, { quoted: msg })

    } catch (e) {
      await msg.reply('《✧》 Ocurrió un error inesperado al procesar el audio de TikTok.').catch(() => {})
      console.error(e)
    }
  }
}
