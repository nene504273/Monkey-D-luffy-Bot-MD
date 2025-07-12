import db from '../lib/database.js'

let handler = async (m, { args }) => {
let user = global.db.data.users[m.sender]
if (!args[0]) return m.reply(`Ingresa la cantidad de *Berris 💰* que deseas depositar en tu tesoro.`)
if (args[0] == 'all') {
let count = parseInt(user.bank)
user.bank -= count * 1
user.coin += count * 1
await m.reply(`${emoji} Retiraste *${count} ${moneda}* del banco, ahora podras usarlo pero tambien podran robartelo.`)
return !0
}
if (!Number(args[0])) return m.reply(`${emoji2} Debes retirar una cantidad válida.\n > Ejemplo 1 » *#retirar 25000*\n> Ejemplo 2 » *#retirar all*`)
let count = parseInt(args[0])
if (!user.bank) return m.reply(`${emoji2} No tienes suficientes *${moneda}* en el Banco.`)
if (user.bank < count) return m.reply(`${emoji2} Solo tienes *${user.bank} ${moneda}* en el Banco.`)
user.bank -= count * 1
user.coin += count * 1
await m.reply(`Retiraste *${count} ${moneda}* del banco, ahora podras usarlo pero tambien podran robartelo.`)}

handler.help = ['retirar']
handler.tags = ['rpg']
handler.command = ['withdraw', 'retirar', 'with']
handler.group = true
handler.register = true

export default handler