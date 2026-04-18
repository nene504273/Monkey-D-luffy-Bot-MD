import db from '../lib/database.js'

// Configuración personalizable
const moneda = '⭐' // Cambia por tu moneda (ej: 🪙, 💎)
const emoji = '✨'  // Emoji por defecto si no está definido globalmente
const newsletterJid = '120363420846835529@newsletter'
const newsletterName = '🏴‍☠️ luffy-gear5 🏴‍☠️'
const packname = '🏴‍☠️ LUFFY-Bot  🏴‍☠️'

let handler = async (m, { conn, usedPrefix }) => {
    // Determinar el usuario objetivo
    let who = m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
            ? m.quoted.sender 
            : m.sender

    // Evitar consultar al bot mismo
    if (who === conn.user.jid) {
        await m.react('❌')
        return conn.reply(m.chat, `${emoji} No puedes consultar el balance del bot.`, m)
    }

    // Verificar existencia en la base de datos
    if (!(who in global.db.data.users)) {
        await m.react('⚠️')
        return conn.reply(m.chat, `${emoji} El usuario no está registrado en mi base de datos.`, m)
    }

    const user = global.db.data.users[who]
    const userName = conn.getName(who)
    
    // Calcular valores (asegurar números válidos)
    const coin = Number(user.coin) || 0
    const bank = Number(user.bank) || 0
    const total = coin + bank

    // Construir mensaje con estilo visual atractivo
    const mensaje = `
╭─── ◈ *ECONOMÍA PERSONAL* ◈ ───╮
│
│  👤 *Usuario:* ${userName}
│  
│  💰 *Efectivo:* ${coin} ${moneda}
│  🏦 *Banco:* ${bank} ${moneda}
│  📊 *Total:* ${total} ${moneda}
│
├─────────────────────────────
│  💡 *Consejo financiero:*
│  Protege tu dinero usando
│  *${usedPrefix}deposit <cantidad>*
│
╰─────────────────────────────

${emoji} ¡Sigue creciendo con ${packname}!

📢 *Únete a nuestro canal oficial:*
${newsletterName}
${newsletterJid}
`.trim()

    // Enviar respuesta con reacción positiva
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