import fetch from 'node-fetch'
import yts from 'yt-search'

const handler = async (m, { text, conn, args, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Por favor, proporciona un nombre o enlace de YouTube.`, m)
  }
  const apikey = "LUFFY-GEAR6"
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
          author: { url: 'Desconocido', name: 'Desconocido' }
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
  const canal = author?.name || author?.url || 'Desconocido'

  const infoMessage = `¡! ׂׂૢ *Download Youtube*
✩̣̣̣̣̣̣ͯ┄•͙✧⃝•͙┄✩ͯ•͙͙✧⃝•͙͙✩ͯ

❍ *Título* › *${title || 'Desconocido'}*
❍ *Vistas* › *${vistas}*
❍ *Duración* › *${timestamp}*
❍ *Publicado* › *${ago}*
❍ *Canal* › *${canal}*
❍ *Enlace* › *${url}*

──⇌••⇋──

${dev}`

  if (thumbnail) {
    try {
      const imgRes = await fetch(thumbnail)
      const buffer = await imgRes.buffer()
      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: infoMessage
      }, { quoted: m })
    } catch {
      await conn.reply(m.chat, infoMessage, m)
    }
  } else {
    await conn.reply(m.chat, infoMessage, m)
  }

  // ── Descarga de audio (NUEVA API + buffer) ──
  if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
    try {
      // Llamada a la API (youtubeplay sin v2)
      const apiUrl = `https://api.alyacore.xyz/dl/youtubeplay?query=${encodeURIComponent(url)}&key=${apikey}`
      const api = await (await fetch(apiUrl)).json()

      if (!api.status) throw new Error('La API no devolvió status=true')

      const dl = api.result?.dl
      if (!dl) throw new Error('No se generó enlace de descarga (audio)')

      // ✅ Descargar el audio como buffer
      const audioRes = await fetch(dl)
      const audioBuffer = await audioRes.buffer()

      // ✅ Enviar el audio como buffer (ya no se usa URL externa)
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: api.result?.fileName || 'audio.mp3', // opcional, algunos clientes lo muestran
        ptt: false
      }, { quoted: m })

      await m.react(done)

    } catch (e) {
      await m.react(error)
      return conn.reply(m.chat, `${msm} Error al descargar el audio.`, m)
    }
  } 

  // ── Descarga de video (se mantiene con la API v2) ──
  else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
    try {
      await conn.reply(m.chat, `❍ Descargando video en calidad automática...`, m)

      // API v2 sigue para video
      const apiUrl = `https://api.alyacore.xyz/dl/youtubeplayv2?query=${encodeURIComponent(url)}&type=mp4&quality=auto&key=${apikey}`
      const api = await (await fetch(apiUrl)).json()

      if (!api.status) throw new Error(api.message || 'La API no devolvió status=true')

      const { title: fileName, dl, quality } = api.data || {}
      if (!dl) throw new Error('No se generó el enlace de descarga (video).')

      // Para video también recomiendo descargar el buffer si WhatsApp bloquea URLs externas,
      // pero por ahora lo dejo así. Si falla, aplica la misma técnica.
      await conn.sendMessage(m.chat, {
        document: { url: dl },
        fileName: (fileName || `video_${quality || 'auto'}p`) + '.mp4',
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