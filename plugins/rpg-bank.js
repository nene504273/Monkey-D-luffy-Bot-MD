import db from '../lib/database.js'

// Configuración
const moneda = '💰 Berries'
const emoji = '🏴‍☠️'
const newsletterJid = '120363420846835529@newsletter'
const newsletterName = '🏴‍☠️ luffy-gear5 🏴‍☠️'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
            ? m.quoted.sender 
            : m.sender

    if (who === conn.user.jid) {
        await m.react('❌')
        return conn.reply(m.chat, `${emoji} No puedes consultar el balance del bot.`, m)
    }

    if (!(who in global.db.data.users)) {
        await m.react('⚠️')
        return conn.reply(m.chat, `${emoji} El usuario no está registrado en mi base de datos.`, m)
    }

    const user = global.db.data.users[who]
    const userName = conn.getName(who)
    
    const coin = Number(user.coin) || 0
    const bank = Number(user.bank) || 0
    const total = coin + bank

    // Formato limpio con viñetas
    const mensaje = `📊 *ECONOMÍA PERSONAL*

• Usuario: *${userName}*
• Efectivo: *${coin} ${moneda}*
• Banco: *${bank} ${moneda}*
• Total: *${total} ${moneda}*

💡 *Consejo financiero:*
Protege tu dinero usando *${usedPrefix}deposit <cantidad>*`

    await m.react('💰')
    await conn.reply(m.chat, mensaje, m, { 
        contextInfo: { 
            mentionedJid: [who],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid,
                newsletterName: newsletterName,
                serverMessageId: -1
            }
        }
    })
}

handler.help = ['bal', 'balance', 'bank']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank'] 
handler.register = true 
handler.group = true 

export default handler