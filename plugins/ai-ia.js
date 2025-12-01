import axios from 'axios'
import fetch from 'node-fetch'

// --- VARIABLES Y CONFIGURACIÓN ---
// (Asegúrate de que estas variables estén definidas en el ámbito donde se ejecuta este código, 
// o reemplázalas con valores estáticos si no están disponibles globalmente.)
// Ejemplo: 
const botname = "LuminAI-Bing"
const etiqueta = "Luminus"
const vs = "1.1.0"
const emoji = '🤖' // Para el análisis de imagen/petición
const emoji2 = '⏳' // Para el mensaje de espera
const rwait = '⏳' // Reacción de espera
const done = '✅'  // Reacción de completado
const error = '❌' // Reacción de error
const msm = 'INFO:' // Prefijo para logs de error

let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Nombre del usuario para el prompt
    const username = `${conn.getName(m.sender)}`
    
    // Identificación de imagen citada
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
    
    // Prompt base para definir la personalidad de la IA
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`

    // --- LÓGICA PARA ANÁLISIS DE IMAGEN ---
    if (isQuotedImage) {
        const q = m.quoted
        const img = await q.download?.()
        
        if (!img) {
            console.error(`${msm} Error: No image buffer available`)
            return conn.reply(m.chat, '✘ ChatGpT no pudo descargar la imagen.', m)
        }
        
        const content = `${emoji} ¿Qué se observa en la imagen?`
        
        try {
            // 1. Análisis de la imagen usando la API original de Luminai
            const imageAnalysis = await fetchImageBuffer(content, img) 
            
            // 2. Consulta y prompt final para el chatbot
            const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres`
            const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
            
            // 3. Obtener la descripción final usando la función 'luminsesi' modificada
            const description = await luminsesi(query, username, prompt)
            
            await conn.reply(m.chat, description, m)
            
        } catch (e) {
            console.error(e)
            await m.react(error)
            await conn.reply(m.chat, '✘ ChatGpT no pudo analizar la imagen.', m)
        }
        
    // --- LÓGICA PARA CHAT DE TEXTO ---
    } else {
        if (!text) { 
            return conn.reply(m.chat, `${emoji} Ingrese una petición para que el ChatGpT lo responda.`, m)
        }
        
        await m.react(rwait)
        
        try {
            const { key } = await conn.sendMessage(m.chat, {text: `${emoji2} ChatGPT está procesando tu petición, espera unos segundos.`}, {quoted: m})
            
            const query = text
            // El prompt final que incluye la personalidad y la pregunta del usuario
            const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
            
            // Obtener la respuesta usando la función 'luminsesi' modificada
            const response = await luminsesi(query, username, prompt)
            
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

// --- FUNCIONES AUXILIARES ---

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Función ORIGINAL para enviar una imagen y obtener el análisis (API de Luminai)
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
        // Asumiendo que esta API devuelve el resultado en 'result'
        return response.data 
    } catch (error) {
        console.error('Error en fetchImageBuffer:', error)
        throw error 
    }
}

// Función MODIFICADA para interactuar con la IA (API de Bing Chat/anabot.my.id)
async function luminsesi(q, username, logic) {
    try {
        const finalPrompt = logic; 

        // API de Bing Chat con la clave gratuita
        const apiUrl = `https://anabot.my.id/api/ai/bingchat?prompt=${encodeURIComponent(finalPrompt)}&apikey=freeApikey`;

        const response = await axios.get(apiUrl);

        // Intenta extraer el resultado de la respuesta
        if (response.data && response.data.result) {
            return response.data.result;
        } else if (response.data && response.data.response) {
            return response.data.response;
        } else if (response.data && response.data.answer) {
            return response.data.answer;
        } else {
            // LANZAR ERROR: Si la estructura no es la esperada, lanza un error
            // que será capturado por el bloque 'catch' principal del handler.
            console.warn(`${msm} Estructura de respuesta inesperada: No se encontró 'result', 'response', ni 'answer' en la API.`, response.data);
            throw new Error('Respuesta de la API sin el campo de texto esperado.'); 
        }

    } catch (error) {
        console.error(`${msm} Error al obtener respuesta de Bing Chat:`, error);
        throw error; 
    }
}