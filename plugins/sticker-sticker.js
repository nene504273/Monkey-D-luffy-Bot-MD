import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args }) => {
let stiker = false
let userId = m.sender
let packstickers = global.db.data.users[userId] || {}
// Variables ajustadas a la temática de Luffy/One Piece
let texto1 = packstickers.text1 || 'SOMBRERO' 
let texto2 = packstickers.text2 || 'DE PAJA'
try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ''
let txt = args.join(' ')

if (/webp|image|video/g.test(mime) && q.download) {
if (/video/.test(mime) && (q.msg || q).seconds > 16)
// Mensaje ajustado
return conn.reply(m.chat, '⚓️ ¡Oi! El video no puede durar más de *15 segundos*. ¡Necesitas rapidez para este viaje! 💨', m, global.rcanal)
let buffer = await q.download()
// Reacción de "haciendo algo" (el Sombrero de Paja)
await m.react('👒') 

let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]
stiker = await sticker(buffer, false, marca[0], marca[1])
} else if (args[0] && isUrl(args[0])) {
let buffer = await sticker(false, args[0], texto1, texto2)
stiker = buffer
} else {
// Mensaje ajustado
return conn.reply(m.chat, '🗺️ ¡Necesito algo de carne! Digo... una *imagen* o *video*. ¡Envíalo o respóndelo para crear tu Jolly Roger (sticker)! 🏴‍☠️', m, global.rcanal)
}} catch (e) {
// Mensaje ajustado
await conn.reply(m.chat, '💥 ¡Gomu Gomu no! Algo explotó. Ocurrió un error en la aventura pirata: ' + e.message + ' ⚔️', m, global.rcanal)
// Reacción de "error"
await m.react('😵‍💫') 
} finally {
if (stiker) {
conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
// Reacción de "éxito"
await m.react('👑') 
}}}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'mugiwara'] // Añadí 'mugiwara' como un alias pirata
handler.register = true

export default handler

const isUrl = (text) => {
return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
}