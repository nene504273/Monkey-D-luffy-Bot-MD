import axios from 'axios';

/**
 * Scraper de Pinterest 
 */
async function pinterestScraper(query) {
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
        const { data: response } = await axios.get(url, {
            params: {
                source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
                data: JSON.stringify(data)
            },
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'referer': 'https://www.pinterest.com/',
                'x-requested-with': 'XMLHttpRequest'
            }
        });

        const results = response.resource_response?.data?.results || [];
        return results.map(pin => ({
            title: pin.grid_title || pin.title || 'Pinterest Image',
            url: pin.images.orig?.url || pin.images['736x']?.url
        })).filter(p => p.url);
    } catch (e) {
        return [];
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*¡Falta el texto!* 🔍\nEjemplo: ${usedPrefix + command} anime`;

    try {
        await m.react('🕒');
        const res = await pinterestScraper(text);
        const images = res.slice(0, 10); // Máximo 10 para el álbum

        if (images.length === 0) return m.reply('No se encontraron imágenes.');

        // Enviamos la primera imagen con el texto
        await conn.sendMessage(m.chat, { 
            image: { url: images[0].url }, 
            caption: `📌 *Búsqueda:* ${text}\n🖼️ *Total:* ${images.length} imágenes.` 
        }, { quoted: m });

        // Enviamos las demás rápido para que WA las agrupe
        for (let i = 1; i < images.length; i++) {
            await conn.sendMessage(m.chat, { image: { url: images[i].url } }, { quoted: m });
            // Delay mínimo para evitar que el servidor de WA rechace mensajes
            await new Promise(res => setTimeout(res, 300));
        }

        await m.react('✅');
    } catch (e) {
        await m.react('✖️');
        console.error(e);
    }
};

// --- AJUSTES PARA GITHUB / PRODUCCIÓN ---
handler.help = ['pinterest', 'pin'].map(v => v + ' <texto>');
handler.tags = ['buscadores'];

// Esta línea es la que define si el bot reconoce el comando
// Si usas #pin, esto lo capturará correctamente
handler.command = /^(pinterest|pin)$/i; 

export default handler;