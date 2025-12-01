import axios from 'axios'
import fetch from 'node-fetch' // Asegúrate de tener 'node-fetch' instalado (npm install node-fetch)

// ====================================================================
// --- CONSTANTES Y VARIABLES DEL ENTORNO DEL BOT ---
// (¡DEBES ASEGURARTE DE QUE ESTAS CONSTANTES ESTÉN DEFINIDAS!)

// Ejemplo de definición de constantes:
const botname = 'LuminAI' 
const etiqueta = 'El Creador'
const vs = '2.1'
const emoji = '🤖'
const emoji2 = '🧠'
const rwait = '⏳'
const done = '✅'
const error = '❌'
const msm = '[BOT-LOG]' 

// ====================================================================

let handler = async (m, { conn, usedPrefix, command, text }) => {
    
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
    const username = `${conn.getName(m.sender)}`
    
    // El prompt base para darle personalidad a la IA
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`

    // --- LÓGICA PARA IMAGEN (Mantiene la API original: Luminai.my.id para el análisis) ---
    if (isQuotedImage) {
        const q = m.quoted
        const img = await q.download?.()
        if (!img) {
            console.error(`${msm} Error: No image buffer available`)
            return conn.reply(m.chat, '✘ ChatGpT no pudo descargar la imagen.', m)
        }
        
        const content = `${emoji} ¿Qué se observa en la imagen?`
        try {
            // Paso 1: Analizar la imagen con la API original
            const imageAnalysis = await fetchImageBuffer(content, img) 
            
            // Paso 2: Crear el prompt con la descripción del análisis
            const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres`
            const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
            
            // Paso 3: Obtener la respuesta final de chat con la nueva API
            const description = await anabot_chatgpt(prompt) 
            await conn.reply(m.chat, description, m)
        } catch (e) {
            console.error(`${msm} Error en el análisis de imagen/chat:`, e)
            await m.react(error)
            await conn.reply(m.chat, '✘ ChatGpT no pudo analizar la imagen.', m)
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
            
            // LLAMADA A LA FUNCIÓN CHAT CON LA API DE anabot.my.id
            const response = await anabot_chatgpt(prompt) 
            
            await conn.sendMessage(m.chat, {text: response, edit: key})
            await m.react(done)
        } catch (e) {
            console.error(`${msm} Error en la respuesta de texto:`, e)
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

// ====================================================================
// --- FUNCIONES DE API ---

// 1. Función para la interacción de CHAT (Usando anabot.my.id)
// Esta versión es más flexible para manejar diferentes estructuras de JSON.
async function anabot_chatgpt(prompt) {
    try {
        // La URL de la nueva API, que incluye el prompt y la apikey
        const apiUrl = `https://anabot.my.id/api/ai/bingchat?prompt=${encodeURIComponent(prompt)}&apikey=freeApikey`
        
        const response = await fetch(apiUrl)
        const data = await response.json()

        // 1. Verificar si la API devuelve un mensaje de error explícito
        if (data.status === false || data.error || data.message === "Error") {
            return data.message || data.error || 'La API devolvió un error (status: false o error en el mensaje).'
        }
        
        // 2. Intentar encontrar el resultado en campos comunes
        if (data.result) {
            return data.result
        } else if (data.response) {
            return data.response
        } else if (data.reply) {
            return data.reply
        } else if (data.text) {
            return data.text
        } else {
            // 3. Si no se encuentra ningún campo conocido, devolver mensaje de depuración
            console.error(`${msm} Respuesta de API inesperada:`, data);
            return '✘ La respuesta de la API no contiene el campo de resultado esperado (result, response, reply, o text). Revisa la consola para ver el JSON completo.'
        }
        
    } catch (error) {
        console.error(`${msm} Error al obtener la respuesta de anabot.my.id:`, error)
        throw new Error('Error en la conexión con la API de BingChat.')
    }
}

// 2. Función para el análisis de IMAGEN (Mantiene la API original: Luminai.my.id)
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
        console.error(`${msm} Error al analizar la imagen:`, error)
        throw error
    }
}