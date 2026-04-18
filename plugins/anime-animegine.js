
import fetch from 'node-fetch';

// ==================== CONFIGURACIÓN ====================
const API_KEY = 'LUFFY-GEAR4';
const API_BASE = 'https://api.alyacore.xyz/search/googleimagen';
const TIMEOUT_MS = 30000; // 30 segundos máximo de espera

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Busca imágenes en Google a través de la API externa.
 * @param {string} query - Término de búsqueda.
 * @returns {Promise<string[]>} Array de URLs de imágenes.
 * @throws {Error} Si la API falla o no devuelve resultados válidos.
 */
async function fetchGoogleImages(query) {
  const url = `${API_BASE}?query=${encodeURIComponent(query)}&key=${API_KEY}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhatsAppBot/2.0)',
        'Accept': 'application/json'
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

    // 2. Parsear respuesta JSON
    const data = await response.json();

    // 3. Validar estructura de respuesta (ajusta según el formato real de la API)
    //    Suponemos que data.result es un array con objetos que tienen una propiedad "url" o "link".
    let images = [];
    if (Array.isArray(data.result)) {
      images = data.result
        .map(item => item.url || item.link || item.image || item.src)
        .filter(url => typeof url === 'string' && url.startsWith('http'));
    } else if (Array.isArray(data)) {
      images = data
        .map(item => item.url || item.link || item.image || item.src)
        .filter(url => typeof url === 'string' && url.startsWith('http'));
    }

    if (images.length === 0) {
      throw new Error('No se encontraron imágenes para esta búsqueda.');
    }

    return images;

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`La búsqueda excedió el tiempo límite (${TIMEOUT_MS / 1000}s).`);
    }
    throw error;
  }
}

// ==================== HANDLER PRINCIPAL ====================
const handler = async (m, { conn, args }) => {
  const query = args.join(' ').trim();

  // Validación de entrada
  if (!query) {
    return conn.sendMessage(m.chat, {
      text: '*🔍 ¡Necesito un término de búsqueda!*\n\n_Ejemplo: .googleimg paisajes montañosos_'
    }, { quoted: m });
  }

  if (query.length > 200) {
    return conn.sendMessage(m.chat, {
      text: '⚠️ *La búsqueda es demasiado larga.* Por favor, resúmela a menos de 200 caracteres.'
    }, { quoted: m });
  }

  // Reacción inicial
  await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  try {
    // Obtener URLs de imágenes desde la API
    const imageUrls = await fetchGoogleImages(query);

    // Seleccionar la primera imagen (puedes cambiar a aleatoria si prefieres)
    const selectedImageUrl = imageUrls[0];

    // Enviar la imagen
    await conn.sendMessage(m.chat, {
      image: { url: selectedImageUrl },
      caption: `✅ *Resultado de búsqueda:*\n\n📝 *Término:* ${query}\n🖼️ *Fuente:* Google Imágenes`,
      mimetype: 'image/jpeg'
    }, { quoted: m });

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('❌ Error en googleimg:', error);

    // Reacción de fallo
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });

    const errorMessage = error.message.includes('API respondió') || error.message.includes('No se encontraron')
      ? error.message
      : `*Ocurrió un error inesperado.*\n\n🔍 _Detalle:_ ${error.message}`;

    await conn.sendMessage(m.chat, {
      text: `💢 *¡Error al buscar imágenes!*\n\n${errorMessage}\n\n⏳ _Inténtalo de nuevo más tarde._`
    }, { quoted: m });
  }
};

// ==================== METADATOS DEL COMANDO ====================
handler.help = ['text2img <búsqueda>'];
handler.tags = ['buscador', 'imagenes'];
handler.command = ['googleimg', 'gimage', 'imgsearch', 'buscarimg'];
handler.limit = true;
handler.register = true;

export default handler;