import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const SIZE_LIMIT_MB = 100
const MAX_DURATION_SEC = 8 * 60 // 8 minutos

const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const name = await conn.getName(m.sender)
    args = (args || []).filter(v => v?.trim())

    // contexto para replies (se puede ajustar)
    const contextInfo = {
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardingScore: 999,
      externalAdReply: {
        title: 'Buscando en YouTube...',
        body: `Petición de ${name}`,
        mediaType: 1
      }
    }

    // si no hay argumentos -> advertencia
    if (!args[0]) {
      return conn.reply(m.chat, `❗️ Uso: ${usedPrefix}play <texto o URL>\nEjemplo: ${usedPrefix}play Despacito`, m, { contextInfo })
    }

    // detectar si usuario puso modo al inicio: "audio" o "video"
    const isMode = ["audio", "video"].includes(args[0].toLowerCase())
    const modeArg = isMode ? args[0].toLowerCase() : null
    const queryOrUrl = isMode ? args.slice(1).join(' ') : args.join(' ')
    const isInputUrl = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/.+$/i.test(queryOrUrl)

    // helper reacción (reloj)
    const react = async (emoji = '⏳') => {
      try { await m.react?.(emoji) } catch (e) { /* ignore */ }
    }

    // si especificó modo y además dio URL -> intentamos descarga directa
    if (isMode && queryOrUrl) {
      await react('⏳')
      const mode = modeArg // 'audio' o 'video'
      const url = queryOrUrl.trim()

      if (!/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)) {
        return conn.reply(m.chat, '❌ URL de YouTube inválida. Debe ser un enlace de YouTube.', m, { contextInfo })
      }

      // obtener info del video con yt-search para verificar duración y título
      let videoInfo = null
      try {
        if (/youtu\.be/.test(url) || /youtube\.com/.test(url)) {
          // intentar extraer id
          try {
            const u = new URL(url.startsWith('http') ? url : `https://${url}`)
            const v = u.searchParams.get('v') || u.pathname.split('/').pop()
            const sr = await yts({ videoId: v })
            videoInfo = sr.videos?.[0] || null
          } catch {
            const sr = await yts(url)
            videoInfo = sr.videos?.[0] || null
          }
        } else {
          const sr = await yts(url)
          videoInfo = sr.videos?.[0] || null
        }
      } catch (e) {
        console.error('Error obteniendo información del video:', e)
      }

      if (!videoInfo) {
        return conn.reply(m.chat, '❌ No pude obtener información del video. Revisa la URL.', m, { contextInfo })
      }

      const lengthSec = Number(videoInfo.seconds || 0)
      if (lengthSec > MAX_DURATION_SEC) {
        return conn.reply(m.chat, '⚠️ El video supera los 8 minutos. No puedo enviar archivos de más de 8 minutos.', m, { contextInfo })
      }

      // Llamar a la API de ruby-core para obtener mp3/mp4
      const apiEndpoint = mode === 'audio'
        ? `https://ruby-core.vercel.app/api/download/youtube/mp3?url=${encodeURIComponent(url)}`
        : `https://ruby-core.vercel.app/api/download/youtube/mp4?url=${encodeURIComponent(url)}`

      try {
        const res = await fetch(apiEndpoint)
        if (!res.ok) {
          // intentar leer body para diagnóstico
          let t = ''
          try { t = await res.text() } catch {}
          throw new Error(`API error ${res.status} ${res.statusText} ${t}`)
        }

        const contentType = res.headers.get('content-type') || ''
        // si la API devolvió JSON (posible error o link), parsear
        if (contentType.includes('application/json')) {
          const json = await res.json().catch(() => null)
          // si nos dan un enlace de descarga en json.download or json.url -> usarlo
          const downloadUrl = json?.download || json?.url || json?.result?.url
          if (downloadUrl) {
            // obtener HEAD para conocer tamaño
            try {
              const head = await axios.head(downloadUrl, { timeout: 15000 })
              const cl = head.headers['content-length']
              const sizeMb = cl ? Number(cl) / (1024 * 1024) : null
              if (sizeMb && sizeMb > SIZE_LIMIT_MB) {
                // enviar como documento remoto
                await conn.sendMessage(m.chat, {
                  document: { url: downloadUrl },
                  fileName: `${sanitizeFileName(videoInfo.title || 'file')}.${mode === 'audio' ? 'mp3' : 'mp4'}`,
                  mimetype: mode === 'audio' ? 'audio/mpeg' : 'video/mp4',
                  caption: `⚠️ Archivo grande (${sizeMb ? sizeMb.toFixed(2) + ' MB' : 'desconocido'}). Enviado como documento.\nTítulo: ${videoInfo.title}`
                }, { quoted: m })
                await react('📄')
                return
              } else {
                // descargar y enviar
                const dlRes = await fetch(downloadUrl)
                const buf = Buffer.from(await dlRes.arrayBuffer())
                if (mode === 'audio') {
                  await conn.sendMessage(m.chat, { audio: buf, mimetype: 'audio/mpeg', fileName: `${sanitizeFileName(videoInfo.title)}.mp3` }, { quoted: m })
                  await react('🎧')
                } else {
                  await conn.sendMessage(m.chat, { video: buf, mimetype: 'video/mp4', caption: `🎬 ${videoInfo.title}` }, { quoted: m })
                  await react('📽️')
                }
                return
              }
            } catch (e) {
              console.error('Error usando downloadUrl del JSON:', e)
              // seguir al siguiente intento
            }
          }
          return conn.reply(m.chat, '❌ La API devolvió una respuesta inesperada.', m, { contextInfo })
        }

        // Si la respuesta es audio/video directamente
        const buffer = Buffer.from(await res.arrayBuffer())
        // intentar obtener content-length también
        const clHeader = res.headers.get('content-length')
        const sizeMb = clHeader ? Number(clHeader) / (1024 * 1024) : (buffer.length / (1024 * 1024))

        if (sizeMb > SIZE_LIMIT_MB) {
          // es muy grande -> enviar como documento externo si posible (no tenemos url): lo podemos guardar local y enviar como document buffer
          const tmpPath = path.join(process.cwd(), 'tmp')
          if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath, { recursive: true })
          const tmpFile = path.join(tmpPath, `${Date.now()}.${mode === 'audio' ? 'mp3' : 'mp4'}`)
          fs.writeFileSync(tmpFile, buffer)
          const fileStream = fs.createReadStream(tmpFile)
          await conn.sendMessage(m.chat, {
            document: fileStream,
            fileName: `${sanitizeFileName(videoInfo.title)}.${mode === 'audio' ? 'mp3' : 'mp4'}`,
            mimetype: mode === 'audio' ? 'audio/mpeg' : 'video/mp4',
            caption: `⚠️ Archivo grande (${sizeMb.toFixed(2)} MB). Enviado como documento.\nTítulo: ${videoInfo.title}`
          }, { quoted: m })
          await react('📄')
          try { fs.unlinkSync(tmpFile) } catch {}
        } else {
          if (mode === 'audio') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', fileName: `${sanitizeFileName(videoInfo.title)}.mp3` }, { quoted: m })
            await react('🎧')
          } else {
            await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', caption: `🎬 ${videoInfo.title}` }, { quoted: m })
            await react('📽️')
          }
        }
        return
      } catch (err) {
        console.error('Error descargando desde ruby-core:', err)
        return conn.reply(m.chat, '❌ Ocurrió un error al obtener el archivo desde la API de descarga.', m, { contextInfo })
      }
    }

    // --- Modo búsqueda: mostrar thumbnail con botones ---
    await react('⏳') // reaccionar mientras busca

    // buscar video (si es URL, obtener video por id)
    let video = null
    if (isInputUrl) {
      try {
        const u = new URL(queryOrUrl.startsWith('http') ? queryOrUrl : `https://${queryOrUrl}`)
        const vid = u.searchParams.get('v') || u.pathname.split('/').pop()
        const sr = await yts({ videoId: vid })
        video = sr.videos?.[0] || null
      } catch (e) {
        try {
          const sr = await yts(queryOrUrl)
          video = sr.videos?.[0] || null
        } catch (err) {
          console.error('Error buscando por URL:', err)
        }
      }
    } else {
      try {
        const sr = await yts(queryOrUrl)
        video = sr.videos?.[0] || null
      } catch (e) {
        console.error('Error buscando en yt-search:', e)
      }
    }

    if (!video) {
      return conn.reply(m.chat, `❌ No encontré resultados para: "${queryOrUrl}"`, m, { contextInfo })
    }

    // verificar duración y preparar thumbnail
    const durationSec = Number(video.seconds || 0)
    const durationText = video.timestamp || formatSeconds(durationSec)
    let thumbnail = video.thumbnail || null
    try {
      if (thumbnail) {
        const head = await axios.head(thumbnail, { timeout: 10000 })
        if (!head.headers['content-type']?.startsWith('image')) thumbnail = null
      }
    } catch {
      thumbnail = null
    }
    if (!thumbnail) thumbnail = 'https://i.imgur.com/JP52fdP.jpg'

    // construir botones (botones envían comando con modo + url)
    const buttons = [
      { buttonId: `${usedPrefix}play audio ${video.url}`, buttonText: { displayText: '🎵 Audio' }, type: 1 },
      { buttonId: `${usedPrefix}play video ${video.url}`, buttonText: { displayText: '📹 Video' }, type: 1 }
    ]

    const caption = `
Título: ${video.title}
Autor: ${video.author?.name || video.author || 'Desconocido'}
Duración: ${durationText}
Vistas: ${video.views?.toLocaleString() || 'N/A'}
Enlace: ${video.url}

> Selecciona una opción para enviar:
`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption,
      footer: 'Selecciona: Audio o Video',
      buttons,
      headerType: 4,
      contextInfo
    }, { quoted: m })

  } catch (err) {
    console.error('Error en handler play:', err)
    try { await conn.reply(m.chat, '❌ Ocurrió un error interno. Intenta de nuevo más tarde.', m) } catch {}
  }
}

// utilidades
function formatSeconds(sec = 0) {
  sec = Number(sec) || 0
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = v => String(v).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function sanitizeFileName(name = '') {
  return (name || 'file').replace(/[\/\\?%*:|"<>]/g, '').trim().slice(0, 64)
}

handler.help = ['play <texto o URL>']
handler.tags = ['descargas', 'downloader']
handler.command = ['play']
handler.register = true
handler.prefix = /^[./#]/

export default handler