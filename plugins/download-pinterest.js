//image search on Pinterest ♡♡
//Ruby Core Api 💛
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply(`Por favor, ingresa un término para buscar en Pinterest.\n\n*Ejemplo:*\n${usedPrefix + command} Gatos`)

try {
await m.react('🕒')

const res = await axios.get(`https://ruby-core.vercel.app/api/search/pinterest?q=${encodeURIComponent(text)}`)
const data = res.data

if (!data.status || !data.results || data.results.length === 0) {
await m.react('❌')
return conn.reply(m.chat, `No se encontraron resultados para "${text}".`, m, rcanal)
}

const resultsToSend = data.results.slice(0, 10)

for (let i = 0; i < resultsToSend.length; i++) {
const result = resultsToSend[i]
await conn.sendMessage(m.chat, {
image: { url: result.image_large_url },
caption: i === 0
? `*Encontré estas imágenes de *"${text}"*`
: `${result.title || 'Sin título'}`,
}, { quoted: m })
}

await m.react('✔️')
} catch (e) {
await m.react('✖️')
conn.reply(m.chat, `Ocurrió un error al procesar la solicitud. Por favor, inténtalo de nuevo.\n\n*Error:* ${e}`, m, rcanal)
}
}

handler.help = ['pinterest <texto>']
handler.command = ['pinterest', 'pin']
handler.tags = ["descargas"]
handler.group = true

export default handler