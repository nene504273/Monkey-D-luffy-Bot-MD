import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return m.reply(`🍖 ⍴᥆r 𝖿ᥲ᥎᥆r, іᥒgrᥱsᥲ ᥣ᥆ 𝗊ᥙᥱ ძᥱsᥱᥲs ᑲᥙsᥴᥲr ⍴᥆r ⍴іᥒ𝗍ᥱrᥱs𝗍 🏴‍☠️`)

try {
await m.react('🕒')

const res = await axios.get(`https://ruby-core.vercel.app/api/search/pinterest?q=${encodeURIComponent(text)}`)
const data = res.data

if (!data.status || !data.results || data.results.length === 0) {
return conn.reply(m.chat, `🏴‍☠️ ✧ No se encontraron resultados para «${text}» ❧ 🍖`, m)
}

const medias = data.results.slice(0, 10).map(img => ({
type: 'image',
data: { url: img.image_large_url, title: img.title }
}))

for (let i = 0; i < medias.length; i++) {
await conn.sendMessage(m.chat, {
image: { url: medias[i].data.url },
caption: i === 0
? `☠️ ᑲᥙ́s𝗊ᥙᥱძᥲ ᥊ ⍴іᥒ𝗍ᥱrᥱs𝗍\n\n✧ 📌 𝗍і𝗍ᥙᥣ᥆ » «${text}»\n✐ 💎 rᥱsᥙᥣ𝗍ᥲძ᥆s » ${medias.length} іmᥲ́gᥱᥒᥱs ᥱᥒᥴ᥆ᥒ𝗍rᥲძᥲs`
: `✧ ${medias[i].data.title || 'Sin título'}`
}, { quoted: m })
}

await m.react('✔️')
} catch (e) {
await m.react('✖️')
conn.reply(m.chat, `⚠︎ ❀ Se ha producido un error ❀\n> Usa *${usedPrefix}report* para informarlo.\n\n${e}`, m)
}
}

handler.help = ['pinterest <texto>']
handler.command = ['pinterest', 'pin']
handler.tags = ["descargas"]
handler.group = true

export default handler