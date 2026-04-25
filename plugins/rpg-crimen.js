let cooldowns = {}

let handler = async (m, { conn, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)
  let moneda = global.moneda || 'Berris 💰'
  let tiempoCooldown = 5 * 60 // 5 minutos

  // Inicializar usuario si no existe
  if (!users[senderId]) users[senderId] = { coin: 0, bank: 0 }

  // Verificar cooldown
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempoCooldown * 1000) {
    let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempoCooldown * 1000 - Date.now()) / 1000))
    return m.reply(`🏴‍☠️ *¡Los marines te están buscando!* Espera ⏱️ *${tiempoRestante}* antes de volver a delinquir.`)
  }

  // Solo grupos
  if (!m.isGroup) return m.reply('🍖 Este comando solo funciona en grupos, ¡así hay más víctimas!')

  // Obtener participantes del grupo
  let groupParticipants = []
  try {
    let metadata = await conn.groupMetadata(m.chat)
    groupParticipants = metadata.participants.map(p => p.id)
  } catch (e) {
    return m.reply('❌ No pude obtener la lista de miembros del grupo.')
  }

  // Filtrar víctimas potenciales (excluir al ladrón y a los que tengan menos de 1000 monedas)
  let possibleVictims = groupParticipants.filter(id => {
    if (id === senderId) return false
    if (!users[id]) users[id] = { coin: 0, bank: 0 }
    return (users[id].coin || 0) >= 1000
  })

  if (possibleVictims.length === 0) {
    return m.reply(`🍖 *No hay nadie con al menos 1000 ${moneda}* para robar... ¡Todos están más pobres que tú o son unos muertos de hambre!`)
  }

  // Elegir víctima aleatoria
  let victimId = possibleVictims[Math.floor(Math.random() * possibleVictims.length)]
  let victimCoin = users[victimId].coin
  let victimName = '@' + victimId.split('@')[0]

  // Montos
  let minGanancia = 1000
  let maxGanancia = 9000
  let minPerdida = 500
  let maxPerdida = 5000

  // Probabilidades: 40% éxito, 30% parcial, 30% captura
  let random = Math.random()
  let resultado

  if (random < 0.4) { // Éxito (robo completo)
    let cantidad = Math.floor(Math.random() * (maxGanancia - minGanancia + 1)) + minGanancia
    if (cantidad > victimCoin) cantidad = victimCoin

    if (cantidad <= 0) {
      // Esto no debería pasar porque la víctima tiene >=1000, pero por si acaso
      return m.reply(`😵 *${victimName}* escondió su dinero justo cuando ibas a robarlo... ¡Qué mala suerte!`)
    }

    users[senderId].coin += cantidad
    users[victimId].coin -= cantidad

    let mensajesExito = [
      `💰 *¡SAQUEO EXITOSO!* 💰\n\n🍖 *${senderName}* le ha robado *₱${cantidad} ${moneda}* a *${victimName}*.\n\n⚓ ¡El botín brilla! *+₱${cantidad}*`,
      `🏴‍☠️ *¡LADRONAZO!* 🏴‍☠️\n\n*${senderName}* se llevó *₱${cantidad} ${moneda}* de *${victimName}* sin que nadie lo viera.\n\n🦜 ¡Un verdadero pirata! *+₱${cantidad}*`,
      `⚡ *¡ROBO FULMINANTE!* ⚡\n\n*${senderName}* fue más rápido que la marina y obtuvo *₱${cantidad} ${moneda}* de *${victimName}*.\n\n💨 *+₱${cantidad}*`
    ]
    resultado = mensajesExito[Math.floor(Math.random() * mensajesExito.length)]

  } else if (random < 0.7) { // Robo parcial (solo la mitad de lo intentado)
    let cantidadBruta = Math.floor(Math.random() * (maxGanancia - minGanancia + 1)) + minGanancia
    let cantidad = Math.floor(cantidadBruta * 0.5)
    if (cantidad > victimCoin) cantidad = victimCoin

    if (cantidad <= 0) {
      return m.reply(`😅 *${victimName}* se dio cuenta a tiempo y solo lograste robarle el aire... *0 ${moneda}*.`)
    }

    users[senderId].coin += cantidad
    users[victimId].coin -= cantidad

    let mensajesParcial = [
      `🕵️‍♂️ *ROBO PARCIAL* 🕵️‍♂️\n\n*${senderName}* apenas logró llevarse *₱${cantidad} ${moneda}* de *${victimName}* antes de que llegaran los marines.\n\n⚠️ *+₱${cantidad}*`,
      `🏃 *¡CASI TE ATrapAN!* 🏃\n\n*${senderName}* huyó con *₱${cantidad} ${moneda}* de *${victimName}*, pero los marines están cerca.\n\n🌊 *+₱${cantidad}*`,
      `🔪 *ROBO CON SUERTE* 🔪\n\nAunque *${victimName}* opuso resistencia, *${senderName}* consiguió *₱${cantidad} ${moneda}*.\n\n🎭 *+₱${cantidad}*`
    ]
    resultado = mensajesParcial[Math.floor(Math.random() * mensajesParcial.length)]

  } else { // Capturado (pierde dinero)
    let perdida = Math.floor(Math.random() * (maxPerdida - minPerdida + 1)) + minPerdida
    let coinActual = users[senderId].coin
    if (perdida > coinActual) perdida = coinActual

    if (perdida <= 0) {
      return m.reply(`👮‍♂️ *¡Los marines te atraparon!* Pero como no tenías ni un *${moneda}*, te soltaron con una advertencia.\n\n🍖 Mejor consigue dinero antes de robar.`)
    }

    users[senderId].coin -= perdida

    let mensajesPerdida = [
      `👮‍♂️ *¡CAPTURADO POR LOS MARINES!* 👮‍♂️\n\n*${senderName}* fue atrapado y perdió *₱${perdida} ${moneda}*.\n\n😭 *¡Maldito Smoker!*`,
      `⚓ *¡TE PILLARON!* ⚓\n\n*${senderName}* terminó en la cárcel y tuvo que pagar *₱${perdida} ${moneda}* por su fianza.\n\n🔒 *-₱${perdida}*`,
      `🐊 *¡ATAQUE DE MARINES!* 🐊\n\n*${senderName}* no pudo escapar y perdió *₱${perdida} ${moneda}* en el forcejeo.\n\n💔 *-₱${perdida}*`
    ]
    resultado = mensajesPerdida[Math.floor(Math.random() * mensajesPerdida.length)]
  }

  // Enviar resultado con mención a la víctima (si aplica)
  await conn.sendMessage(m.chat, {
    text: resultado,
    mentions: [victimId, senderId].filter(id => id) // menciona a ambos por si acaso
  }, { quoted: m })

  // Guardar cambios
  global.db.write()
  cooldowns[senderId] = Date.now()
}

handler.help = ['crimen']
handler.tags = ['economy']
handler.command = ['crimen', 'crime']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
  let minutos = Math.floor(segundos / 60)
  let segs = segundos % 60
  return `${minutos} minuto${minutos !== 1 ? 's' : ''} y ${segs} segundo${segs !== 1 ? 's' : ''}`
}