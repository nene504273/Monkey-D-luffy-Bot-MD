/* Código creado por Félix ofc 
Guthub: https://github.com/FELIX-OFC
--> Si te vas a robar el código y no dejaras créditos entonces pagame v:
*/

import ws from 'ws'

const handler = async (m, { conn }) => {
const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn.user.jid)])]
if (global.conn?.user?.jid && !subBots.includes(global.conn.user.jid)) {
subBots.push(global.conn.user.jid)
}
const chat = global.db.data.chats[m.chat]
const mentionedJid = await m.mentionedJid
const who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : false
if (!who) return conn.reply(m.chat, `*☆ Mensiona a uno de los Bots para hacerlo bot primario.`, m)
if (!subBots.includes(who)) return conn.reply(m.chat, `*☆ Esta persona no es un bot vinculado a Monkey d luffy.*`, m)
if (chat.primaryBot === who) {
return conn.reply(m.chat, `*☆ Está persona ya era bot primario.*`, m, { mentions: [who] });
}
try {
chat.primaryBot = who
conn.reply(m.chat, ` 🏴‍☠️ Se a puesto a @${who.split`@`[0]} como principal.\n> -> Ahora todos los comandos serán ejecutados solo por el.`, m, { mentions: [who] })
} catch (e) {
conn.reply(m.chat, `☆ Error al poner ese bot como principa.`, m)
}}

handler.help = ['setprimary']
handler.tags = ['grupo']
handler.command = ['setprimary']
handler.group = true
handler.admin = true

export default handler