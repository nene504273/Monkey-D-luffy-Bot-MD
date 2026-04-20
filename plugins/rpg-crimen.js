let cooldowns = {}

let handler = async (m, { conn, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)
  let moneda = global.moneda || 'Berris 💰'

  // Asegurar que el usuario exista
  if (!users[senderId]) users[senderId] = { coin: 0, bank: 0 }

  let tiempo = 5 * 60
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
    return m.reply(`🏴‍☠️ ¡Los marines te buscan! Espera ⏱️ *${tiempo2}* para volver a intentarlo.`)
  }
  cooldowns[senderId] = Date.now()

  let senderCoin = users[senderId].coin || 0

  // Obtener participantes del grupo (solo si es grupo)
  let groupParticipants = []
  if (m.isGroup) {
    try {
      let metadata = await conn.groupMetadata(m.chat)
      groupParticipants = metadata.participants.map(p => p.id)
    } catch (e) {
      return m.reply('❌ No pude obtener la lista de miembros del grupo.')
    }
  } else {
    return m.reply('🍖 ¡Este comando solo funciona en grupos!')
  }

  // Filtrar posibles víctimas (excluir al ladrón)
  let possibleVictims = groupParticipants.filter(id => id !== senderId)
  if (possibleVictims.length === 0) {
    return m.reply('🍖 No hay nadie más en el grupo para robar... ¡Qué solitario!')
  }

  // Elegir víctima aleatoria
  let randomUserId = possibleVictims[Math.floor(Math.random() * possibleVictims.length)]
  if (!users[randomUserId]) users[randomUserId] = { coin: 0, bank: 0 }

  let randomUserCoin = users[randomUserId].coin || 0
  let victimName = '@' + randomUserId.split('@')[0] // Formato @numero sin dominio

  let minAmount = 1000
  let maxAmount = 9000
  let randomOption = Math.floor(Math.random() * 3)

  switch (randomOption) {
    case 0: {
      let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
      if (randomUserCoin < amountTaken) amountTaken = randomUserCoin
      if (amountTaken <= 0) {
        return m.reply(`🏴‍☠️ *${victimName}* no tiene ni un *₱Berry*... ¡Pobre diablo! 😭`)
      }
      users[senderId].coin += amountTaken
      users[randomUserId].coin -= amountTaken
      await conn.sendMessage(m.chat, {
        text: `💰 *¡SAQUEO EXITOSO!* 💰\n\n🍖 *${senderName}* ha robado *₱${amountTaken} ${moneda}* a *${victimName}*.\n\n⚓ ¡El botín aumenta! *+₱${amountTaken}*`,
        mentions: [randomUserId]
      }, { quoted: m })
      break
    }
    case 1: {
      let amountSubtracted = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
      if (senderCoin < amountSubtracted) amountSubtracted = senderCoin
      if (amountSubtracted <= 0) {
        return m.reply(`👮‍♂️ ¡Los marines te atraparon! Pero como no tenías *₱${moneda}*, te dejaron ir con una advertencia.`)
      }
      users[senderId].coin -= amountSubtracted
      await conn.sendMessage(m.chat, {
        text: `👮‍♂️ *¡CAPTURADO POR LOS MARINES!* 👮‍♂️\n\n🍖 *${senderName}* fue atrapado y perdió *₱${amountSubtracted} ${moneda}*.\n\n😭 ¡Maldito Smoker!`,
        mentions: [senderId]
      }, { quoted: m })
      break
    }
    case 2: {
      let smallAmountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
      smallAmountTaken = Math.floor(smallAmountTaken * 0.5)
      if (randomUserCoin < smallAmountTaken) smallAmountTaken = randomUserCoin
      if (smallAmountTaken <= 0) {
        return m.reply(`😵 *${victimName}* se dio cuenta y no tenía suficiente *₱${moneda}*. ¡Fallaste!`)
      }
      users[senderId].coin += smallAmountTaken
      users[randomUserId].coin -= smallAmountTaken
      await conn.sendMessage(m.chat, {
        text: `🕵️‍♂️ *ROBO PARCIAL* 🕵️‍♂️\n\n🍖 *${senderName}* logró tomar *₱${smallAmountTaken} ${moneda}* de *${victimName}* antes de que llegaran los refuerzos.\n\n⚡ ¡Rápido pero con botín! *+₱${smallAmountTaken}*`,
        mentions: [randomUserId]
      }, { quoted: m })
      break
    }
  }

  global.db.write()
}

handler.tags = ['economy']
handler.help = ['crimen']
handler.command = ['crimen', 'crime']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
  let horas = Math.floor(segundos / 3600)
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}