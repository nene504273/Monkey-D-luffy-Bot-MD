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
      const query = text

      // Búsqueda
      const searchUrl = `https://api.alyacore.xyz/search/yt?query=${encodeURIComponent(query)}&key=LUFFY-FIX67`
      const searchRes = await fetch(searchUrl).then(r => r.json())

      if (!searchRes?.status || !searchRes.result?.length) {
        return msg.reply('《✧》 No se encontró información del video.')
      }

      const videoInfo = searchRes.result[0]
      const url = videoInfo.url
      const title = videoInfo.title
      const canal = videoInfo.autor || 'Desconocido'
      const duration = videoInfo.duration || ''
      const vistasRaw = videoInfo.views || '0'
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

      // Descarga con la API en calidad 720
      const dlEndpoint = `https://api.alyacore.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&quality=720&key=LUFFY-FIX67`
      const res = await fetch(dlEndpoint).then(r => r.json())

      if (!res?.status || !res.data?.dl) {
        return msg.reply('《✧》 No se pudo descargar el *video*, intenta más tarde.')
      }

      // Envío como DOCUMENTO (archivo) y no como video reproducible
      const mensaje = {
        document: { url: res.data.dl },   // <--- Cambio clave
        fileName: `${title || 'video'}.mp4`,
        mimetype: 'video/mp4'
      }

      await sock.sendMessage(msg.chat, mensaje, { quoted: msg })

    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}