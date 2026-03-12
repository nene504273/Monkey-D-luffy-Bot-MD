import axios from 'axios';

async function pinterestScraper(query) {
    // Intentamos con una URL de búsqueda más directa
    const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D`;
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        });

        // Pinterest a veces devuelve los datos en una estructura ligeramente distinta
        const pins = response.data?.resource_response?.data?.results || [];
        
        return pins.map(p => ({
            title: p.grid_title || p.title || 'Pin',
            url: p.images?.orig?.url || p.images?.['736x']?.url
        })).filter(p => p.url);

    } catch (error) {
        console.error("Error en Scraper:", error.message);
        return [];
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`¿Qué buscas? 🤨\nEjemplo: *${usedPrefix + command}* loli`);

    try {
        await m.react('🕒');
        
        const res = await pinterestScraper(text);

        if (!res || res.length === 0) {
            await m.react('❌');
            return m.reply('❌ No se encontró nada. Pinterest está bloqueando la conexión o la palabra es inválida.');
        }

        // Tomamos solo las primeras 10
        const images = res.slice(0, 10);

        for (let i = 0; i < images.length; i++) {
            await conn.sendMessage(m.chat, { 
                image: { url: images[i].url }, 
                caption: i === 0 ? `📌 *Resultados:* ${text}\n(Enviando 10 fotos en grupo...)` : null 
            }, { quoted: m });
        }

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('✖️');
        m.reply('Mierda, hubo un error interno. Intenta más tarde.');
    }
};

handler.help = ['pin <texto>'];
handler.tags = ['descargas'];
handler.command = ['pin', 'pinterest']; 
handler.group = true;

export default handler;