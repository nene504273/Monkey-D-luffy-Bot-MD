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

let handler = async (m, { conn }) => {
    const userId = m.sender
    const now = Date.now()

    if (cooldowns[userId] && now < cooldowns[userId]) {
        const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000)
        const minutes = Math.floor(remainingTime / 60)
        const seconds = remainingTime % 60
        return await conn.reply(m.chat, `( ⸝⸝･̆⤚･̆⸝⸝) ¡𝗗𝗲𝗯𝗲𝘀 𝗲𝘀𝗽𝗲𝗿𝗮𝗿 *${minutes} minutos y ${seconds} segundos* 𝗽𝗮𝗿𝗮 𝘃𝗼𝗹𝘃𝗲𝗿  𝘂𝘀𝗮𝗿 *#rw* 𝗱𝗲 𝗻𝘂𝗲𝘃𝗼.`, m)
    }

    try {
        const characters = await loadCharacters()
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
        const randomImage = randomCharacter.img[Math.floor(Math.random() * randomCharacter.img.length)]

        const harem = await loadHarem()
        const userEntry = harem.find(entry => entry.characterId === randomCharacter.id)
        const statusMessage = randomCharacter.user 
            ? `Reclamado por @${randomCharacter.user.split('@')[0]}` 
            : 'Libre'

        const message = `╔◡❦︎┅•.⊹☾︎︵ࣾ᷼ ׁ𖥓┅╲۪ ⦙᷼͝🌺⦙ ׅ╱ׅ╍𖥓 ︵ࣾ᷼︵ׄׄ᷼☽︎⊹◡╗
┋  ⣿̶ֻ〪ׅ⃕݊⃧🌈⃚̶̸͝ᤢ֠◌ִ̲  𝑪𝑯𝑨𝑹𝑨𝑪𝑻𝑬𝑹 𝑹𝑨𝑵𝑫𝑶𝑴 🎃ꨪ̸⃙ׅᮬֺ๋֢᳟  ┋
╚◠༒︎┅˙•⊹.⁀𖥓 ׅ╍╲۪ ⦙᷼͝🦋᷼͝⦙ ׅ╱ׅ╍𖥓 ◠˙⁀۪ׄ⊹𓆉︎˙◠╝
꥓໋╭࣭۬═ֽ̥࣪━᜔๋݈☾︎❦︎︵ິּ֙᷼⌒݈᳹᪾̯ ⋮꥓ּ࣭ׄ🪷〪ິ᜔໋࣭⋮⌒ໍּ֣ׄ═ᮣໍ࣭ׄ━𑂺᜔໋ت︎♥︎━᜔࣭֙━๋݈═̥࣭۬╮
> ఌ︎✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ🪼᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:   𝑁𝑂𝑀𝐵𝑅𝐸: *${randomCharacter.name}*
> ఌ︎✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ✨᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:  𝐺𝐸𝑁𝐸𝑅𝑂: *${randomCharacter.gender}*
> ఌ︎✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ💹᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:   𝑉𝐴𝐿𝑂𝑅: *${randomCharacter.value}*
> ఌ︎✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ🪄᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:   𝙀𝘚𝘛𝘈𝘋𝘖: *${statusMessage}
> ఌ︎✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ📚᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:   𝐹𝑈𝐸𝑁𝑇𝐸: *${randomCharacter.source}*
> ఌ︎✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ🆔᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:   𝙄𝘿: *${randomCharacter.id}*
꥓໋╰ׅ۬═ֽ̥࣪🝮︎︎︎︎︎︎︎𓁹═𑂺ׄ︵ິּ֙᷼⌒݈᳹᪾̯ ⋮꥓ּ࣭ׄ🌸⋮⌒ໍּ֣ׄ═ᮣໍ࣭ׄ━𑂺᜔꥓໋┉꥓᷼シ︎━๋݈═̥࣭۬╯`

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