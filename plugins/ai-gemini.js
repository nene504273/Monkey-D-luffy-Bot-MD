import fetch from 'node-fetch'
var handler = async (m, { text, usedPrefix, command }) => {
// Variables de emojis
const msm = '❌' 
const rwait = '⏳' 
// 🔑 CLAVE DE LA API PROPORCIONADA POR EL USUARIO
const apiKey = 'nene-Sempai'; 

if (!text) return conn.reply(m.chat, `📝 Ingrese una petición para que Gemini lo responda.`, m)

try {
    await m.react(rwait)
    conn.sendPresenceUpdate('composing', m.chat)

    // 🔗 URL de la API con la clave incluida como parámetro 'apikey'
    // Se usa la asunción del endpoint: /api/gemini
    var url = `https://api-adonix.ultraplus.click/api/gemini?text=${encodeURIComponent(text)}&apikey=${apiKey}`;
    
    var apii = await fetch(url)
    var res = await apii.json()

    // 🚨 Esto imprimirá la respuesta completa de la API en la consola de tu bot
    console.log('Respuesta de la API (con clave):', res); 

    // Intentamos extraer la respuesta buscando las claves más comunes:
    // 'message' (basado en tu ejemplo inicial), 'result' (común), 'response'
    let responseText = res.message || res.result || res.response;

    if (responseText) {
        await m.reply(responseText)
    } else {
        // Si la API responde pero el formato es incorrecto (no tiene 'message' ni 'result')
        await m.react('⚠️')
        // Intenta mostrar cualquier mensaje de error devuelto por la API
        let apiError = res.error || res.status_message || (res.status === false ? "API status false" : "Formato de respuesta inesperado.");
        await conn.reply(m.chat, `⚠️ La API no devolvió una respuesta válida. Mensaje API: ${apiError}`, m)
    }
} catch (error) {
    await m.react(msm)
    console.error("Error de Fetch o JSON:", error)
    await conn.reply(m.chat, `${msm} Error de conexión con la API o respuesta JSON inválida.`, m)
}}

handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true
handler.rowner = true

export default handler