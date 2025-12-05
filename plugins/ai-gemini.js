import fetch from 'node-fetch'
var handler = async (m, { text,  usedPrefix, command }) => {
// Variables de emojis
const msm = '❌' 
const rwait = '⏳' 

if (!text) return conn.reply(m.chat, `📝 Ingrese una petición para que Gemini lo responda.`, m)

try {
await m.react(rwait)
conn.sendPresenceUpdate('composing', m.chat)

// 🌟 Revertido a la API original de Starlights Team que utiliza 'result'
var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(text)}`)
var res = await apii.json()

// La API original usa la clave 'result'
if (res.result) {
    await m.reply(res.result)
} else {
    // Manejo si la respuesta es válida pero no tiene el resultado
    await m.react('⚠️')
    await conn.reply(m.chat, `⚠️ La API no devolvió una respuesta válida.`, m)
}
} catch (error) {
await m.react(msm)
console.error(error)
await conn.reply(m.chat, `${msm} Gemini no puede responder a esa pregunta. (Error de conexión).`, m)
}}

handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true
handler.rowner = true

export default handler