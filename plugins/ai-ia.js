import axios from 'axios';
// Asegúrate de tener la librería 'axios' instalada: npm install install

// -------------------------------------------------------------------
// --- CONFIGURACIÓN DE LA API DE CHATGPT ---
// ¡CRÍTICO! Clave de API actualizada con la que proporcionaste:
const apiKey = 'stellar-eFNHF99t'; 
// El endpoint base ahora asume la estructura que quieres: alyabotpe.xyz
const chatGptApiUrl = 'https://rest.alyabotpe.xyz/ai/chatgpt';

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

/**
 * Función principal del handler para procesar comandos de IA.
 * @param {*} m Mensaje
 * @param {object} param1 Conexión y texto
 */
const handler = async (m, { conn, text }) => {

    // Elimina la lógica de verificación de imagen citada, ya que la API de destino
    // solo soporta texto.
    // const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/');

    // Obtiene el nombre del usuario
    const username = `${conn.getName(m.sender)}`;

    // Prompt base para la personalidad de la IA
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando.`;

    // --- LÓGICA PARA SÓLO CHATGPT (TEXTO) ---
    if (!text) { 
        return conn.reply(m.chat, `${emoji} Ingrese una petición para que ${botname} lo responda.`, m);
    }

    await m.react(rwait);

    try {
        // Muestra un mensaje de espera
        const { key } = await conn.sendMessage(m.chat, {text: `${emoji2} ${botname} está procesando tu petición, espera unos segundos.`}, {quoted: m});

        const query = text;
        // Crea el prompt completo para la IA: Personalidad + Consulta
        // La API de alyabotpe.xyz recibe el texto completo a procesar
        const prompt = `${basePrompt}. Responde lo siguiente: ${query}`; 

        const response = await luminsesi(username, prompt);

        // Edita el mensaje de espera con la respuesta
        await conn.sendMessage(m.chat, {text: response, edit: key});
        await m.react(done);
    } catch (e) {
        console.error('Error en el handler principal:', e);
        await conn.sendMessage(m.chat, {text: '✘ ' + (e.message || 'Hubo un error desconocido al contactar a la IA.'), edit: key});
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

// La función fetchImageBuffer y su endpoint de Luminai han sido eliminados
// ya que la API solicitada solo soporta texto.

/**
 * Función para interactuar con la IA usando prompts (API de alyabotpe.xyz).
 * @param {string} username Nombre del usuario para mensajes de error.
 * @param {string} logic El prompt completo con personalidad y consulta.
 * @returns {Promise<string>} La respuesta de la IA.
 */
async function luminsesi(username, logic) {
    try {
        // Construcción correcta de la URL con la clave y el texto
        // Esta estructura respeta la forma solicitada: 
        // `${api.url}/ai/chatgpt?text=${encodeURIComponent(text)}&key=${api.key}`
        const apiUrl = `${chatGptApiUrl}?text=${encodeURIComponent(logic)}&key=${apiKey}`;

        const response = await axios.get(apiUrl);
        const apiResponse = response.data;

        // Lógica de verificación de respuesta (ajustada para ser más robusta)
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
        // Propaga el error para que el handler lo muestre al usuario
        throw new Error(`Lo siento, ${username}, hubo un error de conexión con la IA. Por favor, inténtalo de nuevo.`);
    }
}