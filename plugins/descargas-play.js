import yts from "yt-search"
import fetch from "node-fetch"

const newsletterJid = '120363420846835529@newsletter'
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏᴛ'
const apikey = 'causa-f8289f3a4ffa44bb'
const apiBaseUrl = 'https://apicausas.xyz/api/v1/descargas/youtube'

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

    if (!text) {
        return conn.reply(m.chat, `☠️ *¡Hey ${name}!* ¿Qué canción o video estás buscando?\n\nEjemplo:\n${usedPrefix + command} Binks no Sake`, m, { contextInfo })
    }

    const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

    // Detectar modo desde botón
    const mode = args[0]?.toLowerCase()
    const isMode = ["audio", "video"].includes(mode)

    // La URL puede venir partida en args si tiene parámetros (?v=xxx)
    // Hay que unir todo desde args[1] en adelante
    const queryOrUrl = isMode ? args.slice(1).join(" ") : text
    const isInputUrl = youtubeRegexID.test(queryOrUrl)

    // --- MODO DESCARGA (viene del botón) ---
    if (isMode && isInputUrl) {
        await m.react("⏳")

        try {
            // Extraer el video ID para mayor seguridad
            const videoIdMatch = queryOrUrl.match(youtubeRegexID)
            const videoId = videoIdMatch?.[1]
            
            // Usar el video ID directamente en la URL de la API
            const cleanUrl = videoId 
                ? `https://www.youtube.com/watch?v=${videoId}` 
                : queryOrUrl

            const apiUrl = `${apiBaseUrl}?apikey=${apikey}&url=${encodeURIComponent(cleanUrl)}&type=${mode}`
            
            console.log("API URL:", apiUrl) // Para debug
            
            const response = await fetch(apiUrl)
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            const result = await response.json()
            
            console.log("API Result:", JSON.stringify(result, null, 2)) // Para debug

            if (!result.status || !result.data?.download?.url) {
                throw new Error(result.msg || result.message || "Sin URL de descarga en la respuesta")
            }

            const { url: downloadUrl } = result.data.download
            const title = result.data.title || "Monkey D. Bot Download"

            if (mode === 'audio') {
                await conn.sendMessage(m.chat, {
                    audio: { url: downloadUrl },
                    fileName: `${title}.mp3`,
                    mimetype: "audio/mpeg",
                    ptt: false
                }, { quoted: m })
                await m.react("✅")

            } else if (mode === 'video') {
                await conn.sendMessage(m.chat, {
                    video: { url: downloadUrl },
                    fileName: `${title}.mp4`,
                    caption: `🎬 *¡Aquí tienes, nakama!*\n🦴 *Título:* ${title}`,
                    mimetype: "video/mp4"
                }, { quoted: m })
                await m.react("✅")
            }

        } catch (error) {
            console.error("Error API completo:", error)
            await m.react("❌")
            return conn.reply(m.chat, `💔 *¡Rayos!* Error: ${error.message}`, m)
        }
        return
    }

    // --- BÚSQUEDA INICIAL ---
    await m.react("🔍")
    let video
    try {
        const match = text.match(youtubeRegexID)
        if (match) {
            video = await yts({ videoId: match[1] })
        } else {
            const s = await yts(text)
            video = s.videos[0]
        }
    } catch (e) {
        await m.react("❌")
        return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${text}"`, m, { contextInfo })
    }

    if (!video) return conn.reply(m.chat, `😵 No se encontraron resultados.`, m, { contextInfo })

    const buttons = [
        { buttonId: `${usedPrefix}${command} audio ${video.url}`, buttonText: { displayText: '🎵 MP3 (Audio)' }, type: 1 },
        { buttonId: `${usedPrefix}${command} video ${video.url}`, buttonText: { displayText: '📹 MP4 (Video)' }, type: 1 }
    ]

    const caption = `
╭───🍖 *¡LO ENCONTRÉ, ${name.toUpperCase()}!* 🍖───
│🍓 *Título:* ${video.title}
│⏱️ *Duración:* ${video.timestamp}
│👁️ *Vistas:* ${video.views.toLocaleString()}
│🎨 *Autor:* ${video.author.name}
│🗓️ *Publicado:* ${video.ago}
╰───────────────────────────────`

    let thumbBuffer = null
    try {
        const thumbData = await conn.getFile(video.thumbnail)
        thumbBuffer = thumbData?.data
    } catch (e) { console.log("Error al cargar miniatura") }

    contextInfo.externalAdReply.thumbnail = thumbBuffer
    contextInfo.externalAdReply.mediaUrl = video.url
    contextInfo.externalAdReply.sourceUrl = video.url

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