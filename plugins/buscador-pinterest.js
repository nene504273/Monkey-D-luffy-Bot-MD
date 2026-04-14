// plugins/pinterest-buscador.js
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    // Verificar que se haya escrito un término de búsqueda
    if (!args[0]) {
        return conn.sendMessage(m.chat, { 
            text: `❌ *Escribe lo que quieres buscar*\nEjemplo: ${usedPrefix + command} luffy gear 5` 
        }, { quoted: m });
    }

    // Construir el término de búsqueda (agregar "Pin " al inicio como requiere la API)
    const query = args.join(' ');
    const searchTerm = `Pin ${query}`;
    const apiKey = 'LUFFY-GEAR4';
    const apiUrl = `https://api.alyacore.xyz/dl/pinterest?url=${encodeURIComponent(searchTerm)}&key=${LUFFY-GEAR4}`;

    try {
        // Hacer la petición a la API
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        // La estructura de respuesta puede variar. Asumimos que viene un array de imágenes.
        // Si la API devuelve un objeto con 'result', 'data' o similar, ajústalo.
        const images = data.result || data.data || data.images || data;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return conn.sendMessage(m.chat, { text: '⚠️ No se encontraron resultados para esa búsqueda.' }, { quoted: m });
        }

        // Tomamos las primeras 5 imágenes (o el límite que desees)
        const maxImages = 5;
        const selected = images.slice(0, maxImages);

        // Enviar cada imagen como mensaje multimedia
        for (const item of selected) {
            // Intentamos obtener la URL de la imagen (propiedades comunes)
            const imageUrl = item.image || item.url || item.media_url || item.src || item.thumbnail;
            const title = item.title || item.description || 'Pinterest';

            if (imageUrl) {
                await conn.sendMessage(m.chat, {
                    image: { url: imageUrl },
                    caption: `📌 *${title}*\n🔗 ${item.link || item.pin_url || ''}`.trim()
                }, { quoted: m });
            } else {
                // Si no hay URL de imagen, enviamos solo el enlace del pin
                if (item.link || item.pin_url) {
                    await conn.sendMessage(m.chat, { 
                        text: `📌 *${title}*\n🔗 ${item.link || item.pin_url}` 
                    }, { quoted: m });
                }
            }
            // Pequeña pausa para evitar spam de mensajes
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Mensaje final
        await conn.sendMessage(m.chat, { 
            text: `✅ Se mostraron ${selected.length} resultados de *${query}*` 
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        conn.sendMessage(m.chat, { 
            text: `❌ *Error al conectar con la API*\n${error.message}` 
        }, { quoted: m });
    }
};

// Configuración del comando
handler.help = ['pinterest <búsqueda>'];
handler.tags = ['buscador', 'descargas'];
handler.command = ['pin'];
handler.limit = false;  // Cambia a true si quieres que gaste límites

export default handler;