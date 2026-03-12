import axios from 'axios';

/**
 * Scraper de Pinterest - Extrae imágenes en alta resolución
 * @param {String} query - Término de búsqueda
 * @returns {Array} - Lista de objetos con título y URL
 */
async function pinterestScraper(query) {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0'
    ];

    const url = `https://www.pinterest.com/resource/BaseSearchResource/get/`;
    const data = {
        options: {
            query: query,
            scope: "pins",
            rs: "typed"
        },
        context: {}
    };

    try {
        const response = await axios.get(url, {
            params: {
                source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
                data: JSON.stringify(data)
            },
            headers: {
                'user-agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                'referer': 'https://www.pinterest.com/',
                'x-requested-with': 'XMLHttpRequest',
                'accept': 'application/json, text/javascript, */*; q=0.01'
            }
        });

        const results = response.data?.resource_response?.data?.results || [];
        
        return results.map(pin => ({
            title: pin.grid_title || pin.title || 'Pinterest Image',
            url: pin.images.orig?.url || pin.images['736x']?.url
        })).filter(p => p.url);
    } catch (e) {
        console.error("Error en Pinterest Scraper:", e.message);
        return [];
    }
}

/**
 * Handler para Bots de WhatsApp (Baileys/Sub-bots)
 */
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*¡Falta el texto!* 🔍\nEjemplo: ${usedPrefix + command} paisajes aesthetic`;

    try {
        await m.react('🕒');
        
        const results = await pinterestScraper(text);
        // Tomamos las primeras 10 imágenes para formar el álbum
        const images = results.slice(0, 10); 

        if (images.length === 0) {
            await m.react('❌');
            return m.reply('No se encontraron resultados para tu búsqueda.');
        }

        // Enviamos la primera con el caption principal
        await conn.sendMessage(m.chat, { 
            image: { url: images[0].url }, 
            caption: `📌 *Búsqueda:* ${text}\n🖼️ *Cantidad:* ${images.length} imágenes.` 
        }, { quoted: m });

        // Enviamos el resto de forma rápida (sin caption) para que WA genere el álbum
        // Usamos un loop con un delay muy bajo para no saturar el socket
        for (let i = 1; i < images.length; i++) {
            await conn.sendMessage(m.chat, { 
                image: { url: images[i].url }
            }, { quoted: m });
            
            // Delay de seguridad para evitar spam-blocks pero permitir agrupamiento
            if (i < images.length - 1) await new Promise(res => setTimeout(res, 250));
        }

        await m.react('✅');

    } catch (error) {
        console.error("Error en Handler:", error);
        await m.react('✖️');
        m.reply('Hubo un fallo técnico. Intenta de nuevo más tarde.');
    }
};

// Configuración del comando para GitHub/Bot
handler.help = ['pinterest <texto>', 'pin <texto>'];
handler.tags = ['buscadores'];
handler.command = /^(pinterest|pin)$/i; // Acepta tanto .pinterest como .pin
handler.group = false; // Cambia a true si quieres que solo funcione en grupos

export default handler;