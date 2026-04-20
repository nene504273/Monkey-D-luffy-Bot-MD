let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)

  let tiempo = 5 * 60
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000))
    m.reply(`${emoji3} Debes esperar *${tiempo2}* para usar *#slut* de nuevo.`)
    return
  }
  cooldowns[m.sender] = Date.now()

  let senderCoin = users[senderId].coin || 0
  let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  while (randomUserId === senderId) {
    randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  }
  let randomUserCoin = users[randomUserId].coin || 0
  let randomUserName = conn.getName(randomUserId)  // Nombre real del contacto

  // Rango de ganancia: 1000 - 9000
  let minAmount = 1000
  let maxAmount = 9000
  let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount

  let randomOption = Math.floor(Math.random() * 3)

  switch (randomOption) {
    case 0:
      users[senderId].coin += amountTaken
      users[randomUserId].coin -= amountTaken
      conn.sendMessage(m.chat, {
        text: `${emoji} ¡Se la chupaste a @${randomUserName} por *${amountTaken} ${moneda}* y lo dejaste bien seco!\n\nSe suman *+${amountTaken} ${moneda}* a ${senderName}.`,
        contextInfo: {
          mentionedJid: [randomUserId],
        }
      }, { quoted: m })
      break

    case 1:
      // Pérdida proporcional dentro del mismo rango
      let amountSubtracted = Math.min(
        Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount,
        senderCoin
      )
      users[senderId].coin -= amountSubtracted
      conn.reply(m.chat, `${emoji} No fuiste cuidadoso y le rompiste la verga a tu cliente, se te restaron *-${amountSubtracted} ${moneda}* a ${senderName}.`, m)
      break

    case 2:
      let smallAmountTaken = Math.min(
        Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount,
        randomUserCoin
      )
      users[senderId].coin += smallAmountTaken
      users[randomUserId].coin -= smallAmountTaken
      conn.sendMessage(m.chat, {
        text: `${emoji} Le diste unos sentones y te pagaron *${smallAmountTaken} ${moneda}* de @${randomUserName} y lo dejaste paralítico.\n\nSe suman *+${smallAmountTaken} ${moneda}* a ${senderName}.`,
        contextInfo: {
          mentionedJid: [randomUserId],
        }
      }, { quoted: m })
      break
  }

  global.db.write()
}

handler.tags = ['rpg']
handler.help = ['slut']
handler.command = ['slut', 'prostituirse']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
  let horas = Math.floor(segundos / 3600)
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}