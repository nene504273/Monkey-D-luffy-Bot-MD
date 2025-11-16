import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix }) => {
if (!text) return m.reply(`💀 ⍴᥆r 𝖿ᥲ᥎᥆r, іᥒgrᥱsᥲ ᥣ᥆ 𝗊ᥙᥱ ძᥱsᥱᥲs ᑲᥙsᥴᥲr ⍴᥆r ⍴іᥒ𝗍ᥱrᥱs𝗍 🏴‍☠️`)

try {
await m.react('🕒')

const API_URL = `https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`
const res = await axios.get(API_URL)
const data = res.data
let results = data.result || data.results // Intentar con 'result' o 'results'

// 3. Verificar si hay resultados
if (!data.status || !results || results.length === 0) {
    return conn.reply(m.chat, `❀ ✧ No se encontraron resultados para «${text}» ❧ ❀`, m)
}

// 4. Preparar la lista de imágenes
// Intentamos extraer el valor del array 'results' y asumimos que es una URL
const medias = results.slice(0, 10).map(imgUrl => ({
    type: 'image',
    data: { url: imgUrl, title: text } 
}))

// 5. Enviar las imágenes
for (let i = 0; i < medias.length; i++) {
    await conn.sendMessage(m.chat, {
        image: { url: medias[i].data.url },
        caption: i === 0
            ? `💀 ᑲᥙ́s𝗊ᥙᥱძᥲ ᥊ ⍴іᥒ𝗍ᥱrᥱs𝗍\n\n✧ 📌 𝗍і𝗍ᥙᥣ᥆ » «${text}»\n✐ 💎 rᥱsᥙᥣ𝗍ᥲძ᥆s » ${medias.length} іmᥲ́gᥱᥒᥱs ᥱᥒᥴ᥆ᥒ𝗍rᥲძᥲs`
            : `✧ Imagen ${i + 1} de ${medias.length}`
    }, { quoted: m })
}

await m.react('✔️')
} catch (e) {
await m.react('✖️')
conn.reply(m.chat, `⚠︎ 🍖 Se ha producido un error 🍖\n> Usa *${usedPrefix}report* para informarlo.\n\n${e}`, m)
}
}

handler.help = ['pinterest <texto>']
handler.command = ['pinterest', 'pin']
handler.tags = ["descargas"]
handler.group = true

export default handler