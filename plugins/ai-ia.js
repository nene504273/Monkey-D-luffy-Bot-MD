import axios from 'axios'
import fetch from 'node-fetch' // Asegúrate de que node-fetch esté instalado (npm install node-fetch)

// Aquí deberías definir 'botname', 'etiqueta', 'vs', 'msm', 'emoji', 'emoji2', 'rwait', 'done', 'error'
// Como estos no están definidos en tu fragmento, los omito, pero asumo que existen en tu entorno.

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Variables de entorno o predefinidas (Asegúrate de que existan)
    const botname = 'MiBot' 
    const etiqueta = 'Creador'
    const vs = '1.0'
    const emoji = '🤖'
    const emoji2 = '🧠'
    const rwait = '⏳'
    const done = '✅'
    const error = '❌'
    const msm = 'MSM' // Mensaje de sistema

    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
    const username = `${conn.getName(m.sender)}`
    
    // El prompt base para darle personalidad a la IA
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`

    // --- LÓGICA PARA IMAGEN (Mantiene la API original: Luminai.my.id) ---
    if (isQuotedImage) {
        const q = m.quoted
        const img = await q.download?.()
        if (!img) {
            console.error(`${msm} Error: No image buffer available`)
            return conn.reply(m.chat, '✘ ChatGpT no pudo descargar la imagen.', m)
        }
        
        const content = `${emoji} ¿Qué se observa en la imagen?`
        try {
            const imageAnalysis = await fetchImageBuffer(content, img) // Usa Luminai.my.id
            const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres`
            const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
            
            // Reutilizamos la nueva función de chat para procesar la descripción
            const description = await anabot_chatgpt(prompt) // Usa anabot.my.id
            await conn.reply(m.chat, description, m)
        } catch (e) {
            console.error(e)
            await m.react(error)
            await conn.reply(m.chat, '✘ ChatGpT no pudo analizar la imagen. Intentando con la otra API falló.', m)
        }
    } 
    // --- LÓGICA PARA TEXTO (Usa la nueva API: anabot.my.id) ---
    else {
        if (!text) { 
            return conn.reply(m.chat, `${emoji} Ingrese una petición para que el ChatGpT lo responda.`, m)
        }
        
        await m.react(rwait)
        try {
            const { key } = await conn.sendMessage(m.chat, {text: `${emoji2} ChatGPT está procesando tu petición, espera unos segundos.`}, {quoted: m})
            
            const query = text
            const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
            
            // 💡 LLAMADA A LA NUEVA FUNCIÓN CON LA API DE anabot.my.id
            const response = await anabot_chatgpt(prompt) 
            
            await conn.sendMessage(m.chat, {text: response, edit: key})
            await m.react(done)
        } catch (e) {
            console.error(e)
            await m.react(error)
            await conn.reply(m.chat, '✘ ChatGpT no puede responder a esa pregunta.', m)
        }
    }
}

handler.help = ['ia', 'chatgpt']
handler.tags = ['ai']
handler.register = true
handler.command = ['ia', 'chatgpt', 'luminai']
handler.group = true

export default handler

// Función de utilidad
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// -----------------------------------------------------
// --- FUNCIONES DE API ---

// 1. Función para la interacción de CHAT (Usando anabot.my.id)
async function anabot_chatgpt(prompt) {
    try {
        // La URL de la nueva API, que incluye el prompt y la apikey
        const apiUrl = `https://anabot.my.id/api/ai/bingchat?prompt=${encodeURIComponent(prompt)}&apikey=freeApikey`
        
        const response = await fetch(apiUrl)
        const data = await response.json()

        // **IMPORTANTE:** Asumimos que la respuesta de la IA está en 'data.result'
        if (data.status && data.result) {
            return data.result
        } else {
            // Si la estructura no es la esperada o hay un mensaje de error
            return data.msg || data.message || 'Error desconocido de la API de anabot.my.id'
        }
        
    } catch (error) {
        console.error(`Error al obtener la respuesta de anabot.my.id:`, error)
        throw new Error('Error en la conexión con la API de BingChat.')
    }
}

// 2. Función para el análisis de IMAGEN (Mantiene la API original: Luminai.my.id)
// Esta función usa AXIOS, no fetch.
async function fetchImageBuffer(content, imageBuffer) {
    try {
        const response = await axios.post('https://Luminai.my.id', {
            content: content,
            imageBuffer: imageBuffer
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return response.data
    } catch (error) {
        console.error('Error al analizar la imagen:', error)
        throw error
    }
}