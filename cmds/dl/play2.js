import fetch from 'node-fetch'
import { getBuffer } from '#serialize'

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async ({ msg, sock, args }) => {

    try {
      if (!args[0]) {
        return msg.reply('《✧》Por favor, menciona el nombre o URL del video que deseas descargar')
      }

      const text = args.join(' ')
      // Se deja por si el usuario pega un enlace directo, pero la API de búsqueda lo maneja igual
      const query = text

      // --- NUEVA BÚSQUEDA ---
      const searchUrl = `https://api.alyacore.xyz/search/yt?query=${encodeURIComponent(query)}&key=LUFFY-FIX67`
      const searchRes = await fetch(searchUrl).then(r => r.json())

      if (!searchRes?.status || !searchRes.result?.length) {
        return msg.reply('《✧》 No se encontró información del video.')
      }

      const videoInfo = searchRes.result[0] // primer resultado
      // --- FIN NUEVA BÚSQUEDA ---

      // Extraer datos con la estructura de la nueva API
      const url = videoInfo.url
      const title = videoInfo.title
      const canal = videoInfo.autor || 'Desconocido'
      const duration = videoInfo.duration || ''
      const vistasRaw = videoInfo.views || '0'
      // Convertir "6,026" a número y luego formatear con comas
      const vistasNum = parseInt(vistasRaw.replace(/,/g, ''), 10) || 0
      const vistas = vistasNum.toLocaleString()
      const thumbBuffer = await getBuffer(videoInfo.banner)

      const caption = `【　✿　】 _\`୨୧  Download\` ───── *${title}*_

> _✐ \`Canal\` ── ${canal}_
> _ⴵ \`Duración\` ── ${duration}_
> _✰ \`Vistas\` ── ${vistas}_
> _🜸 \`Enlace\` ── ${url}_

> _──  ִ    ۟  *¡Enviando video, por favor espera!*_`

      await sock.sendMessage(msg.chat, { image: thumbBuffer, caption }, { quoted: msg })

      // Descarga del video (se mantiene igual)
      const endpoint = `${api.url}/dl/ytmp4?url=${encodeURIComponent(url)}&quality=auto&key=${api.key}`
      const res = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json'
        }
      }).then(r => r.json())

      if (!res?.status || !res.result?.downloadUrl) {
        return msg.reply('《✧》 No se pudo descargar el *video*, intenta más tarde.')
      }

      const videoBuffer = await getBuffer(res.result.downloadUrl)

      const mensaje = {
        video: { url: res.result.downloadUrl },
        fileName: `${res.result?.title || 'video'}.mp4`,
        mimetype: 'video/mp4'
      }

      await sock.sendMessage(msg.chat, mensaje, { quoted: msg })
    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}