import fetch from 'node-fetch'
var handler = async (m, { text,  usedPrefix, command }) => {
// Variables de emojis
const msm = '❌' 
const rwait = '⏳' 

if (!text) return conn.reply(m.chat, `📝 Ingrese una petición para que Gemini lo responda.`, m)

try {
await m.react(rwait)
conn.sendPresenceUpdate('composing', m.chat)

// 🌟 API de Starlights Team (original)
var apii = await fetch(`https://apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(text)}`)
var res = await apii.json()

// 🚨 Esto imprimirá la respuesta completa de la API en la consola de tu bot
// Cuando el bot falle, mira esta salida para ver qué clave tiene la respuesta real.
console.log('Respuesta de la API:', res); 

// La API original usa la clave 'result'
if (res.result) {
    await m.reply(res.result)
} else {
    // Manejo si la respuesta es válida pero no tiene el resultado esperado
    await m.react('⚠️')
    // Imprime en el chat lo que la API pudo haber enviado en otras claves comunes (como 'message' o 'error')
    let errorMessage = res.error || res.message || "La API no devolvió una respuesta válida.";
    await conn.reply(m.chat, `⚠️ ${errorMessage}`, m)
}
} catch (error) {
await m.react(msm)
console.error("Error completo:", error)
await conn.reply(m.chat, `${msm} Error de conexión con la API o respuesta JSON inválida.`, m)
}}

handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true
handler.rowner = true

export default handler