import fetch from 'node-fetch'

var handler = async (m, { text, usedPrefix, command }) => {
    // Verificamos si hay texto
    if (!text) return conn.reply(m.chat, `¡Hola! Por favor ingresa una petición.\n\n*Ejemplo:* ${usedPrefix + command} ¿Cómo estás?`, m)

    try {
        // Reacción de espera y estado "escribiendo"
        await m.react('⏳')
        conn.sendPresenceUpdate('composing', m.chat)

        // Definimos la lógica o el rol del bot
        let logic = "Eres un asistente amable y servicial." 
        
        // Construcción de la URL con los nuevos parámetros
        // Usamos encodeURIComponent para evitar errores con caracteres especiales
        let endpoint = `https://api-adonix.ultraplus.click/ai/geminiact?apikey=Adofreekey&text=${encodeURIComponent(text)}&role=${encodeURIComponent(logic)}`

        let apii = await fetch(endpoint)
        let res = await apii.json()

        // Verificamos si la API devolvió un resultado válido
        if (res.status && res.result) {
            await m.reply(res.result)
            await m.react('✅')
        } else {
            throw new Error('Respuesta de API inválida')
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        await conn.reply(m.chat, `Lo siento, Gemini no puede responder en este momento. Inténtalo más tarde.`, m)
    }
}

handler.command = ['gemini']
handler.help = ['gemini']
handler.tags = ['ai']
handler.group = true
handler.rowner = true

export default handler