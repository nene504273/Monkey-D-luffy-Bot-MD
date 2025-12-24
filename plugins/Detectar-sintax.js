import fs from 'fs'
import path from 'path'

var handler = async (m, { usedPrefix, command, conn }) => {
    try {
        await m.react('🕒') 
        conn.sendPresenceUpdate('composing', m.chat)

        const pluginsDir = './plugins'

        const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))

        let response = `⚡ *Revisando Plugins - Modo Luffy*\n\n`
        let hasErrors = false

        for (const file of files) {
            try {
                await import(path.resolve(pluginsDir, file))
            } catch (error) {
                hasErrors = true
                const stackLines = error.stack.split('\n')

                const errorLineMatch = stackLines[0].match(/:(\d+):\d+/) 
                const errorLine = errorLineMatch ? errorLineMatch[1] : 'Desconocido'

                response += `🔴 *¡Gommu Gommu No Error!*\n• Archivo: ${file}\n• Problema: ${error.message}\n• Línea: ${errorLine}\n\n`
            }
        }

        if (!hasErrors) {
            response += '🎉 *¡Shishishi! Todo perfecto, ¡voy a ser el Rey de los Plugins!*'
        }

        await conn.reply(m.chat, response, m)
        await m.react('✅')
    } catch (err) {
        await m.react('✖️') 
        await conn.reply(m.chat, `💢 *¡Mugiwara Crash!*: ${err.message}`, m)
    }
}

handler.command = ['detectarsyntax', 'detectar']
handler.help = ['detectarsyntax']
handler.tags = ['tools']
handler.rowner = true

export default handler