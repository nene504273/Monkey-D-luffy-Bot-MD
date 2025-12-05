import fetch from 'node-fetch'
var handler = async (m, { text, usedPrefix, command }) => {
// El objeto de la API que proporcionaste parece ser un ejemplo de respuesta
// o una descripción de una URL, no la URL real de un endpoint de Gemini.
// Asumiendo que la nueva API tiene un endpoint similar para el texto.
// Se usará https://api-adonix.ultraplus.click/api/gemini?text=${text}
// ajustando la clave 'message' en la respuesta a 'result' para que sea compatible.

if (!text) return conn.reply(m.chat, `📝 Ingrese una petición para que Gemini lo responda.`, m)
try {
await m.react('⏳') // Usando un emoji de espera
conn.sendPresenceUpdate('composing', m.chat)

// Reemplazo de la URL de la API anterior por la nueva
// y asumiendo que el endpoint es /api/gemini?text=
var apii = await fetch(`https://api-adonix.ultraplus.click/api/gemini?text=${encodeURIComponent(text)}`)
var res = await apii.json()

// Comprobación de que la respuesta tenga el formato esperado y un mensaje
if (res.status && res.message) {
    // La respuesta usa 'message', se adapta a 'result' para la lógica original
    await m.reply(res.message)
} else {
    // Manejo de un caso donde la respuesta no es la esperada
    await m.react('⚠️')
    await conn.reply(m.chat, `❗ La respuesta de la API no es válida o está incompleta.`, m)
}
} catch (error) {
await m.react('❌')
console.error(error)
await conn.reply(m.chat, `❌ Gemini no puede responder a esa pregunta.`, m)
}}

handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true
handler.rowner = true

export default handler