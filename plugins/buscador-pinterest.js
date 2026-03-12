const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

const PINTEREST_API_KEY = 'causa-f8289f3a4ffa44bb';
const PINTEREST_API_URL = 'https:                                              

module.exports = {
  name: '//api.causas.com/api/v1/buscadores/pinterest';

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

      await m.reply(`🔍 *Buscando:* "${text}"...\n\n⏳ Un momento...`);

      const apiUrl = `${PINTEREST_API_URL}?apikey=${PINTEREST_API_KEY}&q=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.status || !data.data || data.total === 0) {
        return m.reply('❌ *Error:* No se encontraron resultados o la API está sin conexión.');
      }

      const resultados = data.data;
      const maxImages = Math.min(resultados.length, 5);

      for (let i = 0; i < maxImages; i++) {
        const item = resultados[i];
        try {
          const media = await MessageMedia.fromUrl(item.image);
          const caption = `📌 *${item.title || 'Pinterest'}*\n\n🔗 ${item.link}`;
          await client.sendMessage(m.from, media, { caption });
        } catch (err) {
          console.error(`Error imagen ${i + 1}:`, err.message);
          await m.reply(`📎 *Imagen ${i + 1}:*\n${item.link}`);
        }
      }

      await m.reply(`✅ *¡Listo!* Se enviaron ${maxImages} imágenes.`);
    } catch (error) {
      console.error('Error en Pinterest:', error.response?.data || error.message);
      m.reply('❌ *Error:* Ocurrió un problema al buscar en Pinterest.');
    }
  }
};