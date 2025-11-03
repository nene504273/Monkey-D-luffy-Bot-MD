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
  // Usamos la hora actual para el mensaje.
  let date = moment.tz('America/Caracas').format('DD/MM/YYYY')
  let time = moment.tz('America/Caracas').format('HH:mm:ss')
  
  // --- Guardar en DB (Valores originales) ---
  user.name = name.trim()
  user.age = age
  user.regTime = + new Date
  user.registered = true
  global.db.data.users[m.sender].money += 600
  global.db.data.users[m.sender].estrellas += 10
  global.db.data.users[m.sender].exp += 245
  global.db.data.users[m.sender].joincount += 5

  let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 6)
  m.react('🏴‍☠️')

  // --- MENSAJE DE REGISTRO ESTILO LUFFY (Pequeño y Llamativo) ---
  let regbot = `
🎉 ¡REGISTRO COMPLETO! 🎉

> ⛵️ ¡Bienvenido a la tripulación! 
> ¡Ahora eres un Pirata!

---------------------------------
🏴‍☠️ *DATOS DE PIRATA*
> • 👤 Nombre: ${name}
> • 🎂 Edad: ${age} años
> • 🗓️ Fecha: ${date}
> • ⏰ Hora: ${time}

💰 *RECOMPENSAS INICIALES*
> • 💸 600 Money
> • ⭐ 10 Estrellas
> • 🪙 245 Experiencia
> • 🗺️ 5 Joincount
---------------------------------
✨ Usa *.menu* y ¡Empecemos la aventura! ¡Wahh!
`
  // URL de la imagen de Luffy adjunta
  const imagenRegistroLuffy = 'https://files.catbox.moe/owqz49.jpg' 

  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: '✅ ¡PIRATA REGISTRADO! VAMOS AL ONE PIECE!',
        body: '¡Gracias por unirte a Monkey-D-Luffy-MD-bot!',
        // Usamos la URL de Luffy que coincide con tu imagen
        thumbnailUrl: imagenRegistroLuffy, 
        sourceUrl: 'https://github.com/nene504273/Monkey-D-luffy-Bot-MD',
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