import ws from 'ws'

const handler = async (m, { conn, usedPrefix }) => {
  // 1. Obtener lista de Sub-bots activos
  const subBots = [...new Set([...global.conns
    .filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)
    .map((conn) => conn.user.jid)])]

  // Agregar el bot principal si no está en la lista
  if (global.conn?.user?.jid && !subBots.includes(global.conn.user.jid)) {
    subBots.push(global.conn.user.jid)
  }

  // 2. Definir variables
  const chat = global.db.data.chats[m.chat]
  const mentionedJid = m.mentionedJid || []
  const who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? m.quoted.sender : false

  // 3. Validaciones
  if (!who) {
    return conn.reply(m.chat, '🍖 *¡GOMU GOMU NO... ERROR!*\n\nDebes mencionar a un sub bot para ponerlo como *principal*.', m)
  }

  if (!subBots.includes(who)) {
    return conn.reply(m.chat, '⚠️ El usuario que mencionaste no es un *sub bot válido* o no está activo en este momento.', m)
  }

  if (chat.primaryBot === who) {
    return conn.reply(m.chat, `✅ @${who.split('@')[0]} *ya es el bot principal del grupo*.`, m, { mentions: [who] })
  }

  // 4. Ejecución del cambio
  try {
    chat.primaryBot = who
    
    await conn.reply(m.chat, `🎩 *¡Listo, nakama!* Ahora @${who.split('@')[0]} será el *Bot Principal* en este grupo.\n\n👉 Todos los comandos serán ejecutados por ese bot.`, m, { mentions: [who] })
    await m.react('✅')
    
  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, `❗ *Hubo un error al configurar el bot principal.*\nUsa *${usedPrefix}report* para informar el problema.\n\nError: ${e.message}`, m)
  }
}

handler.help = ['setprimary']
handler.tags = ['grupo']
handler.command = /^setprimary|principal$/i // He agregado un alias 'principal'
handler.group = true
handler.admin = true

export default handler