import axios from 'axios'
import fetch from 'node-fetch'

// ------------------------------------------
// --- CONFIGURACIÓN DE LA API DE CHATGPT ---
// ------------------------------------------
// ¡AHORA SE LEE DE LAS VARIABLES DE ENTORNO!
// DEBES CONFIGURAR NEVI_API_KEY en tu archivo .env o en el entorno de tu servidor
const NEVI_API_KEY = process.env.NEVI_API_KEY; 
const NEVI_CHATGPT_ENDPOINT = process.env.NEVI_CHATGPT_ENDPOINT || 'http://neviapi.ddns.net:5000/chatgpt'; 
// ------------------------------------------

// --- Variables de Ejemplo (Asumo que están definidas globalmente en tu bot) ---
const getGlobalVar = (name, defaultValue) => global[name] || defaultValue;
const botname = getGlobalVar('botname', 'ChatGPT Bot');
const etiqueta = getGlobalVar('etiqueta', 'Mi Creador');
const vs = getGlobalVar('vs', '1.0');
const emoji = '🤖';
const emoji2 = '🧠';
const rwait = '⏳';
const done = '✅';
const error = '❌';
// -----------------------------------------------------------------------------

let handler = async (m, { conn, usedPrefix, command, text }) => {

    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
    const username = `${conn.getName(m.sender)}`
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`

    // --- LÓGICA DE PROCESAMIENTO DE IMAGEN (Aún usa el endpoint original, solo la función 'luminsesi' fue reemplazada) ---
    if (isQuotedImage) {
        const q = m.quoted
        const img = await q.download?.()
        if (!img) {
            console.error(`Error: No image buffer available`)
            return conn.reply(m.chat, '✘ ChatGpT no pudo descargar la imagen.', m)}
            const content = `${emoji} ¿Qué se observa en la imagen?`
            try {
                // Se usa la función fetchImageBuffer original (Luminai) para el análisis de la imagen
                const imageAnalysis = await fetchImageBuffer(content, img) 
                const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres`
                const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}`
                const description = await luminsesi(query, username, prompt) // Usa la nueva luminsesi (Nevi API)
                await conn.reply(m.chat, description, m)
            } catch (e) {
                console.error("Error en procesamiento de imagen:", e);
                await m.react(error)
                await conn.reply(m.chat, '✘ ChatGpT no pudo analizar la imagen.', m)}
    // --- LÓGICA DE PROCESAMIENTO DE TEXTO (USA NEVI API) ---
    } else {
        if (!text) { return conn.reply(m.chat, `${emoji} Ingrese una petición para que el ChatGpT lo responda.`, m)}

        // Bloqueo de seguridad para la clave API (la validación ahora solo comprueba si está vacía)
        if (!NEVI_API_KEY) {
            await m.react(error)
            return conn.reply(m.chat, '❌ Error de Configuración: La clave de la API de Nevi no ha sido cargada del entorno. Por favor, revisa tus variables.', m);
        }

        await m.react(rwait)
        try {
            const { key } = await conn.sendMessage(m.chat, {text: `${emoji2} ChatGPT está procesando tu petición, espera unos segundos.`}, {quoted: m})
            const query = text
            const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
            const response = await luminsesi(query, username, prompt) // Usa la nueva luminsesi (Nevi API)
            await conn.sendMessage(m.chat, {text: response, edit: key})
            await m.react(done)
        } catch (e) {
            console.error("Error en procesamiento de texto:", e);
            await m.react(error)
            await conn.reply(m.chat, `✘ ChatGpT no puede responder a esa pregunta. (Error: ${e.message})`, m)
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

// Función para enviar una imagen y obtener el análisis (ENDPOINT ORIGINAL DE LUMINAI)
// MANTENER ESTO ASÍ hasta que tengas el endpoint de Visión de Nevi API
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

// Función para interactuar con la IA usando prompts (MODIFICADA PARA NEVI API)
async function luminsesi(q, username, logic) {
    // 'logic' ya contiene la basePrompt y la pregunta.
    const fullPrompt = logic; 

    try {
        // Petición POST a la Nevi API
        const response = await axios.post(NEVI_CHATGPT_ENDPOINT, {
            prompt: fullPrompt, 
            key: NEVI_API_KEY,  // Incluimos la clave
        });

        // Intentamos extraer el resultado. Ajusta si el formato de respuesta de Nevi es diferente.
        const result = response.data.result || response.data.response || response.data.text || JSON.stringify(response.data);

        // Si el resultado es una cadena vacía o nula, lanzamos un error para que lo capture el 'catch'
        if (!result) {
            throw new Error("Respuesta vacía o inesperada de la Nevi API.");
        }

        return result;

    } catch (error) {
        // Manejo de errores detallado
        const errorMessage = error.response && error.response.data && (error.response.data.error || error.response.data.message) 
            ? `API Error: ${error.response.data.error || error.response.data.message}` 
            : error.message;

        console.error(`Error al obtener respuesta de Nevi API:`, errorMessage);
        throw new Error(errorMessage);
    }
}