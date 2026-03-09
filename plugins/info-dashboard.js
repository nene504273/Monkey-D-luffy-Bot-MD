let handler = async (m, { conn, command }) => {

    if (command == 'dash' || command == 'dashboard' || command == 'views') {
        let stats = Object.entries(global.db.data.stats || {}).map(([key, val]) => {
            let name = Array.isArray(global.plugins[key]?.help) ? global.plugins[key]?.help?.join(' , ') : global.plugins[key]?.help || key
            if (/exec/.test(name)) return null
            return { name, ...val }
        }).filter(Boolean)

        stats = stats.sort((a, b) => b.total - a.total)

        if (!stats.length) return conn.reply(m.chat, '📊 No hay estadísticas aún.', m)

        const handlers = stats.slice(0, 10).map(({ name, total }) => {
            return `⬡ *Comando* : *${name}*\n⬡ *Usos* : ${total}`
        }).join('\n\n')

        conn.reply(m.chat, `📊 *Top 10 Comandos Más Usados*\n\n${handlers}`, m)
    }

    if (command == 'database' || command == 'usuarios' || command == 'user') {
        let totalreg = Object.keys(global.db.data.users).length
        let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length

        conn.reply(m.chat, `🗂️ *Tengo ${rtotalreg} Usuarios Registrados*\n\n📂 *${totalreg} en total*`, m)
    }

}

handler.help = ['dash', 'dashboard', 'views', 'database', 'usuarios', 'user']
handler.tags = ['info']
handler.command = ['dashboard', 'dash', 'views', 'database', 'usuarios', 'user']
handler.owner = true

export default handler
