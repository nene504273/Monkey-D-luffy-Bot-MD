const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

const PINTEREST_API_KEY = 'causa-f8289f3a4ffa44bb';
const PINTEREST_API_URL = 'https://api.causas.com/api/v1/buscadores/pinterest';

const handler = async (client, m, text, { command, prefix }) => {
    try {
        if (!text) {
            return m.reply(`❌ *Error:* Ingresa lo que quieres buscar\n\n💡 *Ejemplo:*\n${prefix}${command} Luffy Gear 5`);
        }

        // Mensaje de espera
        await m.reply(`🔍 *Buscando:* "${text}"...\n\n⏳ Un momento...`);

        // Petición a la API
        const { data } = await axios.get(`${PINTEREST_API_URL}?apikey=${PINTEREST_API_KEY}&q=${encodeURIComponent(text)}`);

        if (!data.status || !data.data || data.data.length === 0) {
            return m.reply('❌ *Error:* No se encontraron resultados.');
        }

        const resultados = data.data;
        const maxImages = Math.min(resultados.length, 5);
        let enviadas = 0;

        for (let i = 0; i < maxImages; i++) {
            const item = resultados[i];
            const imageUrl = item.image?.trim();

            if (!imageUrl) continue;

            try {
                const response = await axios.get(imageUrl, {
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
                    }
                });

                const base64 = Buffer.from(response.data).toString('base64');
                const mimeType = response.headers['content-type'] || 'image/jpeg';
                const media = new MessageMedia(mimeType, base64, `pin_${Date.now()}.jpg`);

                const caption = `📌 *${item.title || 'Pinterest'}*\n\n🔗 ${item.link || 'Sin link'}\n✨ ${i + 1}/${maxImages}`;

                await client.sendMessage(m.from, media, { caption });
                enviadas++;

                // Pequeña pausa entre imágenes
                if (i < maxImages - 1) await new Promise(res => setTimeout(res, 2000));

            } catch (err) {
                console.error(`Error en imagen ${i + 1}:`, err.message);
                if (item.link) await m.reply(`📎 *Link:* ${item.link}`);
            }
        }

        if (enviadas > 0) {
            await m.reply(`✅ *¡Listo!* Se enviaron ${enviadas} imágenes.`);
        }

    } catch (error) {
        console.error('Error:', error);
        m.reply('❌ Ocurrió un error al procesar la búsqueda.');
    }
};

// Configuración del comando al final para el Handler
handler.name = 'pinterest';
handler.alias = ['pin', 'pint'];
handler.desc = 'Buscar imágenes en Pinterest';
handler.category = 'search';
handler.usage = '!pinterest <búsqueda>';

module.exports = handler;