import yts from "yt-search"
import fetch from "node-fetch"

const newsletterJid = '120363420846835529@newsletter'
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏᴛ'
const apikey = 'causa-f8289f3a4ffa44bb'
const apiBaseUrl = 'https://apicausas.xyz/api/v1/descargas/youtube'

const handler = async (m, { conn, args, usedPrefix, command, text }) => {
    const name = conn.getName(m.sender)
    
    // Configuración visual del mensaje (ContextInfo)
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

    // Detectar si venimos de un botón (modo + URL)
    const isMode = ["audio", "video"].includes(args[0]?.toLowerCase())
    const queryOrUrl = isMode ? args.slice(1).join(" ") : text
    const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
    const isInputUrl = youtubeRegexID.test(queryOrUrl)

    if (isMode && isInputUrl) {
        await m.react("⏳")
        const mode = args[0].toLowerCase() 
        
        try {
            // Construcción de la URL de la API según tu endpoint
            const apiUrl = `${apiBaseUrl}?apikey=${apikey}&url=${encodeURIComponent(queryOrUrl)}&type=${mode}`
            const response = await fetch(apiUrl)
            const result = await response.json()

            // Validación basada en el JSON que me mostraste
            if (!result.status || !result.data?.download?.url) {
                throw new Error(result.msg || "Error en la descarga")
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
            console.error("Error API:", error)
            await m.react("❌")
            return conn.reply(m.chat, `💔 *¡Rayos!* No pude obtener el archivo. Puede que la API esté saturada o el link sea inválido.`, m)
        }
        return
    }

    // --- BÚSQUEDA INICIAL ---
    await m.react("🔍")
    let video
    try {
        const match = queryOrUrl.match(youtubeRegexID)
        if (match) {
            const s = await yts({ videoId: match[1] })
            video = s
        } else {
            const s = await yts(queryOrUrl)
            video = s.videos[0]
        }
    } catch (e) {
        await m.react("❌")
        return conn.reply(m.chat, `😵 *¡Rayos! No encontré nada con:* "${queryOrUrl}"`, m, { contextInfo })
    }

    if (!video) return conn.reply(m.chat, `😵 No se encontraron resultados.`, m, { contextInfo })

    // Botones para elegir formato
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

    // Intentar obtener el buffer de la miniatura para el AdReply
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