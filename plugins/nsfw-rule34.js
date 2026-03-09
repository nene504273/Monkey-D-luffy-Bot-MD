import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (m.isGroup && !db.data.chats[m.chat].nsfw) {
        return m.reply(`${emoji} El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *#nsfw on*`)
    }

    if (!args[0]) {
        return m.reply(`${emoji} Ingresa el tag de la busqueda que quieres ejemplo *${usedPrefix + command} miku*`)
    }

    const tag = args.join(' ')
    const apikey = "causa-f8289f3a4ffa44bb"
    const url = `https://rest.apicausas.xyz/api/v1/nsfw/descargas/rule34?apikey=${apikey}&tags=${encodeURIComponent(tag)}`

    try {
        await m.react('🔍')
        
        const response = await fetch(url)
        const json = await response.json()
        
        if (!json.status || !json.data?.results?.length) {
            await m.react('❌')
            return m.reply(`${emoji2} No hubo resultados para *${tag}*`)
        }

        const results = json.data.results
        const randomImage = results[Math.floor(Math.random() * results.length)]
        const imageUrl = randomImage.file_url

        await conn.sendMessage(m.chat, { 
            image: { url: imageUrl }, 
            caption: `${emoji} Resultados para » *${tag}*`, 
            mentions: [m.sender] 
        }, { quoted: m })

        await m.react('✅')

    } catch (error) {
        console.error(error)
        await m.react('❌')
        await m.reply(`${emoji} Ocurrió un error al procesar la solicitud.`)
    }
}

handler.help = ['r34 <tag>', 'rule34 <tag>']
handler.command = ['r34', 'rule34']
handler.tags = ['nsfw']

export default handler
