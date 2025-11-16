const NEVI_API_URL = 'http://neviapi.ddns.net:5000';
const NEVI_API_KEY = 'ellen'; // Usa tu clave API real

/**
 * Comando para buscar imágenes en Pinterest a través de la API de NEVI.
 * @param {object} context - El contexto del comando (mensajes, remitente, etc.).
 * @param {string[]} args - Los argumentos del comando (el término de búsqueda).
 */
async function buscadorPinterestCommand(context, args) {
    // 1. Verificar si hay un término de búsqueda
    const searchTerm = args.join(' ');
    if (!searchTerm) {
        context.reply('⚠️ Por favor, introduce un término de búsqueda para Pinterest.');
        return;
    }

    // 2. Construir la URL de la API
    // Se asume que la API de NEVI tiene un endpoint para Pinterest que acepta un parámetro 'q'
    const url = new URL(`${NEVI_API_URL}/pinterest/search`);
    url.searchParams.append('q', searchTerm);

    // 3. Configurar la petición
    const options = {
        method: 'GET',
        headers: {
            // Asumiendo que la API usa la clave en el encabezado 'X-API-Key'
            'X-API-Key': NEVI_API_KEY, 
            'Content-Type': 'application/json'
        }
    };

    context.reply(`🔎 Buscando "${searchTerm}" en Pinterest...`);

    try {
        // 4. Realizar la petición HTTP
        const response = await fetch(url, options);

        // 5. Verificar la respuesta
        if (!response.ok) {
            // Manejar errores HTTP (404, 500, etc.)
            context.reply(`❌ Error en la API: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();

        // 6. Procesar y responder
        if (data && data.status === 200 && data.results && data.results.length > 0) {
            // Asume que el primer resultado tiene una propiedad 'url' o similar
            const firstResult = data.results[0];
            context.reply(`🖼️ ¡Resultado encontrado para "${searchTerm}"! URL: ${firstResult.url}`);
            // Podrías enviar la imagen directamente si tu plataforma lo permite
            // context.sendImage(firstResult.image_url, `Resultado de ${searchTerm}`);
        } else {
            context.reply(`😔 No se encontraron resultados en Pinterest para "${searchTerm}".`);
        }

    } catch (error) {
        // Manejar errores de red u otros errores
        console.error('Error al ejecutar el comando buscador-pinterest:', error);
        context.reply('💥 Ha ocurrido un error al comunicarse con la API.');
    }
}

// Exportar la función para que pueda ser cargada como un comando/plugin
module.exports = {
    name: 'pinterest', // El nombre del comando (ej: !pinterest gatitos)
    alias: ['pin'],
    description: 'Busca imágenes en Pinterest usando un término de búsqueda.',
    handler: buscadorPinterestCommand
};