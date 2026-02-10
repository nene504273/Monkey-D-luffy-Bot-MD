import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'

const cooldowns = {}

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('❀ No se pudo cargar el archivo characters.json.')
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        return []
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
        const characters = await loadCharacters()
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)]

        const hasVideos = randomCharacter.vid && randomCharacter.vid.length > 0
        const hasImages = randomCharacter.img && randomCharacter.img.length > 0

        let resourceURL
        let resourceType

        if (hasVideos && Math.random() < 0.6) {
            resourceURL = randomCharacter.vid[Math.floor(Math.random() * randomCharacter.vid.length)]
            resourceType = 'video'
        } else if (hasImages) {
            resourceURL = randomCharacter.img[Math.floor(Math.random() * randomCharacter.img.length)]
            resourceType = 'image'
        } else {
            throw new Error('El personaje no tiene recursos válidos.')
        }

        const statusMessage = randomCharacter.user
            ? `Reclamado por @${randomCharacter.user.split('@')[0]}`
            : 'Libre'

        const message = `╔◡╍┅•.⊹︵ࣾ᷼ ׁ𖥓┅╲۪ ⦙᷼͝🧸᷼͝⦙ ׅ╱ׅ╍𖥓 ︵ࣾ᷼︵ׄׄ᷼⊹┅╍◡╗
┋  ⣿̶ֻ㪔ׅ⃕݊⃧🐚⃚̶̸͝ᤢ֠◌ִ̲ 𝑪𝑯𝑨𝑹𝑨𝑪𝑻𝑬𝑹 𝑹𝑨𝑵𝑫𝑶𝑴 🐸ꨪ̸⃙ׅᮬֺ๋֢᳟  ┋
╚◠┅┅˙•⊹.⁀𖥓 ׅ╍╲۪ ⦙᷼͝🎠᷼͝⦙ ׅ╱ׅ╍𖥓 ◠˙⁀۪ׄ⊹˙╍┅◠╝

> 𝙉𝙊𝙈𝘽𝙍𝙀: *${randomCharacter.name}*
> 𝙂𝙀𝙉𝙀𝙍𝙊: *${randomCharacter.gender}*
> 𝙑𝘼𝙇𝙊𝙍: *${randomCharacter.value}*
> 𝙀𝙎𝙏𝘼𝘿𝙊: ${statusMessage}
> 𝙁𝘜𝘌𝘕𝘛𝘌: *${randomCharacter.source}*
> 𝙄𝘿: *${randomCharacter.id}*`

        const mentions = randomCharacter.user ? [randomCharacter.user] : []

        // Intentar enviar el archivo
        if (resourceType === 'video') {
            await conn.sendMessage(m.chat, { 
                video: { url: resourceURL }, 
                gifPlayback: Math.random() < 0.5, 
                caption: message,
                mentions
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                image: { url: resourceURL }, 
                caption: message,
                mimetype: 'image/png',
                mentions
            }, { quoted: m })
        }

        // Solo se pone el cooldown si el envío fue exitoso
        cooldowns[userId] = now + COOLDOWN_TIME

    } catch (error) {
        // Si el error es 404, es muy probable que el link de la imagen esté roto
        console.error(error)
        await conn.reply(m.chat, `⚠️ *Error 404:* El link de este personaje está roto o no existe. Intenta de nuevo.\n\n_Detalle: ${error.message}_`, m)
    }
}

handler.command = ['ver', 'rw', 'rollwaifu']
handler.group = true

export default handler