import ws from 'ws'

const handler = async (m, { conn, usedPrefix }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn.user.jid)])]
  
  if (global.conn?.user?.jid && !subBots.includes(global.conn.user.jid)) {
    subBots.push(global.conn.user.jid)
  }
  
  const chat = global.db.data.chats[m.chat]
  const mentionedJid = await m.mentionedJid
  const who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : false
  
  if (!who) return conn.reply(m.chat, `ꕤ No olvides mencionar a un Socket como nuestro Bot principal`, m, ctxErr)
  if (!subBots.includes(who)) return conn.reply(m.chat, `ꕤ El usuario mencionado no es un Socket`, m, ctxWarn)
  
  if (chat.primaryBot === who) {
    return conn.reply(m.chat, `ꕤ @${who.split`@`[0]} ya está configurado como Bot principal del grupo`, m, { mentions: [who] });
  }
  
  try {
    chat.primaryBot = who
    conn.reply(m.chat, `ꕤ Listo. Se ha establecido a @${who.split`@`[0]} como Bot primario de este grupo.\n> A partir de ahora todos los comandos serán ejecutados por @${who.split`@`[0]}`, m, { mentions: [who] })
  } catch (e) {
    conn.reply(m.chat, `ꕤ Se ha producido un problema. Usa ${usedPrefix}report para informarlo.\n\n${e.message}`, m, ctxErr)
  }
}

handler.help = ['setprimary']
handler.tags = ['grupo']
handler.command = ['setprimary']
handler.group = true
handler.admin = true

export default handler