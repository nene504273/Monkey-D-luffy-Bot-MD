import { createHash } from 'crypto'
import moment from 'moment-timezone' 

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text }) {
  let user = global.db.data.users[m.sender]
  let name2 = conn.getName(m.sender)

  // --- Validación y Errores ---
  if (user.registered === true) throw `*⚔️ ¡Ya eres un Pirata!* Para empezar de nuevo, usa: *#unreg*`
  if (!Reg.test(text)) throw `*🏴‍☠️ ¡Error de formato!* Necesitas un Nombre y Edad.\n\nUsa: *#reg Nombre.edad*\n\nEjemplo:\n#reg ${name2}.18`

  let [_, name, splitter, age] = text.match(Reg)
  if (!name) throw 'Nombre de Pirata *obligatorio*.'
  if (!age) throw '¡La Edad es *obligatoria*! ¿Cuántos años tienes?'
  if (name.length >= 30) throw '¡Ese nombre es muy largo! Máximo *30 caracteres*.'

  age = parseInt(age)
  if (age > 100) throw '*¡Wow, eres una leyenda!* (Edad máxima 100)'
  if (age < 5) throw '*¡Oye, eres muy joven para esto!* (Edad mínima 5)'

  // --- Zona Horaria ---
  let time = moment.tz('America/Caracas').format('HH:mm:ss')

  // --- Valores de Recompensa ---
  const REWARD_ESTRELLAS = 15
  const REWARD_MONEY = 5
  const REWARD_EXP = 245
  const REWARD_TOKENS = 12

  // --- Guardar en DB ---
  user.name = name.trim()
  user.age = age
  user.regTime = + new Date()
  user.registered = true

  // Aplicar recompensas
  global.db.data.users[m.sender].money += REWARD_MONEY
  global.db.data.users[m.sender].estrellas += REWARD_ESTRELLAS
  global.db.data.users[m.sender].exp += REWARD_EXP
  global.db.data.users[m.sender].tokens += REWARD_TOKENS   // ✅ tokens añadidos

  // --- Mensaje de Registro con imagen + caption (compatible WhatsApp oficial) ---
  const imagenRegistroLuffy = 'https://raw.githubusercontent.com/danielalejandrobasado-glitch/Yotsuba-MD-Premium/main/uploads/f3dec04bc1df5762.jpg'

  let caption = `
*『 ✅ REGISTRADO(A) ✅ 』*

👤 *R E G I S T R O* 👤

┍「👤」 Nombre: ${name}
┕「🌟」 Edad: ${age} años

🎁 *R E C O M P E N S A S :*
• ${REWARD_ESTRELLAS} Estrellas ⭐
• ${REWARD_MONEY} Monedas 🪙
• ${REWARD_EXP} Exp 🪙
• ${REWARD_TOKENS} Tokens 💰

👑 *Monkey D Luffy* 👑
     IA ⌚ ${time}
`

  await conn.sendMessage(m.chat, {
    image: { url: imagenRegistroLuffy },
    caption: caption,
    mentions: [m.sender]
  }, { quoted: m })

  // Reacción después de todo correcto
  await m.react('✅')
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler