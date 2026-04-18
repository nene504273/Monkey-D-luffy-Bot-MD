import fetch from 'node-fetch';

// ==================== CONFIGURACIÓN ====================
const API_KEY = 'LUFFY-GEAR4';
// Ajusta esta URL con el endpoint correcto de generación de imágenes por IA.
// Ejemplo: 'https://rest.alyabotpe.xyz/ai/texttoimage'
const API_BASE = 'https://api.alyacore.xyz/ai/texttoimage';
const DEFAULT_STYLE = 'anime'; // Cambia a 'realista' u otro si la API lo soporta.
const TIMEOUT_MS = 60000; // 60 segundos, la generación puede tardar más.

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Obtiene una imagen generada por IA desde la API externa.
 * @param {string} prompt - Texto descriptivo para la imagen.
 * @returns {Promise<Buffer>} Buffer de la imagen generada.
 * @throws {Error} Si la API no responde correctamente o no es una imagen.
 */
async function fetchAIGeneratedImage(prompt) {
  // Construye la URL con los parámetros necesarios.
  // Ajusta los nombres de los parámetros según la documentación de tu API.
  const url = `${API_BASE}?prompt=${encodeURIComponent(prompt)}&style=${DEFAULT_STYLE}&key=${API_KEY}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhatsAppBot/2.0)',
        'Accept': 'image/*, application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // 1. Verificar estado HTTP
    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}`;
      try {
        const json = await response.json();
        errorDetail = json.message || json.error || errorDetail;
      } catch {
        const text = await response.text();
        errorDetail = text.slice(0, 200) || errorDetail;
      }
      throw new Error(`API respondió con error: ${errorDetail}`);
    }

    // 2. Verificar tipo de contenido
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('image/')) {
      // Es una imagen → convertir a Buffer
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    // 3. No es imagen, intentar leer mensaje de error en JSON
    const textResponse = await response.text();
    try {
      const jsonError = JSON.parse(textResponse);
      throw new Error(jsonError.message || jsonError.error || 'La API no devolvió una imagen válida.');
    } catch (parseError) {
      const preview = textResponse.slice(0, 150);
      throw new Error(`Respuesta inesperada (no imagen): ${preview}...`);
    }

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`La generación excedió el tiempo límite (${TIMEOUT_MS / 1000}s).`);
    }
    throw error;
  }
}

// ==================== HANDLER PRINCIPAL ====================
const handler = async (m, { conn, args }) => {
  const prompt = args.join(' ').trim();

  // Validación de entrada
  if (!prompt) {
    return conn.sendMessage(m.chat, {
      text: '*🎨 ¡Hey! Necesito un texto para crear la imagen.*\n\n_Ejemplo: #text2img atardecer en la playa_'
    }, { quoted: m });
  }

  if (prompt.length > 500) {
    return conn.sendMessage(m.chat, {
      text: '⚠️ *El texto es demasiado largo.* Por favor, resúmelo a menos de 500 caracteres.'
    }, { quoted: m });
  }

  // Reacción inicial
  await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

  try {
    // Obtener imagen desde la API de IA
    const imageBuffer = await fetchAIGeneratedImage(prompt);

    // Enviar imagen con caption atractivo
    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `✅ *¡Imagen generada con éxito!*\n\n📝 *Prompt:* ${prompt}\n🎭 *Estilo:* ${DEFAULT_STYLE}\n🔮 *Generada por IA*`,
      mimetype: 'image/jpeg'
    }, { quoted: m });

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('❌ Error en text2img:', error);

    // Reacción de fallo
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });

    const errorMessage = error.message.includes('API respondió')
      ? error.message
      : `*Ocurrió un error inesperado.*\n\n🔍 _Detalle:_ ${error.message}`;

    await conn.sendMessage(m.chat, {
      text: `💢 *¡Error al generar la imagen!*\n\n${errorMessage}\n\n⏳ _Inténtalo de nuevo en unos momentos._`
    }, { quoted: m });
  }
};

// ==================== METADATOS DEL COMANDO ====================
handler.help = ['text2img <descripción>'];
handler.tags = ['ai', 'imagenes'];
handler.command = ['text2img', 'imagen', 'iaimg', 'imgia', 't2i'];
handler.limit = true;
handler.register = true;

export default handler;