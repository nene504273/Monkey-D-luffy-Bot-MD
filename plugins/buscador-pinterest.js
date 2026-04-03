import axios from 'axios';

// Función para obtener las imágenes de Pinterest
async function pinterestScraper(query, limit = 10) {
    const url = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%2C%22rs%22%3A%22typed%22%7D%2C%22context%22%3A%7B%7D%7D`;
    
    const headers = {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
        'referer': 'https://id.pinterest.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'x-app-version': 'c056fb7',
        'x-pinterest-appstate': 'active',
        'x-pinterest-pws-handler': 'www/index.js',
        'x-pinterest-source-url': '/',
        'x-requested-with': 'XMLHttpRequest'
    };

    const response = await axios.get(url, { headers });
    if (!response.data?.resource_response?.data?.results) return [];

    const results = response.data.resource_response.data.results.map(pin => {
        if (!pin.images) return null;
        const keys = Object.keys(pin.images);
        const key = keys.find(k => /4\d{2}x|5\d{2}x|6\d{2}x/.test(k)) || keys[0];
        
        return {
            title: pin.grid_title || pin.title || 'Sin título',
            image_large_url: pin.images.orig?.url || null,
            image_medium_url: pin.images[key]?.url || null,
            image_small_url: pin.images['236x']?.url || null
        };
    }).filter(Boolean);

    // Retorna solo la cantidad de imágenes requeridas
    return results.slice(0, limit);
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply('(*∩_∩*) ⍴᥆r 𝖿ᥲ᥎᥆r, іᥒgrᥱsᥲ ᥣ᥆ 𝗊ᥙᥱ ძᥱsᥱᥲs ᑲᥙsᥴᥲr ⍴᥆r ⍴іᥒ𝗍ᥱrᥱs𝗍 🏴‍☠️');

    try {
        await m.react('🕒');
        
        // Obtenemos 10 resultados para asegurar que WhatsApp forme un álbum (requiere 4+)
        const results = await pinterestScraper(text, 10);

        if (!results.length) {
            return conn.reply(m.chat, `❀ ✧ No se encontraron resultados para «${text}»`, m);
        }

        // 1. Enviamos primero el texto para no ensuciar las imágenes
        const infoMsg = `(*ˊᗜˋ*) ᑲᥙ́s𝗊ᥙᥱძᥲ ᥊ ⍴іᥒ𝗍ᥱrᥱs𝗍\n\n✧ 📌 𝗍і𝗍ᥙᥣ᥆ » «${text}»\n✐ 💎 rᥱsᥙᥣ𝗍ᥲძ᥆s » ${results.length} іmᥲ́gᥱᥒᥱs ᥱᥒᥴ᥆ᥒ𝗍rᥲძᥲs`;
        await conn.reply(m.chat, infoMsg, m);

        // 2. Enviamos las imágenes limpias, SIN caption y SIN citar a nadie para que formen el álbum
        for (let i = 0; i < results.length; i++) {
            if (results[i].image_large_url) {
                await conn.sendMessage(m.chat, {
                    image: { url: results[i].image_large_url }
                });
            }
        }

        await m.react('✔️');
    } catch (error) {
        await m.react('✖️');
        conn.reply(m.chat, `⚠︎ ❀ Se ha producido un error ❀\n> Usa *report* para informarlo.\n\n${usedPrefix}${command} ${error.message}`, m);
    }
};

handler.help = ['pinterest <texto>'];
handler.tags = ['descargas'];
handler.command = ['pinterest', 'pin'];
handler.group = true;

export default handler;