import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

const NEVI_API_URL = 'http://neviapi.ddns.net:5000';
const NEVI_API_KEY = 'ellen';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verificación al estilo Luffy
    if (!text) return conn.reply(m.chat, `*🍖 ¡Oye! Necesito saber qué buscar, nakama.*\n*Uso:* ${usedPrefix + command} Luffy Gear 5`, m);

    await m.react('🏴‍☠️');
    
    // Mensaje de espera con toque pirata
    await conn.reply(m.chat, '🌊 *¡Zarpando a Pinterest para buscar tus tesoros!* ⚓', m);

    try {
        // Petición a la Nevi API
        const res = await fetch(`${NEVI_API_URL}/api/pinterest?q=${encodeURIComponent(text)}&apikey=${NEVI_API_KEY}`);
        const json = await res.json();

        // Extraer datos (maneja diferentes formatos de respuesta)
        const data = json.result || json.data || json;

        if (!Array.isArray(data) || data.length < 2) {
            await m.react('❌');
            return conn.reply(m.chat, '🏜️ *¡Rayos! No encontré ningún botín. Intenta con otra búsqueda.*', m);
        }

        // Seleccionamos máximo 10 imágenes (el tesoro de la tripulación)
        const images = data.slice(0, 10).map(img => ({
            type: "image",
            data: { url: typeof img === 'string' ? img : img.image_large_url || img.url }
        }));

        const caption = `👒 *PINTEREST - BÚSQUEDA PIRATA* 👒\n\n⚓ *Tesoro:* ${text}\n💎 *Botín:* ${images.length} Imágenes encontradas\n\n*¡Soy el hombre que se convertirá en el Rey de los Piratas!* 👑`;
        
        // Ejecutar el envío del álbum
        await sendAlbumMessage(m.chat, images, { caption, quoted: m }, conn);

        await m.react('🍖');
    } catch (error) {
        console.error(error);
        await m.react('✖️');
        conn.reply(m.chat, '🌪️ *¡Una tormenta nos detuvo! La API no respondió correctamente.*', m);
    }
};

// Función de Álbum nativa optimizada para Sub-bots y Bots Oficiales
async function sendAlbumMessage(jid, medias, options = {}, conn) {
    const { generateWAMessageFromContent, generateWAMessage } = baileys;
    
    if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`);
    const caption = options.text || options.caption || "";
    const waitTime = !isNaN(options.delay) ? options.delay : 500;

    // Crear el mensaje base del álbum
    const album = await generateWAMessageFromContent(
        jid,
        { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.length } },
        { userJid: conn.user.id, quoted: options.quoted }
    );

    await conn.relayMessage(jid, album.message, { messageId: album.key.id });

    // Enviar cada pieza del botín
    for (let i = 0; i < medias.length; i++) {
        const { type, data } = medias[i];
        const img = await generateWAMessage(
            jid,
            { [type]: data, ...(i === 0 ? { caption } : {}) },
            { upload: conn.waUploadToServer }
        );
        img.message.messageContextInfo = {
            messageAssociation: { associationType: 1, parentMessageKey: album.key },
        };
        await conn.relayMessage(jid, img.message, { messageId: img.key.id });
        
        // Pequeña pausa para no saturar a los nakamas
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    return album;
}

handler.help = ['pinterest <búsqueda>'];
handler.tags = ['search', 'anime'];
handler.command = /^(pinterest|pin)$/i;
handler.register = true;

export default handler;