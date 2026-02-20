import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters.json'
const cooldowns = {}

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('❀ No se pudo cargar el archivo characters.json.')
    }
}

let handler = async (m, { conn }) => {
    const userId = m.sender
    const now = Date.now()
    const COOLDOWN_TIME = 15 * 60 * 1000 

    if (cooldowns[userId] && now < cooldowns[userId]) {
        const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000)
        const minutes = Math.floor(remainingTime / 60)
        const seconds = remainingTime % 60
        return await conn.reply(m.chat, `( ⸝⸝･̆⤚･̆⸝⸝) ¡𝗗𝗲𝗯𝗲𝘀 𝗲𝘀𝗽𝗲𝗿𝗮𝗿 *${minutes} minutos y ${seconds} segundos* 𝗽𝗮𝗿𝗮 𝘃𝗼𝗹𝘃𝗲𝗿  𝘂𝘀𝗮𝗿 *#rw* 𝗱𝗲 𝗻𝘂𝗲𝘃𝗼.`, m)
    }

    try {
        let characters = await loadCharacters()
        let randomCharacter = characters[Math.floor(Math.random() * characters.length)]

        if (randomCharacter.user) {
            for (let i = 0; i < 3; i++) {
                let retry = characters[Math.floor(Math.random() * characters.length)]
                if (!retry.user) {
                    randomCharacter = retry
                    break
                }
            }
        }

        const hasVideos = randomCharacter.vid && randomCharacter.vid.length > 0
        const hasImages = randomCharacter.img && randomCharacter.img.length > 0

        let resourceURL
        let resourceType 

        // --- LÓGICA DE SELECCIÓN CORREGIDA ---
        if (hasVideos && hasImages) {
            // Si tiene ambos, 70% probabilidad de video
            if (Math.random() < 0.7) {
                resourceURL = randomCharacter.vid[Math.floor(Math.random() * randomCharacter.vid.length)]
                resourceType = 'video'
            } else {
                resourceURL = randomCharacter.img[Math.floor(Math.random() * randomCharacter.img.length)]
                resourceType = 'image'
            }
        } else if (hasVideos) {
            resourceURL = randomCharacter.vid[Math.floor(Math.random() * randomCharacter.vid.length)]
            resourceType = 'video'
        } else if (hasImages) {
            resourceURL = randomCharacter.img[Math.floor(Math.random() * randomCharacter.img.length)]
            resourceType = 'image'
        } else {
            return await conn.reply(m.chat, '✘ Este personaje no tiene imágenes ni videos configurados.', m)
        }

        // --- VALIDACIÓN EXTRA DE EXTENSIÓN ---
        // Si por error una imagen está en la lista de videos, esto lo corrige al vuelo
        if (resourceURL.match(/\.(jpg|jpeg|png|webp|gif)$/i)) resourceType = 'image'
        if (resourceURL.match(/\.(mp4|mov|avi)$/i)) resourceType = 'video'

        const statusMessage = randomCharacter.user
            ? `Reclamado por @${randomCharacter.user.split('@')[0]}`
            : '✨ ¡𝗟𝗶𝗯𝗿𝗲! ¡𝗨𝘀𝗮 #claim para reclamar!'

        const message = `╔◡╍┅•.⊹︵ࣾ᷼ ׁ𖥓┅╲۪ ⦙᷼͝🧸᷼͝⦙ ׅ╱ׅ╍𖥓 ︵ࣾ᷼︵ׄׄ᷼⊹┅╍◡╗
┋  ⣿̶ֻ㪝ׅ⃕݊⃧🐚⃚̶̸͝ᤢ֠◌ִ̲ 𝑪𝑯𝑨𝑹𝑨𝑪𝑻𝑬𝑹 𝑹𝑨𝑵𝑫𝑶𝑴 🐸ꨪ̸⃙ׅᮬֺ๋֢᳟  ┋
╚◠┅┅˙•⊹.⁀𖥓 ׅ╍╲۪ ⦙᷼͝🎠᷼͝⦙ ׅ╱ׅ╍𖥓 ◠˙⁀۪ׄ⊹˙╍┅◠╝

꥓໋╭࣭۬═ֽ̥࣪━᜔๋݈═𑂺ׄ︵ິּ֙᷼⌒݈᳹᪾̯ ⋮꥓ּ࣭ׄ🌹㪝ິ᜔ּ໋࣭ׄ⋮⌒ໍּ֣ׄ═ᮣໍ࣭ׄ━𑂺᜔꥓໋┉꥓ׂ᷼━᜔࣭֙━๋݈═̥࣭۬╮
> 𝙉𝙊𝙈𝘽𝙍𝙀: *${randomCharacter.name}*
> 𝙂𝙀𝙉𝙀𝙍𝙊: *${randomCharacter.gender}*
> 𝙑𝘼𝙇𝙊𝙍: *${randomCharacter.value}*
> 𝙀𝙎𝙏𝘼𝘿𝙊: ${statusMessage}
> 𝙁𝙐𝙀𝙉𝙏𝙀: *${randomCharacter.source}*
> 𝙄𝘿: *${randomCharacter.id}*
꥓໋╰ׅ۬═ֽ̥࣪━᜔๋݈═𑂺ׄ︵ິּ֙᷼⌒݈᳹᪾̯ ⋮꥓ּ࣭ׄ🐦‍🔥⋮⌒ໍּ֣ׄ═ᮣໍ࣭ׄ━𑂺᜔꥓໋┉꥓ׂ᷼━᜔࣭֙━๋݈═̥࣭۬╯`

        const mentions = randomCharacter.user ? [randomCharacter.user] : []

        if (resourceType === 'video') {
            await conn.sendMessage(m.chat, { 
                video: { url: resourceURL }, 
                gifPlayback: true, 
                caption: message,
                mentions 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                image: { url: resourceURL }, 
                caption: message,
                mentions 
            }, { quoted: m })
        }

        cooldowns[userId] = now + COOLDOWN_TIME

    } catch (error) {
        console.error(error)
        await conn.reply(m.chat, `✘ Error al cargar el personaje: ${error.message}`, m)
    }
}

handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha']
handler.command = ['ver', 'rw', 'rollwaifu']
handler.group = true

export default handler