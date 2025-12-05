import fetch from 'node-fetch'
var handler = async (m, { text, usedPrefix, command }) => {

// Usamos '📝' para el emoji de inicio y '❌' para el error
const msm = '❌' 
const rwait = '⏳' 

if (!text) return conn.reply(m.chat, `📝 Ingrese una petición para que Gemini lo responda.`, m)

try {
await m.react(rwait)
conn.sendPresenceUpdate('composing', m.chat)

// 🚨 Nueva API: Se utiliza https://api-adonix.ultraplus.click/api/gemini?text=
// 🚨 Nota: El endpoint /api/gemini?text= es una asunción.
var apii = await fetch(`https://api-adonix.ultraplus.click/api/gemini?text=${encodeURIComponent(text)}`)
var res = await apii.json()

// Comprobación de que la respuesta tenga el formato esperado y el mensaje.
// La clave 'message' se usa basándose en el ejemplo de respuesta que proporcionaste.
if (res.status === true && res.message) {
    await m.reply(res.message)
} else {
    // Si la API responde pero el formato es incorrecto, o status es falso
    await m.react('⚠️')
    await conn.reply(m.chat, `⚠️ La API de Ultra Plus devolvió un error interno o un formato inesperado.`, m)
}
} catch (error) {
// Este 'catch' maneja errores de red o si el JSON es inválido (la causa más probable del error en tu imagen)
await m.react(msm)
console.error(error)
await conn.reply(m.chat, `${msm} Gemini no puede responder a esa pregunta. (Error de conexión con la API).`, m)
}}

handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true
handler.rowner = true

export default handler