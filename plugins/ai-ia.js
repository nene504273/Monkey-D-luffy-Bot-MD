import axios from 'axios'
import fetch from 'node-fetch'

// Define las variables que usas en el código si no están definidas globalmente 
// (Asegúrate de que estas variables estén definidas en tu entorno real de ejecución)
const botname = 'LuminAI' // Ejemplo: Reemplaza con el nombre real de tu bot
const etiqueta = 'Tu Creador' // Ejemplo: Reemplaza con el nombre de tu creador
const vs = '1.0' // Ejemplo: Versión del bot
const msm = '💬' // Ejemplo: Emoji o marcador para mensajes
const emoji = '💡' // Ejemplo: Emoji para inicio de comando
const emoji2 = '🧠' // Ejemplo: Emoji para espera
const rwait = '⏳' // Ejemplo: Emoji para "esperando"
const done = '✅' // Ejemplo: Emoji para "hecho"
const error = '❌' // Ejemplo: Emoji para "error"


let handler = async (m, { conn, usedPrefix, command, text }) => {
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
    const username = `${conn.getName(m.sender)}`
    
    // --- Lógica del Prompt Base ---
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`
    // -----------------------------

    if (isQuotedImage) {
        // --- Análisis de Imagen ---
        const q = m.quoted
        const img = await q.download?.()
        if (!img) {
            console.error(`${msm} Error: No image buffer available`)
            return conn.reply(m.chat, '✘ ChatGpT no pudo descargar la imagen.', m)
        }
        
        const content = `${emoji} ¿Qué se observa en la imagen?`
        
        try {
            // Nota: Esta función 'fetchImageBuffer' usa la API antigua y no ha sido modificada.
            const imageAnalysis = await fetchImageBuffer(content, img)
            
            const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres`
            const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
            
            // Llama a la función luminsesi modificada
            const description = await luminsesi(query, username, prompt) 
            await conn.reply(m.chat, description, m)
            
        } catch(e) {
            console.error(e) // Muestra el error específico
            await m.react(error)
            await conn.reply(m.chat, '✘ ChatGpT no pudo analizar la imagen.', m)
        }
        
    } else {
        // --- Chat de Texto ---
        if (!text) { 
            return conn.reply(m.chat, `${emoji} Ingrese una petición para que el ChatGpT lo responda.`, m)
        }
        
        await m.react(rwait)
        
        try {
            const { key } = await conn.sendMessage(m.chat, {text: `${emoji2} ChatGPT está procesando tu petición, espera unos segundos.`}, {quoted: m})
            
            const query = text
            const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
            
            // Llama a la función luminsesi modificada
            const response = await luminsesi(query, username, prompt) 
            
            await conn.sendMessage(m.chat, {text: response, edit: key})
            await m.react(done)
            
        } catch(e) {
            console.error(e) // Muestra el error específico
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ----------------------------------------------------------------------
//                        FUNCIONES DE LA API
// ----------------------------------------------------------------------

// Función original para enviar una imagen y obtener el análisis (NO MODIFICADA)
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
        console.error('Error en fetchImageBuffer:', error)
        throw error 
    }
}

// Función para interactuar con la IA usando prompts (MODIFICADA para anabot.my.id)
async function luminsesi(q, username, logic) {
    try {
        // 'logic' ya contiene 'basePrompt' + la pregunta o análisis de la imagen.
        const promptFinal = logic 
        
        // --- Construcción de la URL de la nueva API ---
        const apiUrl = `https://anabot.my.id/api/ai/bingchat?prompt=${encodeURIComponent(promptFinal)}&apikey=freeApikey`
        
        // Usamos 'fetch' para la llamada
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
            // Lanza un error si la respuesta HTTP no es exitosa
            throw new Error(`Error HTTP! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Retorna el campo 'result'. Si la API de anabot usa otro nombre 
        // (como 'text' o 'response'), debes cambiar 'data.result' aquí.
        if (data && data.result) {
            return data.result
        } else {
            // Manejo si la API devuelve un JSON pero sin el campo 'result' o está vacío.
            console.error("Respuesta inesperada de anabot.my.id:", data)
            return 'No se pudo obtener una respuesta válida de la IA. Inténtalo de nuevo.'
        }

    } catch (error) {
        console.error(`Error al obtener respuesta de anabot.my.id:`, error)
        throw error 
    }
}