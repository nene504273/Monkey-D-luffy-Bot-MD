import { createHash } from 'crypto'
import moment from 'moment-timezone' // Asegúrate de tener 'moment-timezone' instalado
// Si no quieres instalar moment-timezone, puedes usar new Date() directamente para la hora

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

  // --- Zona Horaria para el Registro ---
  let date = moment.tz('America/Caracas').format('DD/MM/YYYY')
  let time = moment.tz('America/Caracas').format('HH:mm:ss')

  // --- VALORES DE RECOMPENSA (Ajustados al formato de la captura) ---
  const REWARD_ESTRELLAS = 15
  const REWARD_MONEY = 5
  const REWARD_EXP = 245
  const REWARD_TOKENS = 12

  // --- Guardar en DB ---
  user.name = name.trim()
  user.age = age
  user.regTime = + new Date
  user.registered = true
  global.db.data.users[m.sender].money += REWARD_MONEY
  global.db.data.users[m.sender].estrellas += REWARD_ESTRELLAS
  global.db.data.users[m.sender].exp += REWARD_EXP
  // Asumo que Joincount no se usa en este formato, pero si Joincount = Tokens:
  // global.db.data.users[m.sender].joincount += REWARD_TOKENS

  let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 6)
  m.react('✅')

  // --- MENSAJE DE REGISTRO CON EL FORMATO EXACTO DE LA CAPTURA ---
  let regbot = `
*『 ✅ REGISTRADO(A) ✅ 』*

👤 *R E G I S T R O* 👤

┍*「👤」 Nombre: ${name}*
┕*「🌟」 Edad: ${age} años*

🎁 *R E C O M P E N S A S :*
*• ${REWARD_ESTRELLAS} Estrellas ⭐*
*• ${REWARD_MONEY} Monedas 🪙*
*• ${REWARD_EXP} Exp 🪙*
*• ${REWARD_TOKENS} Tokens 💰*

👑 _*Monkey D Luffy*_ 👑
                                *IA ⌚ ${time}*


`

  // URL de la imagen de Luffy adjunta (MANTENIDA)
  const imagenRegistroLuffy = 'https://files.catbox.moe/owqz49.jpg' 

  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: 'Monkey D Luffy Bot', // <-- CAMBIO DE TEXTO
        body: 'Registro exitoso por Monkey D Luffy', // <-- CAMBIO DE TEXTO
        // Usamos la URL de Luffy que coincide con tu imagen (NO MODIFICADA)
        thumbnailUrl: imagenRegistroLuffy, 
        sourceUrl: 'https://github.com/nene504273/Monkey-D-luffy-Bot-MD', // Se mantiene la URL de origen
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler