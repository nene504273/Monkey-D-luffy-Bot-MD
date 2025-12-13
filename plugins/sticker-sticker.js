import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args }) => {
let stiker = false
let userId = m.sender
let packstickers = global.db.data.users[userId] || {}
let texto1 = packstickers.text1 || global.packsticker
let texto2 = packstickers.text2 || global.packsticker2
try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ''
let txt = args.join(' ')

if (/webp|image|video/g.test(mime) && q.download) {
if (/video/.test(mime) && (q.msg || q).seconds > 16)
// Mensaje de límite de tiempo, ambientado en One Piece.
return conn.reply(m.chat, '🚩 ¡Alto! El video no puede durar más de *15 segundos* para crear un sticker de *One Piece* perfecto ✨', m, global.rcanal)
let buffer = await q.download()
// Reacción al procesar la imagen/video (📌: como si fijara la recompensa)
await m.react('📌')

let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]
stiker = await sticker(buffer, false, marca[0], marca[1])
} else if (args[0] && isUrl(args[0])) {
let buffer = await sticker(false, args[0], texto1, texto2)
stiker = buffer
} else {
// Mensaje de solicitud, ambientado en Luffy.
return conn.reply(m.chat, '🚩 Por favor, envía una *imagen* o *video* para crear un hermoso sticker al estilo *Luffy* ✨', m, global.rcanal)
}} catch (e) {
// Mensaje de error, ambientado en la aventura de Luffy.
await conn.reply(m.chat, '💫 ¡Gomen! Ocurrió un error en la aventura de *Luffy*: ' + e.message + ' ✨', m, global.rcanal)
await m.react('🎵')
} finally {
if (stiker) {
conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
// Reacción final al enviar el sticker (🚩: bandera pirata)
await m.react('🚩')
}}}

handler.help = ['sticker']
handler.tags = ['sticker']
// Usando solo 's' como comando corto.
handler.command = ['s'] 
handler.register = true

export default handler

const isUrl = (text) => {
return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
}