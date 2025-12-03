// --- CONFIGURACIÓN DE LA API DE CHATGPT ---
// Define la clave y la URL de la API aquí
const apiKey = 'stellar-S9K4dSmm'; // Tu clave proporcionada
const chatGptApiUrl = 'https://rest.alyabotpe.xyz/ai/chatgpt';

// Asegúrate de que las variables 'botname', 'etiqueta', 'vs', 'emoji', 'emoji2', 'rwait', 'done', 'error', 'msm', 'conn', y 'text' estén definidas en el contexto de tu bot.
// Variables necesarias que asumo están definidas globalmente o en el scope de tu bot
const botname = 'TuBotAI'; // Ejemplo
const etiqueta = 'El Creador'; // Ejemplo
const vs = '1.0'; // Ejemplo
const emoji = '🤖'; // Ejemplo
const emoji2 = '🧠'; // Ejemplo
const rwait = '⏳'; // Ejemplo
const done = '✅'; // Ejemplo
const error = '❌'; // Ejemplo
const msm = 'Error de conexión'; // Ejemplo

const handler = async (m, { conn, text }) => {
    
    // Verifica si hay una imagen citada
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
    
    // Obtiene el nombre del usuario
    const username = `${conn.getName(m.sender)}`
    
    // Prompt base para la personalidad de la IA
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando. ${username}`
    
    // --- LÓGICA PARA IMAGEN CITADA ---
    if (isQuotedImage) {
        const q = m.quoted
        // Intenta descargar la imagen
        const img = await q.download?.()
        
        if (!img) {
            console.error(`${msm} Error: No image buffer available`)
            return conn.reply(m.chat, '✘ ChatGpT no pudo descargar la imagen.', m)
        }
        
        // Primera consulta a la API de análisis de imágenes (Luminai.my.id)
        const content = `${emoji} ¿Qué se observa en la imagen?`
        
        try {
            const imageAnalysis = await fetchImageBuffer(content, img)
            
            // Segunda consulta a la IA (usando la nueva API) con la descripción de la imagen
            const query = `${emoji} Descríbeme la imagen y detalla por qué actúan así. También dime quién eres`
            const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis.result}` // Incluye el resultado del análisis en el prompt
            
            const description = await luminsesi(query, username, prompt) // Llama a la nueva función luminsesi
            
            await conn.reply(m.chat, description, m)
        } catch (e) {
            console.error(e)
            await m.react(error)
            await conn.reply(m.chat, '✘ ChatGpT no pudo analizar la imagen.', m)
        }
    
    // --- LÓGICA PARA TEXTO SIN IMAGEN ---
    } else {
        if (!text) { 
            return conn.reply(m.chat, `${emoji} Ingrese una petición para que el ChatGpT lo responda.`, m)
        }
        
        await m.react(rwait)
        
        try {
            // Muestra un mensaje de espera
            const { key } = await conn.sendMessage(m.chat, {text: `${emoji2} ChatGPT está procesando tu petición, espera unos segundos.`}, {quoted: m})
            
            const query = text
            const prompt = `${basePrompt}. Responde lo siguiente: ${query}` // Crea el prompt completo para la IA
            
            const response = await luminsesi(query, username, prompt) // Llama a la función luminsesi corregida
            
            // Edita el mensaje de espera con la respuesta
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ----------------------------------------------------
// --- FUNCIONES DE API ---

// Función para enviar una imagen y obtener el análisis (usa la API original)
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

// Función para interactuar con la IA usando prompts (USA LA NUEVA API - CORREGIDA)
async function luminsesi(q, username, logic) {
    try {
        // Codifica el texto de la consulta completo para usarlo en la URL
        const encodedText = encodeURIComponent(logic);
        
        // Construye la URL de la API con el texto codificado y la clave
        const apiUrl = `${chatGptApiUrl}?text=${encodedText}&key=${apiKey}`;

        // Realiza la solicitud GET
        const response = await axios.get(apiUrl);

        // --- Lógica de verificación de respuesta ajustada ---
        const apiResponse = response.data;
        
        // Comprobamos si la respuesta está en 'response', 'result' o 'text'
        if (apiResponse && apiResponse.response) {
            return apiResponse.response; // Intento 1
        } else if (apiResponse && apiResponse.result) {
            return apiResponse.result; // Intento 2
        } else if (apiResponse && apiResponse.text) {
            return apiResponse.text; // Intento 3
        }

        // Si la respuesta no coincide con ninguno, reporta el error
        console.error(`Respuesta inesperada de la API: ${JSON.stringify(apiResponse)}`);
        return `Lo siento, ${username}, la IA no pudo generar una respuesta válida. (Error de formato de API)`;

    } catch (error) {
        console.error(`Error al obtener respuesta de ChatGPT:`, error);
        // Devolver un mensaje de error de conexión si falla
        return `Lo siento, ${username}, hubo un error de conexión con la IA. Por favor, inténtalo de nuevo.`;
    }
}