/* Codigo modificado por DuarteXV
 * github: https://github.com/Danielalejandrobasado-glitch */

import { exec } from 'child_process'

const frases = [
  '¡No me importa si muero, protegeré a mis nakama!',
  '¡Seré el Rey de los Piratas!',
  '¡No me rendiré, ese es mi estilo de lucha!',
  '¡Mis nakama me dan fuerza!',
  '¡No necesito motivos para salvar a mis amigos!',
  '¡El que lastime a mis nakama se las verá conmigo!',
  '¡Yo seré el más libre del mundo!',
]

const handler = async (m, { conn, text }) => {
  await m.react('🕓')
  const frase = frases[Math.floor(Math.random() * frases.length)]

  exec('git pull' + (text ? ' ' + text : ''), (err, stdout, stderr) => {
    if (err) {
      m.reply(`🏴‍☠️ *"${frase}"*\n\n☠️ Algo salió mal, intentando a la fuerza...`)

      exec('git reset --hard origin/main && git pull', (err2, stdout2, stderr2) => {
        if (err2) {
          m.reply(`🏴‍☠️ ☠️ No se pudo actualizar\n> Razón: ${err2.message}`)
          m.react('☠️')
          return
        }
        if (stderr2) console.warn(stderr2)
        m.reply(`🏴‍☠️ *"${frase}"*\n\n✅ Actualizado a la fuerza\n\n${stdout2}`)
        m.react('✅')
      })
      return
    }

    if (stderr) console.warn(stderr)

    if (stdout.includes('Already up to date.')) {
      m.reply(`🏴‍☠️ *"${frase}"*\n\n✅ Ya estaba actualizado, no había nada que cambiar`)
    } else {
      m.reply(`🏴‍☠️ *"${frase}"*\n\n✅ Actualización completada\n\n${stdout}`)
    }
    m.react('✅')
  })
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix', 'fixed']
handler.owner = true

export default handler
