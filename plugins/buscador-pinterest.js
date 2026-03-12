import axios from 'axios';

/**
 * Scraper optimizado de Pinterest
 */
async function pinterestScraper(query) {
    // Es recomendable rotar el User-Agent o usar uno más reciente
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    ];

    const url = `https://www.pinterest.com/resource/BaseSearchResource/get/`;
    const params = {
        source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
        data: JSON.stringify({
            options: {
                query: query,
                scope: "pins",
                rs: "typed"
            },
            context: {}
        })
    };

    try {
        const { data } = await axios.get(url, { 
            params,
            headers: {
                'user-agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                'referer': 'https://www.pinterest.com/',
                'x-requested-with': 'XMLHttpRequest'
            }
        });

        const results = data.resource_response?.data?.results || [];
        
        return results.map(pin => ({
            title: pin.grid_title || pin.title || 'Pinterest Image',
            url: pin.images.orig?.url || pin.images['736x']?.url
        })).filter(p => p.url);
    } catch (e) {
        console.error("Error en Pinterest Scraper:", e.message);
        return [];
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*¡Falta el texto!* 🔍\nEjemplo: ${usedPrefix + command} paisajes aesthetic`;

    try {
        await m.react('🕒');
        
        // Obtenemos hasta 6 imágenes para no saturar
        const images = await pinterestScraper(text);
        const limit = images.slice(0, 6); 

        if (limit.length === 0) {
            await m.react('❌');
            return m.reply('No se encontraron resultados para tu búsqueda.');
        }

        // Enviamos la primera con descripción
        await conn.sendMessage(m.chat, { 
            image: { url: limit[0].url }, 
            caption: `📌 *Búsqueda:* ${text}\n🖼️ *Cantidad:* ${limit.length} imágenes.` 
        }, { quoted: m });

        // Enviamos el resto (Sin caption para que WhatsApp intente agrupar)
        // Usamos un pequeño delay para evitar bloqueos
        for (let i = 1; i < limit.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms de espera
            await conn.sendMessage(m.chat, { 
                image: { url: limit[i].url }
            }, { quoted: m });
        }

        await m.react('✅');

    } catch (error) {
        console.error(error);
        await m.react('✖️');
        m.reply('Hubo un fallo técnico. Intenta más tarde.');
    }
};

handler.help = ['pinterest <texto>', 'pin <texto>'];
handler.tags = ['buscadores'];
handler.command = /^(pinterest|pin)$/i;

export default handler;
