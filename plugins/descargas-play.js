import fetch from "node-fetch"
import yts from "yt-search"

const newsletterJid = '120363420846835529@newsletter'
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏᴛ'
const API_KEY = 'causa-f8289f3a4ffa44bb'
const API_BASE = 'https://rest.apicausas.xyz/api/v1/descargas/youtube'
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
const MAX_AUDIO = 16 * 1024 * 1024
const MAX_VIDEO = 64 * 1024 * 1024

const handler = async (m, { conn, args, usedPrefix, command, text }) => {
  const name = conn.getName(m.sender)

  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    },
    externalAdReply: {
      title: '¡El Rey de los Piratas te trae música! 🎶',
      body: `¡Vamos a buscar eso, ${name}!`,
      thumbnail: null,
      sourceUrl: null,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  }

  if (!text?.trim()) {
    return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué canción o video estás buscando?\n\nEjemplo:\n${usedPrefix + command} Binks no Sake`, m, { contextInfo })
  }

  const mode = args[0]?.toLowerCase()
  const isMode = ["audio", "video"].includes(mode)
  const queryOrUrl = isMode ? args.slice(1).join(" ") : text
  const isUrl = youtubeRegexID.test(queryOrUrl)

  // --- MODO DESCARGA (viene del botón) ---
  if (isMode && isUrl) {
    await m.react("⏳")
    try {
      const videoId = queryOrUrl.match(youtubeRegexID)?.[1]
      const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`
      const apiUrl = `${API_BASE}?url=${encodeURIComponent(cleanUrl)}&type=${mode}&apikey=${API_KEY}`

      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json?.status || !json?.data?.download?.url) {
        throw new Error(json?.msg || "Sin URL de descarga")
      }

      const dlUrl = json.data.download.url
      const title = json.data.title || "descarga"

      // Verificar tamaño
      let fileSize = 0
      try {
        const head = await fetch(dlUrl, { method: 'HEAD' })
        fileSize = parseInt(head.headers.get('content-length') || '0')
      } catch (_) {}

      if (mode === 'audio') {
        const supera = fileSize > MAX_AUDIO
        await conn.sendMessage(m.chat, supera
          ? { document: { url: dlUrl }, fileName: `${title}.mp3`, mimetype: "audio/mpeg" }
          : { audio: { url: dlUrl }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", ptt: false }
        , { quoted: m })
      } else {
        const supera = fileSize > MAX_VIDEO
        await conn.sendMessage(m.chat, supera
          ? { document: { url: dlUrl }, fileName: `${title}.mp4`, mimetype: "video/mp4" }
          : { video: { url: dlUrl }, fileName: `${title}.mp4`, mimetype: "video/mp4", caption: `🎬 *${title}*` }
        , { quoted: m })
      }

      await m.react("✅")
    } catch (e) {
      await m.react("❌")
      return conn.reply(m.chat, `💔 *¡Rayos!* Error: ${e.message}`, m)
    }
    return
  }

  // --- BÚSQUEDA INICIAL ---
  await m.react("🔍")
  let video
  try {
    const match = text.match(youtubeRegexID)
    if (match) {
      const s = await yts({ videoId: match[1] })
      video = s.all?.[0] || s
    } else {
      const s = await yts(text)
      video = s.videos[0]
    }
  } catch (e) {
    await m.react("❌")
    return conn.reply(m.chat, `😵 No encontré nada con: "${text}"`, m, { contextInfo })
  }

  if (!video) return conn.reply(m.chat, `😵 No se encontraron resultados.`, m, { contextInfo })

  const vistas = formatViews(video.views)

  let thumbBuffer = null
  try {
    const thumbData = await conn.getFile(video.thumbnail)
    thumbBuffer = thumbData?.data
  } catch (_) {}

  contextInfo.externalAdReply.thumbnail = thumbBuffer
  contextInfo.externalAdReply.mediaUrl = video.url
  contextInfo.externalAdReply.sourceUrl = video.url

  const buttons = [
    { buttonId: `${usedPrefix}${command} audio ${video.url}`, buttonText: { displayText: '🎵 MP3 (Audio)' }, type: 1 },
    { buttonId: `${usedPrefix}${command} video ${video.url}`, buttonText: { displayText: '📹 MP4 (Video)' }, type: 1 }
  ]

  const caption = `╭───🍖 *¡LO ENCONTRÉ, ${name.toUpperCase()}!* 🍖───
│🍓 *Título:* ${video.title}
│⏱️ *Duración:* ${video.timestamp}
│👁️ *Vistas:* ${vistas}
│🎨 *Autor:* ${video.author?.name || 'Desconocido'}
│🗓️ *Publicado:* ${video.ago}
╰───────────────────────────────`

  await conn.sendMessage(m.chat, {
    image: { url: video.thumbnail },
    caption,
    footer: '¿Cómo quieres que te lo entregue, nakama?',
    buttons,
    headerType: 4,
    contextInfo
  }, { quoted: m })
  await m.react("🏴‍☠️")
}

handler.help = ['play'].map(v => v + ' <texto o URL>')
handler.tags = ['descargas']
handler.command = ['play']
handler.register = true

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}k`
  return views.toString()
}