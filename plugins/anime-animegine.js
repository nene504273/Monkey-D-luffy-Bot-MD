import fetch from 'node-fetch';

// ==================== CONFIGURACIÓN ====================
const API_KEY = 'LUFFY-GEAR4';
const API_BASE = 'https://rest.alyabotpe.xyz/ai/texttoimage';
const DEFAULT_STYLE = 'realista';
const TIMEOUT_MS = 45000; // 45 segundos máximo de espera

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Obtiene una imagen generada por IA desde la API externa.
 * @param {string} prompt - Texto descriptivo para la imagen.
 * @returns {Promise<Buffer>} Buffer de la imagen generada.
 * @throws {Error} Si la API no responde correctamente o no es una imagen.
 */
async function fetchGeneratedImage(prompt) {
  const url = `${API_BASE}?prompt=${encodeURIComponent(prompt)}&style=${DEFAULT_STYLE}&key=${API_KEY}`;

  // Controlador de timeout para evitar esperas infinitas
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
        // Si no es JSON, tomamos parte del texto
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
      // No es JSON, mostrar parte del texto recibido
      const preview = textResponse.slice(0, 150);
      throw new Error(`Respuesta inesperada (no imagen): ${preview}...`);
    }

  } catch (error) {
    clearTimeout(timeoutId);
    // Mejorar mensaje de timeout
    if (error.name === 'AbortError') {
      throw new Error(`La generación excedió el tiempo límite (${TIMEOUT_MS / 1000}s).`);
    }
    throw error; // Relanzar para manejo superior
  }
}

// ==================== HANDLER PRINCIPAL ====================
const handler = async (m, { conn, args }) => {
  const prompt = args.join(' ').trim();

  // Validación de entrada
  if (!prompt) {
    return conn.sendMessage(m.chat, { 
      text: '*🎨 ¡Hey! Necesito un texto para crear la imagen.*\n\n_Ejemplo: .text2img atardecer en la playa_' 
    }, { quoted: m });
  }

  // Límite de caracteres para evitar prompts muy largos (opcional pero recomendable)
  if (prompt.length > 500) {
    return conn.sendMessage(m.chat, { 
      text: '⚠️ *El texto es demasiado largo.* Por favor, resúmelo a menos de 500 caracteres.' 
    }, { quoted: m });
  }

  // Reacción inicial indicando proceso
  await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

  try {
    // Obtener imagen desde la API
    const imageBuffer = await fetchGeneratedImage(prompt);

    // Enviar imagen con caption atractivo
    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `✅ *¡Imagen generada con éxito!*\n\n📝 *Prompt:* ${prompt}\n🎭 *Estilo:* ${DEFAULT_STYLE}\n🔮 *Generada por IA*`,
      mimetype: 'image/jpeg' // Forzar tipo MIME para evitar problemas
    }, { quoted: m });

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('❌ Error en text2img:', error);

    // Reacción de fallo
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });

    // Mensaje de error detallado pero amigable
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