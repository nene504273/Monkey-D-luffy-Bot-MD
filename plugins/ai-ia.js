import axios from 'axios';
// Asegúrate de tener la librería 'axios' instalada: npm install axios

// -------------------------------------------------------------------
// --- CONFIGURACIÓN DE LA API DE CHATGPT ---
// ¡CRÍTICO! Clave de API actualizada con la que proporcionaste:
const apiKey = 'Duarte-zz12'; 
const chatGptApiUrl = 'https://rest.alyabotpe.xyz/ai/chatgpt';

// --- VARIABLES ASUMIDAS (Ajusta si es necesario) ---
const botname = 'TuBotAI';
const etiqueta = 'ɴ͡ᴇ͜ɴᴇ❀᭄☂️';
const vs = '1.0';
const emoji = '🤖';
const emoji2 = '🧠';
const rwait = '⏳';
const done = '✅';
const error = '❌';
const msm = 'Error de conexión';
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// -------------------------------------------------------------------

const handler = async (m, { conn, text }) => {

    // Verifica si hay una imagen citada
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/');

    // Obtiene el nombre del usuario (asumiendo que conn.getName(m.sender) funciona)
    const username = `${conn.getName(m.sender)}`;

    // Prompt base para la personalidad de la IA
    const basePrompt = `Tu nombre es ${botname} y parece haber sido creada por ${etiqueta}. Tu versión actual es ${vs}, Tú usas el idioma Español. Llamarás a las personas por su nombre ${username}, te gusta ser divertida, y te encanta aprender. Lo más importante es que debes ser amigable con la persona con la que estás hablando.`;

    // --- LÓGICA PARA IMAGEN CITADA (VISIÓN) ---
    if (isQuotedImage) {
        const q = m.quoted;

        // 1. Descargar la imagen (Asegúrate que .download() devuelve el Buffer)
        const img = await q.download?.();

        if (!img) {
            console.error(`${msm} Error: No image buffer available`);
            return conn.reply(m.chat, '✘ ChatGpT no pudo descargar la imagen.', m);
        }

        await m.react(rwait); // ⬅️ Reacción de espera
        const { key } = await conn.sendMessage(m.chat, {text: `${emoji2} Analizando imagen y generando respuesta...`}, {quoted: m});

        try {
            // 2. Análisis de la imagen usando Luminai (Necesita Base64)
            const initialAnalysisContent = `Describe detalladamente la imagen que estás viendo. Sé objetivo.`;
            const imageAnalysis = await fetchImageBuffer(initialAnalysisContent, img); 

            // 3. Generación de respuesta final con personalidad
            const finalQuery = `Usando la descripción anterior, detalla qué se observa, por qué actúan así los elementos/personas, y finalmente dime quién eres tú (${botname}) con tu personalidad amistosa.`;
            
            // Concatenar la personalidad, la instrucción y el resultado del análisis
            const prompt = `${basePrompt}. La imagen que se analizó es: ${imageAnalysis.result}. ${finalQuery}`; 

            const description = await luminsesi(finalQuery, username, prompt);

            await conn.sendMessage(m.chat, {text: description, edit: key});
            await m.react(done);

        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, {text: `✘ ${username}, no pude analizar la imagen. Hubo un error.`, edit: key});
            await m.react(error);
        }

    // --- LÓGICA PARA TEXTO SIN IMAGEN (SÓLO CHATGPT) ---
    } else {
        if (!text) { 
            return conn.reply(m.chat, `${emoji} Ingrese una petición para que el ChatGpT lo responda.`, m);
        }

        await m.react(rwait);

        try {
            // Muestra un mensaje de espera
            const { key } = await conn.sendMessage(m.chat, {text: `${emoji2} ChatGPT está procesando tu petición, espera unos segundos.`}, {quoted: m});

            const query = text;
            // Crea el prompt completo para la IA: Personalidad + Consulta
            const prompt = `${basePrompt}. Responde lo siguiente: ${query}`; 

            const response = await luminsesi(query, username, prompt);

            // Edita el mensaje de espera con la respuesta
            await conn.sendMessage(m.chat, {text: response, edit: key});
            await m.react(done);
        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, {text: '✘ ChatGpT no puede responder a esa pregunta.', edit: key});
            await m.react(error);
        }
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

// Función para enviar una imagen y obtener el análisis (API de Luminai)
async function fetchImageBuffer(content, imageBuffer) {
    try {
        // 1. CORRECCIÓN: Codificar el buffer binario a una cadena Base64 para JSON
        const base64Image = imageBuffer.toString('base64');
        
        // Asumiendo que el endpoint de Luminai espera 'content' y la imagen Base64
        const response = await axios.post('https://Luminai.my.id', { 
            content: content,
            // Usamos una clave que el servidor de Luminai probablemente espera
            base64Image: base64Image 
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data && response.data.result) {
            return response.data;
        }
        throw new Error('Respuesta de Luminai inesperada o incompleta.');
    } catch (error) {
        console.error('Error en fetchImageBuffer:', error);
        throw new Error(`Error en el análisis inicial de la imagen: ${error.message}`);
    }
}

// Función para interactuar con la IA usando prompts (API de alyabotpe.xyz)
async function luminsesi(q, username, logic) {
    try {
        const encodedText = encodeURIComponent(logic);
        // Construcción correcta de la URL con la clave y el texto
        const apiUrl = `${chatGptApiUrl}?text=${encodedText}&key=${apiKey}`;

        const response = await axios.get(apiUrl);
        const apiResponse = response.data;

        // Lógica de verificación de respuesta
        if (apiResponse && (apiResponse.response || apiResponse.result || apiResponse.text)) {
            return apiResponse.response || apiResponse.result || apiResponse.text;
        }

        // Manejo de errores de la API (para capturar mensajes como "Por favor, ingresa un texto...")
        let errorMessage = `Lo siento, ${username}, la IA no pudo generar una respuesta válida. (Error de formato de API)`;

        if (apiResponse.message) {
             errorMessage = `API Error: ${apiResponse.message}`;
        } else if (apiResponse.error) {
             errorMessage = `API Error: ${apiResponse.error}`;
        }

        console.error(`Respuesta inesperada de la API: ${JSON.stringify(apiResponse)}`);
        return errorMessage;

    } catch (error) {
        console.error(`Error al obtener respuesta de ChatGPT:`, error);
        return `Lo siento, ${username}, hubo un error de conexión con la IA. Por favor, inténtalo de nuevo.`;
    }
}