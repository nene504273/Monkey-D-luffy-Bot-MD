let handler = async (m, { conn, usedPrefix, command, isAdmin, isROwner }) => {
    if (!m.isGroup) {
        await m.react('❌')
        return m.reply('> ⓘ Este comando solo funciona en grupos.')
    }

    if (!isAdmin && !isROwner) {
        await m.react('🚫')
        return m.reply('> ⓘ Solo los administradores pueden usar este comando.')
    }

    let chat = global.db.data.chats[m.chat]
    let args = m.text.trim().split(' ').slice(1)
    let action = args[0]?.toLowerCase()

    if (!action || (action !== 'on' && action !== 'off')) {
        let status = chat.antiArabe ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'
        await m.react('ℹ️')
        return m.reply(`╭─「 🛡️ *ANTI-ARABE* 🛡️ 」
│ 
│ 📊 Estado actual: ${status}
│ 
│ 💡 *Uso del comando:*
│ ├ ${usedPrefix}antiarabe on
│ └ ${usedPrefix}antiarabe off
│ 
│ 📝 *Descripción:*
│ EXPULSA usuarios con números árabes
│ Detecta +20 países árabes
│ 
│ 🌍 *Países bloqueados:*
│ ├ Arabia Saudita 🇸🇦 (+966)
│ ├ Emiratos Árabes 🇦🇪 (+971)
│ ├ Qatar 🇶🇦 (+974), Kuwait 🇰🇼 (+965)
│ ├ Bahréin 🇧🇭 (+973), Omán 🇴🇲 (+968)
│ ├ Egipto 🇪🇬 (+20), Jordania 🇯🇴 (+962)
│ ├ Siria 🇸🇾, Irak 🇮🇶, Yemen 🇾🇪
│ └ +10 países más
╰─◉`.trim())
    }

    if (action === 'on') {
        if (chat.antiArabe) {
            await m.react('ℹ️')
            return m.reply('> ⓘ El *Anti-Arabe* ya está activado.')
        }
        chat.antiArabe = true
        await m.react('✅')
        m.reply(`╭─「 🛡️ *ANTI-ARABE ACTIVADO* 🛡️ 」
│ 
│ ✅ *Protección activada:*
│ ├ Números árabes detectados
│ ├ Usuarios serán EXPULSADOS
│ ├ +20 países árabes bloqueados
│ └ Mensajes eliminados
│ 
│ 🌍 *Cobertura completa:*
│ ├ Medio Oriente completo
│ ├ Norte de África
│ └ Península arábiga
│ 
│ ⚠️ *Advertencia:*
│ ├ Usuarios árabes serán expulsados
│ └ automáticamente al enviar mensajes
│ 
│ 🔒 *Grupo protegido*
╰─◉`.trim())

    } else if (action === 'off') {
        if (!chat.antiArabe) {
            await m.react('ℹ️')
            return m.reply('> ⓘ El *Anti-Arabe* ya está desactivado.')
        }
        chat.antiArabe = false
        await m.react('✅')
        m.reply(`╭─「 🛡️ *ANTI-ARABE DESACTIVADO* 🛡️ 」
│ 
│ ✅ *Protección desactivada:*
│ ├ Números árabes permitidos
│ ├ Sin expulsiones
│ └ Restricciones removidas
│ 
│ 🔓 *Grupo sin filtros árabes*
╰─◉`.trim())
    }
}

handler.help = ['antiarabe on', 'antiarabe off']
handler.tags = ['group']
handler.command = /^(antiarabe|antiarab)$/i
handler.group = true
handler.admin = true

export default handler