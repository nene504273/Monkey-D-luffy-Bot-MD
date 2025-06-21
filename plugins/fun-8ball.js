let handler = async (m, { args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🔮 *Usa el comando así:*\n${usedPrefix}${command} ¿seré millonario?\n\nHaz una pregunta y te responderé con sí o no.`)

  const pregunta = text.toLowerCase()
  let respuesta = Math.random() < 0.5 ? 'No' : 'Sí'

  if (pregunta.includes('gay') || pregunta.includes('homo') || pregunta.includes('bisexual')) {
    respuesta = 'Sí'
  } else if (pregunta.includes('hetero') || pregunta.includes('heterosexual')) {
    respuesta = 'No'
  }

  await m.reply(`🎱 *Pregunta:* ${text}\n🔮 *Respuesta:* ${respuesta}`)
}

handler.help = ['8ball <pregunta>']
handler.tags = ['fun']
handler.command = ['8ball']

export default handler
