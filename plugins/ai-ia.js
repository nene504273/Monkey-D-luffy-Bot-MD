import axios from 'axios';
// Asegúrate de tener la librería 'axios' instalada: npm install axios

// -------------------------------------------------------------------
// --- CONFIGURACIÓN DE LA API DE CHATGPT ---
const apiKey = 'stellar-eFNHF99t'; 
// Definimos el componente 'url' que contiene el basepath, simulando 'api.url'
const apiBaseUrl = 'https://rest.alyabotpe.xyz'; // La URL base de tu API
// -------------------------------------------------------------------

// --- VARIABLES ASUMIDAS (Ajusta si es necesario) ---
const botname = 'TuBotAI';
const etiqueta = 'El Creador';
const vs = '1.0';
const emoji = '🤖';
const emoji2 = '🧠';
const rwait = '⏳';
const done = '✅';
const error = '❌';
// -------------------------------------------------------------------

const handler = async (m, { conn, text }) => {

    // Obtiene el nombre del usuario
    // Asumiendo que 'conn.getName(m.sender)' funciona para obtener el nombre.
    const username = `${conn.getName(m.sender)}`;

    // Prompt base para la personalidad de la IA
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando.`;

    // --- LÓGICA DE DETECCIÓN DE IMAGEN (FUNCIÓN DE VISIÓN DESHABILITADA) ---
    // Mantenemos la detección para notificar al usuario que la función de Visión no está disponible
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/');

    if (isQuotedImage) {
        await m.react(error);
        return conn.reply(m.chat, `${username}, mi función de análisis de imágenes (Visión) está deshabilitada porque solo estoy conectada a la API de texto. ¡Solo puedo chatear por ahora!`, m);
    }

    // --- LÓGICA PARA SÓLO CHATGPT (TEXTO) ---
    if (!text) { 
        return conn.reply(m.chat, `${emoji} Ingrese una petición para que ${botname} lo responda.`, m);
    }

    await m.react(rwait);
    
    try {
        // 1. Muestra un mensaje de espera
        const { key } = await conn.sendMessage(m.chat, {text: `${emoji2} ${botname} está procesando tu petición, espera unos segundos.`}, {quoted: m});

        // 2. Combina la personalidad y la consulta del usuario en el 'prompt'
        const prompt = `${basePrompt}. Responde lo siguiente: ${text}`; 

        // 3. Llama a la API con el prompt completo
        const response = await luminsesi(username, prompt); 

        // 4. Edita el mensaje de espera con la respuesta
        await conn.sendMessage(m.chat, {text: response, edit: key});
        await m.react(done);
    } catch (e) {
        console.error('Error en el handler principal:', e);
        // Envía el mensaje de error al usuario
        const errMsg = e.message || `✘ ${username}, no pude responder. Hubo un error desconocido.`;
        await conn.sendMessage(m.chat, {text: errMsg, edit: key});
        await m.react(error);
    }
}

handler.help = ['ia', 'chatgpt']
handler.tags = ['ai']
handler.register = true
handler.command = ['ia', 'chatgpt', 'luminai']
handler.group = true

export default handler

// ----------------------------------------------------
// --- FUNCIONES DE API ---

/**
 * Función para interactuar con la IA usando prompts.
 * Implementa la estructura de URL solicitada: `${api.url}/ai/chatgpt?text=${encodeURIComponent(text)}&key=${api.key}`
 * @param {string} username Nombre del usuario para mensajes de error.
 * @param {string} prompt El texto completo que se enviará a la IA (incluyendo personalidad).
 * @returns {Promise<string>} La respuesta de la IA.
 */
async function luminsesi(username, prompt) {
    try {
        // Construcción de la URL: apiBaseUrl + /ai/chatgpt?text=...&key=...
        const apiUrl = `${apiBaseUrl}/ai/chatgpt?text=${encodeURIComponent(prompt)}&key=${apiKey}`;

        const response = await axios.get(apiUrl);
        const apiResponse = response.data;

        // Lógica de verificación de respuesta (maneja 'response', 'result' o 'text')
        if (apiResponse && (apiResponse.response || apiResponse.result || apiResponse.text)) {
            return apiResponse.response || apiResponse.result || apiResponse.text;
        }

        // Manejo de errores de la API
        let errorMessage = `Lo siento, ${username}, la IA no pudo generar una respuesta válida. (Error de formato de API)`;

        if (apiResponse.message) {
             errorMessage = `API Error: ${apiResponse.message}`;
        } else if (apiResponse.error) {
             errorMessage = `API Error: ${apiResponse.error}`;
        }

        console.error(`Respuesta inesperada de la API: ${JSON.stringify(apiResponse)}`);
        throw new Error(errorMessage); // Lanza un error para ser capturado por el handler

    } catch (error) {
        console.error(`Error al obtener respuesta de ChatGPT:`, error);
        // Propaga un error de conexión para que el handler lo muestre
        throw new Error(`Lo siento, ${username}, hubo un error de conexión con la IA.`);
    }
}