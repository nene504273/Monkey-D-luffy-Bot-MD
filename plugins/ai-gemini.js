import axios from 'axios'

// --- FUNCIONALIDAD BASE DE IA ---
// Definimos el endpoint de la API base
const BASE_API_URL = 'https://api-adonix.ultraplus.click/ai/geminiact?apikey=Adofreekey'

// Función para interactuar con la IA
async function geminiApi(q, logic) {
    try {
        // Construimos la URL: BASE_API_URL + el texto del usuario (q) + el rol (logic)
        const response = await axios.get(
            `${BASE_API_URL}&text=${encodeURIComponent(q)}&role=${encodeURIComponent(logic)}`
        )
        return response.data.message 
    } catch (error) {
        console.error('*[ ℹ️ ] Error en API de Gemini general:*', error)
        throw error
    }
}
// --- FIN FUNCIONALIDAD BASE DE IA ---


let handler = async (m, { conn, text, command }) => {
    
    // Si no hay texto después del comando, pide al usuario que pregunte algo
    if (!text) {
        return conn.reply(m.chat, `*[ 🤖 ] ¡Hola! Pregúntame algo usando *!${command}* [tu pregunta]*.`, m)
    }

    // Indica que el bot está "escribiendo"
    await conn.sendPresenceUpdate('composing', m.chat)

    try {
        // Prompt genérico para el asistente de IA, dándole un rol útil
        const genericPrompt = `Eres un asistente de IA llamado Gemini, creado por Google. Responde de forma útil, profesional y concisa. Responde lo siguiente:`
        
        // Llamada a la función de IA con el texto del usuario y el rol genérico.
        const response = await geminiApi(text, genericPrompt) 
        
        await conn.reply(m.chat, response, m)

    } catch (error) {
        console.error('*[ ℹ️ ] Error en Gemini general:', error)
        // Mensaje de error si la API falla
        await conn.reply(m.chat, '*[ ❌ ] ¡Error! No puedo contactar al servidor de la IA. Intenta más tarde.*', m)
    }
}

// Define los comandos para activar este plugin
handler.command = ['gemini', 'ia'] 
handler.help = ['gemini', 'ia']
handler.tags = ['tools']
handler.register = true 
export default handler