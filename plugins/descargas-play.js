import fetch from 'node-fetch'
import yts from 'yt-search'

const handler = async (m, { text, conn, args, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Por favor, proporciona un nombre o enlace de YouTube.`, m)
  }
  const apikey = "LUFFY-GEAR4"
  const input = args.join(' ')
  let ytplay2 = null

  try {
    await m.react(rwait)

    const isUrl = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(input)

    if (isUrl) {
      try {
        const result = await yts(input)
        ytplay2 = result.all?.[0] || result.videos?.[0] || null
      } catch (_) {}

      if (!ytplay2 || !ytplay2.url) {
        ytplay2 = {
          url: input,
          title: 'Desconocido',
          thumbnail: '',
          timestamp: 'N/A',
          views: null,
          ago: 'N/A',
          author: { url: 'Desconocido' }
        }
      }
    } else {
      const search = await yts(input)
      ytplay2 = search.all?.[0] || search.videos?.[0] || null
      if (!ytplay2 || !ytplay2.url) {
        return conn.reply(m.chat, `${emoji2} No se encontraron resultados.`, m)
      }
    }

  } catch (e) {
    return conn.reply(m.chat, `${msm} Error al buscar el video.`, m)
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

  // ✅ Enviamos el mensaje informativo sin externalAdReply
  await conn.reply(m.chat, infoMessage, m)

  if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
    try {
      let api = await (await fetch(
        `https://api.alyacore.xyz/dl/ytmp3?url=${encodeURIComponent(url)}&key=${apikey}`
      )).json()

      if (!api.status) throw new Error('Alyacore falló')

      var fileName = api.data?.title || 'audio'
      var dl = api.data?.dl

      if (!dl) throw new Error('No se generó enlace (Alyacore)')

    } catch (e) {
      await m.react(error)
      return conn.reply(m.chat, `${msm} Error al descargar el audio.`, m)
    }

    await conn.sendMessage(m.chat, {
      audio: { url: dl },
      fileName: fileName + '.mp3',
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

    await m.react(done)

  } 

  else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
    try {
      await conn.reply(m.chat, `❍ Descargando video en 480p...`, m)

      const api = await (await fetch(
        `https://api.alyacore.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&quality=480&key=${apikey}`
      )).json()

      if (!api.status) throw new Error(api.message || 'La API no devolvió status=true')

      const { title: fileName, dl, quality } = api.data || {}
      if (!dl) throw new Error('No se generó el enlace.')

      await conn.sendMessage(m.chat, {
        document: { url: dl },
        fileName: (fileName || `video_${quality || '480'}p`) + '.mp4',
        mimetype: 'video/mp4',
        caption: `${dev}`
      }, { quoted: m })

      await m.react(done)

    } catch (e) {
      await m.react(error)
      return conn.reply(m.chat, `${msm} Error al descargar el video.`, m)
    }
  }

  else {
    return conn.reply(m.chat, `${emoji2} Comando no reconocido.`, m)
  }
}

handler.help = ['play', 'ytmp3', 'ytmp4', 'ytv']
handler.tags = ['descargas']
handler.command = ['play', 'yta', 'ytmp3', 'playaudio', 'play2', 'ytv', 'ytmp4', 'mp4']
handler.group = true
handler.register = true
handler.coin = 2

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}