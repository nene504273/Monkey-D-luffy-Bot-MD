import { sticker } from '../lib/sticker.js';
import axios from 'axios';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchSticker = async (text, attempt = 1) => {
    try {
        // Usamos una URL que permite parámetros de estilo si el API lo soporta, 
        // o simplemente el endpoint base que por defecto genera el estilo de la imagen.
        const response = await axios.get(`https://kepolu-brat.hf.space/brat`, {
            params: { q: text },
            responseType: 'arraybuffer',
            timeout: 10000 // 10 segundos de timeout
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 429 && attempt <= 3) {
            const retryAfter = error.response.headers['retry-after'] || 2;
            await delay(retryAfter * 1000);
            return fetchSticker(text, attempt + 1);
        }
        throw error;
    }
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validamos que haya texto
    if (!text) return conn.reply(m.chat, `*¿Qué texto quieres poner?*\n\nEjemplo: ${usedPrefix + command} Hola Mundo`, m);

    try {
        // Enviamos una reacción o aviso de que se está procesando
        await m.react('⏳');

        const buffer = await fetchSticker(text);
        
        // Obtenemos los metadatos del pack de stickers del usuario o del sistema
        let userId = m.sender;
        let userStats = global.db.data.users[userId] || {};
        let packname = userStats.text1 || global.packname || 'Brat Bot';
        let author = userStats.text2 || global.author || '@usuario';

        // Convertimos el buffer de imagen a un sticker de WhatsApp (.webp)
        // El segundo parámetro 'false' es para no mantener la proporción si quieres que sea cuadrado
        let stiker = await sticker(buffer, false, packname, author);

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
            await m.react('✅');
        } else {
            throw new Error("El conversor de sticker no devolvió nada.");
        }

    } catch (error) {
        console.error(error);
        await m.react('❌');
        return conn.reply(m.chat, `*Ocurrió un error:* ${error.message}`, m);
    }
};

handler.command = ['brat'];
handler.tags = ['sticker'];
handler.help = ['brat <texto>'];

export default handler;