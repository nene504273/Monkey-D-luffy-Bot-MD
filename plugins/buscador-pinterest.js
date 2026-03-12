const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

const PINTEREST_API_KEY = 'causa-f8289f3a4ffa44bb';
const PINTEREST_API_URL = 'https://api.causas.com/api/v1/buscadores/pinterest';

module.exports = {
    name: 'pinterest',
    alias: ['pin', 'pint'],
    desc: 'Buscar imágenes en Pinterest',
    category: 'search',
    usage: '!pinterest <búsqueda>',
    async exec(client, m, text, { command, prefix }) {
        try {
            if (!text) {
                return m.reply(`❌ *Error:* Ingresa lo que quieres buscar\n\n💡 *Ejemplo:*\n${prefix}${command} Nami One Piece`);
            }

            // Mensaje de búsqueda
            await m.reply(`🔍 *Buscando:* "${text}"...\n\n⏳ Un momento...`);

            // Llamada a la API
            const apiUrl = `${PINTEREST_API_URL}?apikey=${PINTEREST_API_KEY}&q=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.data || data.total === 0) {
                return m.reply('❌ *Error:* No se encontraron resultados o la API está sin conexión.');
            }

            const total = data.total;
            const resultados = data.data;

            await m.reply(`✅ *Resultados:* ${total}\n\n📌 Enviando imágenes...`);

            // Enviar hasta 5 imágenes
            const maxImages = Math.min(total, 5);
            let enviadas = 0;

            for (let i = 0; i < maxImages; i++) {
                const item = resultados[i];
                
                try {
                    // Descargar imagen
                    const response = await axios.get(item.image.trim(), {
                        responseType: 'arraybuffer',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const base64 = Buffer.from(response.data).toString('base64');
                    const mimeType = response.headers['content-type'];
                    const media = new MessageMedia(mimeType, base64, 'pinterest.jpg');

                    const caption = `📌 *${item.title || 'Pinterest'}*\n\n🔗 ${item.link}\n\n✨ ${i + 1}/${maxImages}`;
                    
                    await client.sendMessage(m.from, media, { caption });
                    enviadas++;

                    // Esperar 2 segundos entre imágenes
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (err) {
                    console.error(`Error imagen ${i + 1}:`, err.message);
                    // Enviar solo el link si falla
                    await m.reply(`📎 *Imagen ${i + 1}:*\n${item.link}`);
                }
            }

            if (enviadas > 0) {
                await m.reply(`✅ *¡Listo!* Se enviaron ${enviadas} imágenes.\n\n💡 Usa: ${prefix}${command} <búsqueda>`);
            }

        } catch (error) {
            console.error('Error en Pinterest:', error);
            m.reply('❌ *Error:* Ocurrió un problema al buscar en Pinterest.');
        }
    }
};