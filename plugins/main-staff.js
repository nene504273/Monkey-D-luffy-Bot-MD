let handler = async (m, { conn, command, usedPrefix }) => {
let img = 'https://files.catbox.moe/qbyzje.jpg'
let staff = `🏆 *EQUIPO DE CREADORES* 🏆


✰ Propietario: Nene Mental

✰ Bot: Monket D Luffy

✰ Versión: ${vs}

✰ *Libreria* » ${libreria} ${baileys}

➪ GitHub: https://github.com/nene504273

𝐂 𝐎 𝐋 𝐀 𝐁 𝐎 𝐑 𝐀 𝐃 𝐎 𝐑 𝐄 𝐒

✰ Nevi: soporte y desarrollador. 
➪ Github » https://github.com/nevi-dev

✰ Dioneibi: Desarrollador y ayudante.
➪ Github » https://github.com/Dioneibi-rip

> Monkey D Luffy Bot
`
await conn.sendFile(m.chat, img, 'yuki.jpg', staff.trim(), m)
}
  
handler.help = ['staff']
handler.command = ['colaboradores', 'staff']
handler.register = true
handler.tags = ['main']

export default handler
