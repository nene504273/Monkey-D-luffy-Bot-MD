```js
import ws from 'ws'

let handler = async (m, { conn, usedPrefix, isRowner }) => {
  let _uptime = process.uptime() * 1000
  let totalreg = Object.keys(global.db.data.users).length
  let uptime = clockString(_uptime)
  let users = [...new Set([...global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])]
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))
  const totalUsers = users.length
  let old = performance.now()
  let neww = performance.now()
  let speed = neww - old

  let info = `ꕥ Información - ⛧ＭＯＮＫＥＹ ᴅ ʟ ᴜ ꜰ ꜰ ʏ - ᴍᴅ ☠️❁\n`
  info += `♡⃕  𓆩ᶻz  Creador ⇢ 𓆩 NENE 🧃⸼\n`
  info += `⚝ Prefijo ⇢ [ usedPrefix ]`
  info += `𓂃 Versión ⇢{vs}\n`
  info += `📁 Chats Privados ⇢ chats.length - groupsIn.length`
  info += `🧾 Total De Chats ⇢{chats.length}\n`
  info += `👤 Usuarios ⇢ totalreg`
  info += `👥 Grupos ⇢{groupsIn.length}\n`
  info += `🕐 Actividad ⇢ ${uptime}\n`
info += `⚡ Velocidad ⇢{(speed * 1000).toFixed(0) / 1000}\n`
  info += `🤖 Sub-Bots Activos ⇢ totalUsers || '0'`

  await conn.sendFile(
    m.chat,
    'https://files.catbox.moe/uw0lmt.jpg',
    'estado.jpg',
    info,
    m
  )

handler.help = ['estado']
handler.tags = ['info']
handler.command = ['estado', 'status', 'estate', 'state', 'stado', 'stats']
handler.register = true
export default handler

function clockString(ms) 
  let seconds = Math.floor((ms / 1000) 
  let minutes = Math.floor((ms / (1000 * 60)) 
  let hours = Math.floor((ms / (1000 * 60 * 60)) 
  return `{hours}h minutesm{seconds}s`
}
```