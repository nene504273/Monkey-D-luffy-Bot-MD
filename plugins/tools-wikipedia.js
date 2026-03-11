let handler = async (m, { args, conn }) => {
    if (!args[0]) return m.reply('📖 Escribe algo para buscar.\nEjemplo: .wiki Albert Einstein')

    const query = args.join(' ')
    const apikey = 'causa-f8289f3a4ffa44bb'

    try {
        const url = `https://rest.apicausas.xyz/api/v1/buscadores/wikipedia?apikey=${apikey}&q=${encodeURIComponent(query)}&lang=es`
        const res = await fetch(url)
        const data = await res.json()

        if (!data.status) return m.reply(`❌ No encontré nada sobre *${query}*.`)

        const texto =
            `📖 *${data.title}*\n` +
            (data.description ? `_${data.description}_\n` : '') +
            `\n${data.summary}\n\n` +
            `🔗 ${data.url}`

        if (data.image) {
            try {
                const imgRes = await fetch(data.image, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                })
                const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
                await conn.sendMessage(m.chat, {
                    image: imgBuffer,
                    caption: texto
                }, { quoted: m })
            } catch {
                await m.reply(texto)
            }
        } else {
            await m.reply(texto)
        }

    } catch (e) {
        await m.reply('❌ Error al buscar en Wikipedia.')
    }
}

handler.help = ['wiki <búsqueda>']
handler.tags = ['info']
handler.command = ['wiki', 'wikipedia', 'w']

export default handler