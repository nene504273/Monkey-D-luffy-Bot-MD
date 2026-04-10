import fetch from "node-fetch"
import yts from 'yt-search'


const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

export default {
  command: ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4'],
  category: 'descargas',
  run: async (client, m, args, command) => {
    try {
      const text = args.join(' ')
      
      if (!text.trim()) return m.reply(`❍ Por favor, proporciona un nombre o enlace de YouTube`)

      let searchQuery = text
      let ytplay2 = null

      const isUrl = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(text)

      if (isUrl) {
        try {
          const result = await yts(text)
          ytplay2 = result.all?.[0] || result.videos?.[0] || null
        } catch (_) {}

        if (!ytplay2 || !ytplay2.url) {
          ytplay2 = {
            url: text,
            title: 'Desconocido',
            thumbnail: '',
            timestamp: 'N/A',
            views: null,
            ago: 'N/A',
            author: { url: 'Desconocido' }
          }
        }
      } else {
        ytplay2 = await yts(searchQuery)
        ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2

        if (!ytplay2 || !ytplay2.url) return m.reply(`❍ No se encontraron resultados`)
      }

      let { title, thumbnail, timestamp, views, ago, url, author } = ytplay2
      const vistas = formatViews(views)
      const canalLink = author?.url || 'Desconocido'

      const infoMessage = `¡! ׂׂૢ *Download Youtube*
✩̣̣̣̣̣ͯ┄•͙✧⃝•͙┄✩ͯ•͙͙✧⃝•͙͙✩ͯ

❍ *Título* › *${title || 'Desconocido'}*
❍ *Vistas* › *${vistas}*
❍ *Duración* › *${timestamp}*
❍ *Publicado* › *${ago}*
❍ *Canal* › *${canalLink}*
❍ *Enlace* › *${url}*

──⇌••⇋──

${dev}`

      const thumb = thumbnail ? (await client.getFile(thumbnail))?.data : null
      const JT = {
        contextInfo: {
          externalAdReply: {
            title: botname,
            body: dev,
            mediaType: 1,
            previewType: 0,
            mediaUrl: url,
            sourceUrl: url,
            thumbnail: thumb,
            renderLargerThumbnail: true,
          },
        },
      }

      await client.reply(m.chat, infoMessage, m, JT)

      if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
        try {
          const api = await (await fetch(
            `https://api.alyacore.xyz/dl/ytmp3?url=${encodeURIComponent(url)}&key=${LUFFY-GEAR4}`
          )).json()

          if (!api.status) throw new Error(api.message || 'La API no devolvió status=true')

          const { title: fileName, dl } = api.data || {}

          if (!dl) throw new Error('No se generó el enlace.')

          await client.sendMessage(m.chat, {
            audio: { url: dl },
            fileName: (fileName || 'audio') + '.mp3',
            mimetype: 'audio/mpeg',
            ptt: false
          }, { quoted: m })

        } catch (e) {
          return m.reply(`❍ Error al descargar el audio`)
        }
      }

      else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
        const mensajeDescarga = `❍ Descargando video en 480p...`
        await client.reply(m.chat, mensajeDescarga, m)

        try {
          const api = await (await fetch(
            `https://api.alyacore.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&quality=480&key=${apikey}`
          )).json()

          if (!api.status) {
            throw new Error(api.message || 'La API no devolvió status=true')
          }

          const { title: fileName, dl, quality } = api.data || {}

          if (!dl) throw new Error('No se generó el enlace.')

          await client.sendMessage(m.chat, {
            document: { url: dl },
            fileName: (fileName || `video_${quality || '480'}p`) + '.mp4',
            mimetype: 'video/mp4',
            caption: `${dev}`
          }, { quoted: m })

        } catch (e) {
          console.error('Error en descarga de video:', e)
          return m.reply(`❍ Error al descargar el video`)
        }
      } else {
        return m.reply(`❍ Comando no reconocido`)
      }

    } catch (error) {
      return m.reply(`❍ Error: ${error.message}`)
    }
  },
};

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}