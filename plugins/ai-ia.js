import axios from 'axios'
import fetch from 'node-fetch' // Asegúrate de tener 'node-fetch' instalado

// ====================================================================
// --- CONSTANTES Y VARIABLES DEL ENTORNO DEL BOT ---
// (¡DEBES DEFINIR O ASEGURARTE DE QUE ESTAS CONSTANTES EXISTAN!)
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
    
    // El prompt base AHORA SOLO se usa para darle contexto inicial, NO se envía a la API de Kirito
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
            
            // Paso 2: Crear la pregunta combinando el prompt de personalidad y el análisis
            // Esto se hace para que el modelo de Kirito tenga más contexto.
            const combinedQuery = `${basePrompt}. Descríbeme la imagen (${imageAnalysis.result}) y detalla por qué actúan así. También dime quién eres.`
            
            // Paso 3: Obtener la respuesta final de chat con la nueva API (usando la pregunta combinada)
            const description = await kirito_chatgpt(combinedQuery) 
            await conn.reply(m.chat, description, m)
        } catch (e) {
            console.error(`${msm} Error en el análisis de imagen/chat:`, e)
            await m.react(error)
            await conn.reply(m.chat, '✘ ChatGpT no pudo analizar la imagen.', m)
        }
    } 
    // --- LÓGICA PARA TEXTO (Usa la nueva API: api.kirito.my) ---
    else {
        if (!text) { 
            return conn.reply(m.chat, `${emoji} Ingrese una petición para que el ChatGpT lo responda.`, m)
        }
        
        await m.react(rwait)
        try {
            const { key } = await conn.sendMessage(m.chat, {text: `${emoji2} ChatGPT está procesando tu petición, espera unos segundos.`}, {quoted: m})
            
            // Combinamos la personalidad y la pregunta del usuario en una sola consulta
            const combinedQuery = `${basePrompt}. Responde lo siguiente: ${text}`

            // LLAMADA A LA FUNCIÓN CHAT CON LA API DE Kirito
            const response = await kirito_chatgpt(combinedQuery) 
            
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

// 1. Función para la interacción de CHAT (Usando api.kirito.my)
async function kirito_chatgpt(query) {
    try {
        // La URL de la nueva API
        const url = `https://api.kirito.my/api/chatgpt?q=${encodeURIComponent(query)}&apikey=by_deylin`;
        
        const response = await fetch(url)
        const data = await response.json()

        // Asumimos que la respuesta está en 'data.result' o 'data.response'
        if (data.result) {
            return data.result
        } else if (data.response) {
            return data.response
        } else {
            // Si hay un error, Kirito podría devolver un mensaje en 'data.msg' o 'data.message'
            return data.msg || data.message || `✘ Error: La API de Kirito no devolvió un resultado válido. JSON: ${JSON.stringify(data)}`
        }
        
    } catch (error) {
        console.error(`${msm} Error al obtener la respuesta de Kirito:`, error)
        throw new Error('Error en la conexión con la API de Kirito.')
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