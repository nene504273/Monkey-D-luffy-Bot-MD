import fs from 'fs'
import path from 'path'

var handler = async (m, { usedPrefix, command, conn }) => {
    try {
        await m.react('🍖') 
        conn.sendPresenceUpdate('composing', m.chat)

        const pluginsDir = './plugins'

        const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'))

        let response = `🏴‍☠️ *INSPECCIÓN DE SINTÁXIS DEL BARCO* 🚢\n\n`
        let hasErrors = false

        for (const file of files) {
            try {
                await import(path.resolve(pluginsDir, file))
                response += `✅ ${file} → **NAVEGABLE**\n`
            } catch (error) {
                hasErrors = true
                const stackLines = error.stack.split('\n')

                const errorLineMatch = stackLines[0].match(/:(\d+):\d+/) 
                const errorLine = errorLineMatch ? errorLineMatch[1] : '?'

                response += `💥 *${file}*\n   ↳ 🚨 *Error:* ${error.message.split('\n')[0]}\n   ↳ 📍 *Línea:* ${errorLine}\n\n`
            }
        }

        if (!hasErrors) {
            response += '\n🎌 **¡TODO PERFECTO, CAPITÁN! ¡EL BARCO ESTÁ LISTO PARA NAVEGAR! 🌊**'
        } else {
            response += '\n⚓ **¡ALERTA! ¡HAY FALLAS QUE REPARAR ANTES DE ZARPAR! 🔧**'
        }

        await conn.reply(m.chat, response, m)
        await m.react(hasErrors ? '⚠️' : '👑')
    } catch (err) {
        await m.react('🌪️') 
        await conn.reply(m.chat, `🔥 *¡TSUNAMI DE ERROR!*\n${err.message}`, m)
    }
}

handler.command = ['detectarsyntax', 'scan', 'detectar']
handler.help = ['detectarsyntax']
handler.tags = ['tools']
handler.rowner = true

export default handler