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

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
    } catch (error) {
        throw new Error('❀ No se pudo guardar el archivo characters.json.')
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

async function saveHarem(harem) {
    try {
        await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8')
    } catch (error) {
        throw new Error('❀ No se pudo guardar el archivo harem.json.')
    }
}

let handler = async (m, { conn }) =&gt; {
    const userId = m.sender
    const now = Date.now()

    if (cooldowns[userId] &amp;&amp; now &lt; cooldowns[userId]) {
        const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000)
        const minutes = Math.floor(remainingTime / 60)
        const seconds = remainingTime % 60
        return await conn.reply(m.chat, `⏳ Por favor espera *${minutes} minutos y ${seconds} segundos* para usar *#rw* otra vez.`, m)
    }

    try {
        const characters = await loadCharacters()
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
        const randomImage = randomCharacter.img[Math.floor(Math.random() * randomCharacter.img.length)]

        const harem = await loadHarem()
        const userEntry = harem.find(entry =&gt; entry.characterId === randomCharacter.id)
        const statusMessage = randomCharacter.user 
            ? `Reclamado por @${randomCharacter.user.split('@')[0]} 🛡️` 
            : 'Disponible 🌟'

        const message = `
✨彡 𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓽𝓸 𝓻𝔀 𝓼𝓽𝔂𝓵𝓮 彡✨

🌸 𝓝𝓸𝓽𝓪: 𝓮𝓵 𝓹𝓮𝓻𝓼𝓸𝓷𝓪𝓳𝓮 𝓾𝓷𝓲𝓬𝓸 𝓲𝓷𝓽𝓮𝓻𝓮𝓼𝓪𝓷𝓽𝓮 🌸

👤 𝓝𝓸𝓶𝓫𝓻𝓮: *${randomCharacter.name}* 🌺

⚧ 𝓖é𝓷𝓮𝓻𝓸: *${randomCharacter.gender}* 🦋

💎 𝓥𝓪𝓵𝓸𝓻: *${randomCharacter.value}* 💥

📛 𝓔𝓼𝓽𝓪𝓭𝓸: ${statusMessage}

📚 𝓕𝓾𝓮𝓷𝓽𝓮: *${randomCharacter.source}* 📖

🆔 𝓘𝓓: *${randomCharacter.id}* 🎴
`

        const mentions = userEntry ? [userEntry.userId] : []
        await conn.sendFile(m.chat, randomImage, `${randomCharacter.name}.jpg`, message, m, { mentions })

        if (!randomCharacter.user) {
            await saveCharacters(characters)
        }

        cooldowns[userId] = now + 15 * 60 * 1000
    } catch (error) {
        await conn.reply(m.chat, `✘ Error al cargar el personaje: ${error.message}`, m)
    }
}

handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha']
handler.command = ['ver', 'rw', 'rollwaifu']
handler.group = true

export default handler