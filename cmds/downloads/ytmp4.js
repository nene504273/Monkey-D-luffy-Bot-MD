import yts from 'yt-search'
import fetch from 'node-fetch'

const cmd = {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloads',
  description: 'Descargar un vídeo de YouTube.',

  run: async ({ msg, sock, args, usedPrefix, command }) => {
    try {
      if (!args[0]) {
        return msg.reply('《✧》Por favor, menciona el nombre o URL del video que deseas descargar')
      }

      const input = args.join(' ').trim()
      const url = await getYoutubeUrl(input)
      const data = await getFareVideo(url)

      if (!data?.status || !data?.data?.dl) {
        return msg.reply('《✧》No se pudo descargar el *video*, intenta más tarde.')
      }

      const title = data.data.title || 'video'
      const quality = data.data.quality || '480p'
      const download = data.data.dl
      const file_name = sanitizeFileName(title) + '.mp4'

      const size_bytes = await getRemoteFileSize(download).catch(() => null)
      const size_text = size_bytes ? formatBytes(size_bytes) : 'Desconocido'

      const send_as_document = size_bytes ? size_bytes > max_video_size : false

      const info_message = `➩ Descargando › *${title}*

> ❒ Calidad › *${quality}*
> ❒ Tamaño › *${size_text}*
> ❒ Enlace › *${url}*`

      await msg.reply(info_message)

      const caption = `乂 *Video descargado*

> ❒ Calidad › *${quality}*
> ❒ Tamaño › *${size_text}*`

      if (send_as_document) {
        await sock.sendMessage(msg.chat, {
          document: { url: download },
          mimetype: 'video/mp4',
          fileName: file_name,
          caption
        }, { quoted: msg })
        return
      }

      try {
        await sock.sendMessage(msg.chat, {
          video: { url: download },
          mimetype: 'video/mp4',
          fileName: file_name,
          caption
        }, { quoted: msg })
      } catch {
        await sock.sendMessage(msg.chat, {
          document: { url: download },
          mimetype: 'video/mp4',
          fileName: file_name,
          caption
        }, { quoted: msg })
      }
    } catch (e) {
      await msg.reply(
        `> An unexpected error occurred while executing command *${usedPrefix + command}*.\n> [Error: *${e.message}*]`
      )
    }
  }
}

export default cmd

const api_url = 'https://api.alyacore.xyz/dl/ytmp4v3'
const api_key = 'LUFFY-FIX67'
const max_video_size = 50 * 1024 * 1024

async function getYoutubeUrl(input) {
  const id = getVideoId(input)

  if (id) return `https://youtu.be/${id}`
  if (isYTUrl(input)) return input

  const search = await yts(input)
  const video = search.videos?.[0] || search.all?.find(v => v.type === 'video')

  if (!video?.url) {
    throw new Error('No se encontró un video válido de YouTube')
  }

  return video.url
}

async function getFareVideo(url) {
  const res = await fetch(
    `${api_url}?url=${encodeURIComponent(url)}&quality=480&key=${api_key}`,
    {
      headers: {
        accept: 'application/json',
        'user-agent': 'Mozilla/5.0'
      }
    }
  )

  const text = await res.text()

  if (!res.ok) {
    throw new Error(`API HTTP ${res.status}: ${text.slice(0, 200)}`)
  }

  let data

  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Respuesta inválida de la API: ${text.slice(0, 200)}`)
  }

  if (!data?.status) {
    throw new Error(data?.message || 'La API no devolvió un resultado válido.')
  }

  if (!data?.data?.dl) {
    throw new Error('La API no devolvió la URL de descarga.')
  }

  return data
}

async function getRemoteFileSize(url) {
  const head = await fetch(url, {
    method: 'HEAD',
    headers: {
      'user-agent': 'Mozilla/5.0'
    }
  }).catch(() => null)

  let length = head?.headers?.get('content-length')
  let bytes = Number(length)

  if (Number.isFinite(bytes) && bytes > 0) {
    return bytes
  }

  const range = await fetch(url, {
    method: 'GET',
    headers: {
      range: 'bytes=0-0',
      'user-agent': 'Mozilla/5.0'
    }
  }).catch(() => null)

  const content_range = range?.headers?.get('content-range')
  const match = content_range?.match(/\/(\d+)$/)

  if (match?.[1]) {
    bytes = Number(match[1])
    if (Number.isFinite(bytes) && bytes > 0) return bytes
  }

  length = range?.headers?.get('content-length')
  bytes = Number(length)

  return Number.isFinite(bytes) && bytes > 0 ? bytes : null
}

const isYTUrl = url =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

function getVideoId(text = '') {
  const raw = String(text || '').trim()

  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw

  return raw.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|[?&]v=)([a-zA-Z0-9_-]{11})/
  )?.[1] || null
}

function sanitizeFileName(name = 'video') {
  return String(name)
    .replace(/\.(mp4|mkv|webm|mov|avi)$/i, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'video'
}

function formatBytes(bytes = 0) {
  if (!bytes || Number.isNaN(bytes)) return 'Desconocido'

  const units = ['B', 'KB', 'MB', 'GB']
  let size = Number(bytes)
  let unit = 0

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit++
  }

  return `${size.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`
}