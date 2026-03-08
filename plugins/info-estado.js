import ws from 'ws'

let handler = async (m, { conn, usedPrefix }) => {
  let _uptime = process.uptime() * 1000
  let totalreg = Object.keys(global.db.data.users).length
  let uptime = clockString(_uptime)
  let users = global.conns.filter(c => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))
  const totalUsers = users.length
  let old = performance.now()
  let neww = performance.now()
  let speed = neww - old

  let info = `🔥 *¡Hola, soy ${global.botname}!* 🔥\n`
  info += `👑 *Creador* ⇢ ɴ͡ᴇ͜ɴᴇ❀᭄☂️\n`
  info += `💫 *Prefijo* ⇢ [ ${usedPrefix} ]\n`
  info += `🚣‍♂️ *Versión* ⇢ ${global.vs}\n`
  info += `📊 *Chats Privados* ⇢ ${chats.length - groupsIn.length}\n`
  info += `📈 *Total De Chats* ⇢ ${chats.length}\n`
  info += `👥 *Usuarios* ⇢ ${totalreg}\n`
  info += `🌟 *Grupos* ⇢ ${groupsIn.length}\n`
  info += `⏰ *Actividad* ⇢ ${uptime}\n`
  info += `⚡️ *Velocidad* ⇢ ${(speed * 1000).toFixed(0) / 1000}\n`
  info += `🤖 *Sub-Bots Activos* ⇢ ${totalUsers || '0'}`

  await conn.sendMessage(m.chat, {
    image: { url: 'https://raw.githubusercontent.com/danielalejandrobasado-glitch/Yotsuba-MD-Premium/main/uploads/c7f472a445daffd7.jpg' },
    caption: info
  }, { quoted: m })
}

handler.help = ['estado']
handler.tags = ['info']
handler.command = ['estado', 'status', 'estate', 'state', 'stado', 'stats']

export default handler

function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}h ${minutes}m ${seconds}s`
}
