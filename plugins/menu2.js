import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
  // Enlace directo de la imagen de Luffy
  let img = 'https://raw.githubusercontent.com/nevi-dev/nevi-dev/main/src/IMG-20260110-WA0014.jpg'
  
  let menu = `*┏━━━━━━━━━━━━━━━━┓*
*┃   🎧  MENÚ DE AUDIOS 2  🎧   ┃*
*┗━━━━━━━━━━━━━━━━┛*

> _Escribe la palabra para reproducir el audio_


💼 *【 TRABAJO 】*

• chamba

• chamba digital

• trabajar


🐉 *【 ANIME 】*

• goku / seria

• vegeta / moto

• dinero / donar

• onichan / yamete

• paimon / emergencia


😂 *【 HUMOR / XD 】*

• xd / xddd

• momazo / momo

• risa / yupi

• vete alv / terreneitor


🔥 *【 ESENCIA 】*

• esencia / tablos

• 7 palabras

• algo cambio


💬 *【 SOCIAL 】*

• bienvenido

• respondan

• grupo muerto / he vuelto


🔞 *【 PAJA 】*

• turbo paja / pajin

• mucha paja


⚠️ *【 OTROS 】*

• ya se donde vives

• arrepientete

• me vale verga / gay

• se fue la luz


_Disfruta de los audios_ 🏴‍☠️`

  await conn.sendMessage(m.chat, { 
    image: { url: img }, 
    caption: menu,
    mentions: [m.sender]
  }, { quoted: m })
}

// Configuración del plugin para que el bot NO diga que no existe
handler.help = ['menu2']
handler.tags = ['main']
handler.command = /^(menu2|audios2)$/i // Aquí se define el comando

export default handler