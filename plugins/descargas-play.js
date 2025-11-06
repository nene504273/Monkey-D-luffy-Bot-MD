// Requisitos: yt-search, node-fetch, axios
// npm i yt-search node-fetch axios
import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const SIZE_LIMIT_MB = 100
const MAX_DURATION_SEC = 8 * 60 // 8 minutos

const handler = async (m, { conn, args = [], usedPrefix }) => {
  try {
    const name = await conn.getName?.(m.sender) || m.pushName || 'usuario'
    args = (args || []).filter(Boolean)

    // helper: reaccionar (si la plataforma lo soporta)
    const react = async (emoji = '⏳') => {
      try { await m.react?.(emoji) } catch (e) { /* ignore */ }
    }

    // helper: formatea segundos
    const formatSeconds = sec => {
      sec = Number(sec || 0)
      const h = Math.floor(sec / 3600)
      const m2 = Math.floor((sec % 3600) / 60)
      const s = sec % 60
      const pad = v => String(v).padStart(2, '0')
      return h > 0 ? `${pad(h)}:${pad(m2)}:${pad(s)}` : `${pad(m2)}:${pad(s)}`
    }

    const sanitizeFileName = name => (name || 'file').replace(/[\/\\?%*:|"<>]/g, '').trim().slice(0, 64)

    // si no hay args -> advertencia
    if (!args[0]) {
      return conn.reply?.(m.chat, `❗️ Uso: ${usedPrefix}play <texto o URL>\nEjemplo: ${usedPrefix}play Despacito`, m)
    }

    // detectar si el primer arg es modo (audio/video)
    const first = args[0].toLowerCase()
    const isMode = first === 'audio' || first === 'video'
    const mode = isMode ? first : null
    const queryOrUrl = isMode ? args.slice(1).join(' ') : args.join(' ')
    const isInputUrl = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/.+$/i.test(queryOrUrl)

    // ---------- Si el usuario pidió modo + URL: procesar descarga ----------
    if (mode && queryOrUrl) {
      await react('⏳')
      const url = queryOrUrl.trim()

      if (!/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)) {
        return conn.reply?.(m.chat, '❌ URL de YouTube inválida. Debe ser un enlace de YouTube.', m)
      }

      // obtener info para validar duración y título
      let video = null
      try {
        const u = new URL(url.startsWith('http') ? url : `https://${url}`)
        const vid = u.searchParams.get('v') || u.pathname.split('/').pop()
        const sr = await yts({ videoId: vid })
        video = sr.videos?.[0] || null
      } catch {
        try {
          const sr = await yts(url)
          video = sr.videos?.[0] || null
        } catch (e) { console.error(e) }
      }

      if (!video) {
        return conn.reply?.(m.chat, '❌ No pude obtener información del video. Revisa la URL.', m)
      }

      const lengthSec = Number(video.seconds || 0)
      if (lengthSec > MAX_DURATION_SEC) {
        return conn.reply?.(m.chat, '⚠️ El video supera los 8 minutos. No puedo enviar archivos de más de 8 minutos.', m)
      }

      // construir endpoint ruby-core (mp3 / mp4)
      const apiUrl = mode === 'audio'
        ? `https://ruby-core.vercel.app/api/download/youtube/mp3?url=${encodeURIComponent(url)}`
        : `https://ruby-core.vercel.app/api/download/youtube/mp4?url=${encodeURIComponent(url)}`

      try {
        const res = await fetch(apiUrl)
        if (!res.ok) {
          // intentar leer texto para debug
          const txt = await res.text().catch(() => '')
          throw new Error(`API error ${res.status} ${res.statusText} ${txt}`)
        }

        const ct = (res.headers.get('content-type') || '').toLowerCase()

        // Si la API devuelve JSON con link de descarga
        if (ct.includes('application/json') || ct.includes('text/json')) {
          const json = await res.json().catch(() => null)
          const downloadUrl = json?.download || json?.url || json?.result?.url || json?.link
          if (!downloadUrl) throw new Error('No se obtuvo download link en JSON')
          // obtener HEAD para tamaño
          try {
            const head = await axios.head(downloadUrl, { timeout: 15000 })
            const cl = head.headers['content-length']
            const sizeMb = cl ? Number(cl) / (1024 * 1024) : null
            if (sizeMb && sizeMb > SIZE_LIMIT_MB) {
              // enviar como documento remoto
              await conn.sendMessage(m.chat, {
                document: { url: downloadUrl },
                fileName: `${sanitizeFileName(video.title)}.${mode === 'audio' ? 'mp3' : 'mp4'}`,
                mimetype: mode === 'audio' ? 'audio/mpeg' : 'video/mp4',
                caption: `⚠️ Archivo grande (${sizeMb ? sizeMb.toFixed(2) + ' MB' : 'desconocido'}). Enviado como documento.\nTítulo: ${video.title}`
              }, { quoted: m })
              await react('📄')
              return
            } else {
              // descargar y enviar
              const dl = await fetch(downloadUrl)
              const buf = Buffer.from(await dl.arrayBuffer())
              if (mode === 'audio') {
                await conn.sendMessage(m.chat, { audio: buf, mimetype: 'audio/mpeg', fileName: `${sanitizeFileName(video.title)}.mp3` }, { quoted: m })
                await react('🎧')
              } else {
                await conn.sendMessage(m.chat, { video: buf, mimetype: 'video/mp4', caption: `🎬 ${video.title}` }, { quoted: m })
                await react('📽️')
              }
              return
            }
          } catch (e) {
            console.error('Error HEAD/downloadUrl:', e)
            // seguir a intento de enviar el body directo (a continuación)
          }
        }

        // Si la API devolvió directamente el binario (audio/video)
        const buffer = Buffer.from(await res.arrayBuffer())
        const clHeader = res.headers.get('content-length')
        const sizeMb = clHeader ? Number(clHeader) / (1024 * 1024) : (buffer.length / (1024 * 1024))

        if (sizeMb > SIZE_LIMIT_MB) {
          // guardar temporalmente y enviar como documento
          const tmpDir = path.join(process.cwd(), 'tmp')
          if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
          const tmpFile = path.join(tmpDir, `${Date.now()}.${mode === 'audio' ? 'mp3' : 'mp4'}`)
          fs.writeFileSync(tmpFile, buffer)
          const stream = fs.createReadStream(tmpFile)
          await conn.sendMessage(m.chat, {
            document: stream,
            fileName: `${sanitizeFileName(video.title)}.${mode === 'audio' ? 'mp3' : 'mp4'}`,
            mimetype: mode === 'audio' ? 'audio/mpeg' : 'video/mp4',
            caption: `⚠️ Archivo grande (${sizeMb.toFixed(2)} MB). Enviado como documento.\nTítulo: ${video.title}`
          }, { quoted: m })
          await react('📄')
          try { fs.unlinkSync(tmpFile) } catch {}
        } else {
          if (mode === 'audio') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', fileName: `${sanitizeFileName(video.title)}.mp3` }, { quoted: m })
            await react('🎧')
          } else {
            await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', caption: `🎬 ${video.title}` }, { quoted: m })
            await react('📽️')
          }
        }
        return
      } catch (err) {
        console.error('Error descargando desde ruby-core:', err)
        return conn.reply?.(m.chat, '❌ Ocurrió un error al obtener el archivo desde la API de descarga.', m)
      }
    }

    // ---------- Modo búsqueda normal: #play <texto o url> ----------
    await react('⏳')

    // obtener video por URL o búsqueda
    let video = null
    if (isInputUrl) {
      try {
        const u = new URL(queryOrUrl.startsWith('http') ? queryOrUrl : `https://${queryOrUrl}`)
        const vid = u.searchParams.get('v') || u.pathname.split('/').pop()
        const sr = await yts({ videoId: vid })
        video = sr.videos?.[0] || null
      } catch {
        try {
          const sr = await yts(queryOrUrl)
          video = sr.videos?.[0] || null
        } catch (e) { console.error(e) }
      }
    } else {
      try {
        const sr = await yts(queryOrUrl)
        video = sr.videos?.[0] || null
      } catch (e) { console.error(e) }
    }

    if (!video) {
      return conn.reply?.(m.chat, `❌ No encontré resultados para: "${queryOrUrl}"`, m)
    }

    const durationSec = Number(video.seconds || 0)
    const durationText = video.timestamp || formatSeconds(durationSec)
    // thumbnail válido
    let thumbnail = video.thumbnail || null
    try {
      if (thumbnail) {
        const head = await axios.head(thumbnail, { timeout: 10000 }).catch(() => null)
        if (!head?.headers['content-type']?.startsWith('image')) thumbnail = null
      }
    } catch { thumbnail = null }
    if (!thumbnail) thumbnail = 'https://i.imgur.com/JP52fdP.jpg'

    const caption = `
Título: ${video.title}
Autor: ${video.author?.name || video.author || 'Desconocido'}
Duración: ${durationText}
Vistas: ${video.views?.toLocaleString() || 'N/A'}
Enlace: ${video.url}

> Selecciona una opción para enviar:
`.trim()

    const buttons = [
      { buttonId: `${usedPrefix}play audio ${video.url}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
      { buttonId: `${usedPrefix}play video ${video.url}`, buttonText: { displayText: '📹 Video' }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption,
      footer: 'Selecciona: Audio o Video',
      buttons,
      headerType: 4
    }, { quoted: m })

  } catch (err) {
    console.error('Error en handler play:', err)
    try { await conn.reply?.(m.chat, '❌ Ocurrió un error interno. Intenta de nuevo más tarde.', m) } catch {}
  }
}

handler.help = ['play <texto o URL>']
handler.tags = ['descargas', 'downloader']
handler.command = ['play']
handler.register = true
handler.prefix = /^[./#]/

export default handler