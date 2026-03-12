import axios from 'axios';

// Función Scraper Limpia
async function pinterestScraper(query, count = 10) {
    const url = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}&data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%7D%2C%22context%22%3A%7B%7D%7D`;
    
    const headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    };

    try {
        const response = await axios.get(url, { headers });
        const results = response.data?.resource_response?.data?.results || [];
        
        return results.map(pin => ({
            title: pin.grid_title || pin.title || 'Sin título',
            url: pin.images.orig?.url || null
        })).filter(p => p.url).slice(0, count);
    } catch (e) {
        return [];
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Si no hay texto, avisar
    if (!text) return m.reply(`(*∩_∩*) ¡Escribe lo que buscas!\nEjemplo: *${usedPrefix + command}* anime`);

    try {
        await m.react('🕒');
        const res = await pinterestScraper(text, 10); 

        if (!res.length) return m.reply('No encontré nada, intenta con otra palabra.');

        // Enviamos las 10 fotos. 
        // Al enviarlas rápido y sin caption a partir de la segunda, 
        // WhatsApp las agrupa automáticamente en un álbum de cuadrícula.
        for (let i = 0; i < res.length; i++) {
            await conn.sendMessage(m.chat, { 
                image: { url: res[i].url }, 
                caption: i === 0 ? `📌 *Resultados para:* ${text}\n✨ *Total:* ${res.length} imágenes` : null 
            }, { quoted: m });
        }

        await m.react('✅');
    } catch (e) {
        await m.react('✖️');
        console.error(e);
    }
};

// ATRIBUTOS DEL COMANDO
handler.help = ['pin <texto>', 'pinterest <texto>'];
handler.tags = ['descargas'];
// Aquí agregamos 'pin' para que no tengas que escribir todo el nombre
handler.command = ['pin', 'pinterest']; 
handler.group = true;

export default handler;