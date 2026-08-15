import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '#serialize'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) {
        return msg.reply('《✧》 Por favor, menciona el nombre o URL del video que deseas descargar.')
      }

      const text = args.join(' ')
      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text

      // Búsqueda del video
      const search = await yts(query)
      const videoInfo = videoMatch
        ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0]
        : search.all[0]

      if (!videoInfo) {
        return msg.reply('《✧》 No se encontró información del video.')
      }

      const { timestamp: duration } = videoInfo
      const url = videoInfo.url
      const title = videoInfo.title
      const vistas = (videoInfo.views || 0).toLocaleString()
      const canal = videoInfo.author?.name || 'Desconocido'
      const thumbBuffer = await getBuffer(videoInfo.image)

      const caption = `【　✿　】 _\`୨୧  Download\` ───── *${title}*_

> _✐ \`Canal\` ── ${canal}_
> _ⴵ \`Duración\` ── ${duration || ''}_
> _✰ \`Vistas\` ── ${vistas}_
> _🜸 \`Enlace\` ── ${url}_

> _──  ִ    ۟  *¡Enviando video, por favor espera!*_`

      await sock.sendMessage(msg.chat, { image: thumbBuffer, caption }, { quoted: msg })

      // 🔗 Llamada a la nueva API (youtubeplayv2)
      const apiUrl = `https://api.alyacore.xyz/dl/youtubeplayv2?query=${encodeURIComponent(url)}&type=mp4&quality=auto&key=LUFFY-FIX67`

      let res
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Accept': 'application/json'
          }
        })
        
        // Verificamos si el servidor devuelve un error HTTP (ej. 503, 404) antes de convertir a JSON
        if (!response.ok) {
           return msg.reply(`《✧》 La API falló con el código de estado: ${response.status}`)
        }
        
        res = await response.json()
      } catch (error) {
        return msg.reply(`《✧》 Error al conectar con la API: ${error.message}`)
      }

      // Validación más descriptiva basada en la nueva estructura
      if (!res?.status || !res.data?.dl) {
        const motivo = res?.message || res?.error || 'Motivo no especificado'
        return msg.reply(`《✧》 Falló la descarga.\n📌 Razón de la API: ${motivo}`)
      }

      // Envío del video (ya no es necesario descargar el Buffer previamente si WhatsApp procesa la URL directa)
      const mensaje = {
        video: { url: res.data.dl },
        fileName: `${res.data?.title || title || 'video'}.mp4`,
        mimetype: 'video/mp4'
      }

      await sock.sendMessage(msg.chat, mensaje, { quoted: msg })

    } catch (e) {
      // Error global controlado
      await msg.reply('《✧》 Ocurrió un error inesperado. Inténtalo de nuevo más tarde.').catch(() => {})
      console.error(e) // Para depurar en consola
    }
  }
}
