import { ytmp3, ytmp4 } from "../lib/youtubedl.js"
import yts from "yt-search"
import fs from "fs"
import { exec } from "child_process"
import { join } from "path"

const newsletterJid = '120363420846835529@newsletter'
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ 𝐌ᴏ𝐧ᴋ𝐞y 𝐃 𝐁ᴏᴛ'

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

const isMode = ["audio", "video"].includes(args[0]?.toLowerCase())
const queryOrUrl = isMode ? args.slice(1).join(" ") : text
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
const isInputUrl = youtubeRegexID.test(queryOrUrl)

if (isMode && isInputUrl) {
await m.react("⏳")
const mode = args[0].toLowerCase()
try {
if (mode === 'audio') {
const r = await ytmp3(queryOrUrl)
if (!r?.status) throw new Error("Error en la librería (Audio)")
if (!r?.download?.url) throw new Error("Link caído")
await conn.sendMessage(m.chat, {
audio: { url: r.download.url },
fileName: `${r.metadata.title}.mp3`,
mimetype: "audio/mpeg",
ptt: false
}, { quoted: m })
await m.react("✅")
} else if (mode === 'video') {
const r = await ytmp4(queryOrUrl)
if (!r?.status) throw new Error("Error en la librería (Video)")
if (!r?.download?.url) throw new Error("Link caído")
const videoUrl = r.download.url
const title = r.metadata.title || "video"
const tmpDir = join(process.cwd(), 'tmp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
const fileName = join(tmpDir, `${Date.now()}.mp4`)
await new Promise((resolve, reject) => {
exec(`ffmpeg -i "${videoUrl}" -c:v copy -c:a aac -movflags +faststart "${fileName}"`, (err) => {
if (err) reject(err)
else resolve()
})
})
if (!fs.existsSync(fileName)) throw new Error("Error en FFmpeg")
await conn.sendMessage(m.chat, {
video: fs.readFileSync(fileName),
fileName: `${title}.mp4`,
caption: `🎬 *¡Ahí tienes tu video, ${name}!*\n🦴 *Título:* ${title}`,
mimetype: "video/mp4"
}, { quoted: m })
fs.unlinkSync(fileName)
await m.react("✅")
}
} catch (error) {
console.error(error)
await m.react("❌")
return conn.reply(m.chat, `💔 *¡Rayos!* Ocurrió un error al descargar.`, m)
}
return
}

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

const buttons = [
{ buttonId: `${usedPrefix}play audio ${video.url}`, buttonText: { displayText: '🎵 ¡Solo el audio!' }, type: 1 },
{ buttonId: `${usedPrefix}play video ${video.url}`, buttonText: { displayText: '📹 ¡Quiero ver eso!' }, type: 1 }
]

const caption = `
╭───🍖 *¡YOSHI! Encontré esto para ti, ${name}* 🍖───
│🍓 *Título:* ${video.title}
│⏱️ *Duración:* ${video.timestamp}
│👁️ *Vistas:* ${video.views.toLocaleString()}
│🎨 *Autor:* ${video.author.name}
│🗓️ *Publicado:* ${video.ago}
│🔗 *Enlace:* ${video.url}
╰───────────────────────────────`

let thumbBuffer = null
try {
const thumbData = await conn.getFile(video.thumbnail)
thumbBuffer = thumbData?.data
} catch (e) { console.log("Error thumb") }

contextInfo.externalAdReply.thumbnail = thumbBuffer
contextInfo.externalAdReply.mediaUrl = video.url
contextInfo.externalAdReply.sourceUrl = video.url

await conn.sendMessage(m.chat, {
image: { url: video.thumbnail },
caption,
footer: '¡Elige lo que quieres, nakama!',
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