// Requisitos: instalar dependencias: yt-search, ytdl-core, node-fetch
// npm i yt-search ytdl-core node-fetch
import fetch from 'node-fetch'
import yts from 'yt-search'
import ytdl from 'ytdl-core'

let handler = async (m, { conn }) => {
  try {
    const full = (m.text || m.message?.conversation || '') + ''
    const parts = full.trim().split(/\s+/)
    const invoked = parts[0].replace(/^#|!|\./, '').toLowerCase()
    const arg = parts.slice(1).join(' ').trim()

    // Helper para reaccionar con emoji (si el cliente lo soporta)
    const react = async (emoji = '⏳') => {
      try {
        await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })
      } catch (e) { /* ignore */ }
    }

    // ------ COMANDO principal: #play <texto> ------
    if (invoked === 'play') {
      if (!arg) {
        return await conn.sendMessage(m.chat, { text: '❗️ Uso: #play <texto>\nEjemplo: #play Despacito' }, { quoted: m })
      }

      // indicar búsqueda (reacción reloj)
      await react('⏳')

      // buscar en YouTube (yt-search)
      const search = await yts(arg)
      const video = (search?.videos && search.videos.length > 0) ? search.videos[0] : null
      if (!video) {
        return await conn.sendMessage(m.chat, { text: '❌ No se encontraron resultados en YouTube para ese texto.' }, { quoted: m })
      }

      // obtener datos
      const title = video.title || 'Desconocido'
      const author = (video.author && (video.author.name || video.author.url)) || video.author || 'Desconocido'
      const url = video.url || `https://www.youtube.com/watch?v=${video.videoId || ''}`
      const durationSeconds = Number(video.seconds || 0) // yt-search suele proveer seconds
      const durationText = video.timestamp || formatSeconds(durationSeconds)

      // obtener thumb
      let thumbBuffer = null
      try {
        const res = await fetch(video.thumbnail)
        thumbBuffer = await res.buffer()
      } catch (e) {
        thumbBuffer = null
      }

      // construir texto y botones
      const txt = `Título: ${title}\nAutor: ${author}\nDuración: ${durationText}\nEnlace: ${url}\n\n> Selecciona una opción para enviar:`
      const buttons = [
        { buttonId: `play_audio ${url}`, buttonText: { displayText: 'Audio' }, type: 1 },
        { buttonId: `play_video ${url}`, buttonText: { displayText: 'Video' }, type: 1 }
      ]

      // enviar mensaje con thumbnail, texto y botones
      await conn.sendMessage(m.chat, {
        image: thumbBuffer,
        caption: txt,
        footer: 'Selecciona Audio o Video',
        buttons,
        headerType: 4
      }, { quoted: m })

      return
    }

    // ------ BOTONES / callbacks: play_audio <url> ------
    if (invoked === 'play_audio' || invoked === 'audio') {
      const url = arg
      if (!url) return await conn.sendMessage(m.chat, { text: '❗️ No se recibió la URL del video.' }, { quoted: m })

      await react('⏳')

      // validar url y duración con ytdl-core
      if (!ytdl.validateURL(url)) {
        return await conn.sendMessage(m.chat, { text: '❌ URL de YouTube inválida.' }, { quoted: m })
      }

      let info = null
      try {
        info = await ytdl.getInfo(url)
      } catch (e) {
        return await conn.sendMessage(m.chat, { text: '❌ No se pudo obtener información del video.' }, { quoted: m })
      }

      const lengthSec = Number(info.videoDetails.lengthSeconds || 0)
      if (lengthSec > 8 * 60) {
        return await conn.sendMessage(m.chat, { text: '⚠️ El video supera los 8 minutos. No puedo enviar audio de videos tan largos.' }, { quoted: m })
      }

      // descargar audio desde la API proporcionada
      const apiUrl = `https://ruby-core.vercel.app/api/download/youtube/mp3?url=${encodeURIComponent(url)}`
      try {
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error(`API error ${res.status}`)
        const ct = res.headers.get('content-type') || ''
        const buffer = await res.buffer()

        if (!ct.startsWith('audio') && !ct.startsWith('application')) {
          // la API pudo devolver JSON con error
          const txt = buffer.toString('utf8').slice(0, 800)
          throw new Error(`Respuesta inesperada: ${txt}`)
        }

        await conn.sendMessage(m.chat, {
          audio: buffer,
          mimetype: 'audio/mpeg',
          fileName: `${sanitizeFileName(info.videoDetails.title || 'audio')}.mp3`,
          contextInfo: { externalAdReply: { title: info.videoDetails.title } }
        }, { quoted: m })

      } catch (err) {
        console.error(err)
        await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al obtener el audio. Intenta de nuevo más tarde.' }, { quoted: m })
      }
      return
    }

    // ------ BOTONES / callbacks: play_video <url> ------
    if (invoked === 'play_video' || invoked === 'video') {
      const url = arg
      if (!url) return await conn.sendMessage(m.chat, { text: '❗️ No se recibió la URL del video.' }, { quoted: m })

      await react('⏳')

      if (!ytdl.validateURL(url)) {
        return await conn.sendMessage(m.chat, { text: '❌ URL de YouTube inválida.' }, { quoted: m })
      }

      let info = null
      try {
        info = await ytdl.getInfo(url)
      } catch (e) {
        return await conn.sendMessage(m.chat, { text: '❌ No se pudo obtener información del video.' }, { quoted: m })
      }

      const lengthSec = Number(info.videoDetails.lengthSeconds || 0)
      if (lengthSec > 8 * 60) {
        return await conn.sendMessage(m.chat, { text: '⚠️ El video supera los 8 minutos. No puedo enviar videos tan largos.' }, { quoted: m })
      }

      // descargar video desde la API proporcionada
      const apiUrl = `https://ruby-core.vercel.app/api/download/youtube/mp4?url=${encodeURIComponent(url)}`
      try {
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error(`API error ${res.status}`)
        const ct = res.headers.get('content-type') || ''
        const buffer = await res.buffer()

        if (!ct.startsWith('video') && !ct.startsWith('application')) {
          const txt = buffer.toString('utf8').slice(0, 800)
          throw new Error(`Respuesta inesperada: ${txt}`)
        }

        await conn.sendMessage(m.chat, {
          video: buffer,
          mimetype: 'video/mp4',
          caption: `🎬 ${info.videoDetails.title}\n🎥 ${info.videoDetails.author?.name || info.videoDetails.author || ''}`
        }, { quoted: m })

      } catch (err) {
        console.error(err)
        await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al obtener el video. Intenta de nuevo más tarde.' }, { quoted: m })
      }
      return
    }

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { text: '❌ Error inesperado. Intenta de nuevo.' }, { quoted: m })
  }
}

// util: formatea segundos a HH:MM:SS o MM:SS
function formatSeconds(sec = 0) {
  sec = Number(sec) || 0
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = v => String(v).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function sanitizeFileName(name = '') {
  return name.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 64)
}

handler.help = ['play <texto>']
handler.tags = ['downloader', 'tools']
// El handler admite varias invocaciones: play (búsqueda) y los botones play_audio/play_video
handler.command = ['playtest', 'play_audio', 'play_video', 'audio', 'video']

export default handler