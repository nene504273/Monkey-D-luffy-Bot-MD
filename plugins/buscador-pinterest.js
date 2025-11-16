import axios from 'axios';
// Destructuring generateWAMessageContent, generateWAMessageFromContent, proto directly from baileys
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import("@whiskeysockets/baileys"))["default"];

// --- CONSTANTES DE CONFIGURACIÓN DE TU BOT ---
const newsletterJid = '120363418071540900@newsletter';
const newsletterName = '🏴‍☠️ Gomu Gomu no Bot (Luffy\'s Crew)';

// --- CONFIGURACIÓN DE LA API DE PYTHON ---
const NEVI_API_URL = 'http://neviapi.ddns.net:5000';
const NEVI_API_KEY = 'ellen'; // Usa tu clave API real
// ------------------------------------------

// --- FUNCIONES AUXILIARES (Necesarias para el carrusel) ---
// Estas funciones DEBEN seguir existiendo y ser accesibles en tu bot.
async function getImageMessage(imageUrl) { 
    const { imageMessage } = await generateWAMessageContent({
        'image': { 'url': imageUrl }
    }, { 'upload': conn.waUploadToServer });
    return imageMessage;
}
function shuffleArray(array) { 
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// -----------------------------------------------------------


let handler = async (m, { conn, text, usedPrefix, command }) => {
    const name = conn.getName(m.sender);
    const BOT_LUFFY_TITLE = '¡El Sombrero de Paja ha localizado un mapa! 🗺️'; // Nuevo título

    const contextInfo = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName,
            serverMessageId: -1
        },
        externalAdReply: {
            title: BOT_LUFFY_TITLE,
            body: `¡Buscando el One Piece visual para el/la Nakama ${name}! 🍖`,
            thumbnail: icons, // Asume que 'icons' y 'redes' existen
            sourceUrl: redes,
            mediaType: 1,
            renderLargerThumbnail: false
        }
    };

    if (!text) {
        return conn.reply(m.chat, `🍖 *¡OYE, ${name}!* ¡No puedo encontrar el tesoro si no me dices qué buscar! Dame un mapa (un término de búsqueda).`, m, { contextInfo, quoted: m });
    }

    await m.react('🏴‍☠️');
    
    // MENSAJE ACTUALIZADO: Indicando que se llama a la API con estilo Luffy.
    conn.reply(m.chat, `🔄 *¡GOMU GOMU NO... BÚSQUEDA!* Iniciando el barrido del Gran Línea (vía API Python), Nakama ${name}. ¡Espera, el mapa visual está cargando!`, m, { contextInfo, quoted: m });

    try {
        const apiEndpoint = `${NEVI_API_URL}/pinterest`;
        
        // 1. LLAMADA A LA API DE PYTHON
        const res = await axios.post(apiEndpoint, { query: text }, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': NEVI_API_KEY,
            }
        });

        const json = res.data;
        
        // 2. VERIFICAR LA RESPUESTA
        if (json.status === "success" && Array.isArray(json.urls)) {
            let imageUrls = json.urls;

            shuffleArray(imageUrls);
            let selectedImages = imageUrls.splice(0, 5);

            if (selectedImages.length === 0) {
                await m.react('😭'); // Reacción de tristeza de Luffy
                return conn.reply(m.chat, `😭 *¡No hay carne!* El mapa visual no arrojó resultados, Nakama ${name}. ¡Parece que el tesoro no estaba allí!`, m, { contextInfo, quoted: m });
            }

            // 3. Lógica de Carousel (Envío de Mensajes)
            let carouselCards = [];
            let imageCounter = 1;

            for (let imageUrl of selectedImages) {
                carouselCards.push({
                    'body': proto.Message.InteractiveMessage.Body.fromObject({
                        'text': `Vista de ${text} - ${imageCounter++}`
                    }),
                    'footer': proto.Message.InteractiveMessage.Footer.fromObject({
                        'text': `¡Encontrado por los Piratas del Sombrero de Paja! (Vía API)`
                    }),
                    'header': proto.Message.InteractiveMessage.Header.fromObject({
                        'title': '',
                        'hasMediaAttachment': true,
                        'imageMessage': await getImageMessage(imageUrl)
                    }),
                    'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        'buttons': [{
                            'name': "cta_url",
                            'buttonParamsJson': JSON.stringify({
                                "display_text": "¡Izando la Bandera! 🏴‍☠️",
                                "url": `https://www.pinterest.com/search/pins/?rs=typed&q=${encodeURIComponent(text)}`,
                                "merchant_url": `https://www.pinterest.com/search/pins/?rs=typed&q=${encodeURIComponent(text)}`
                            })
                        }]
                    })
                });
            }

            const carouselMessage = generateWAMessageFromContent(m.chat, {
                'viewOnceMessage': {
                    'message': {
                        'messageContextInfo': {
                            'deviceListMetadata': {},
                            'deviceListMetadataVersion': 2
                        },
                        'interactiveMessage': proto.Message.InteractiveMessage.fromObject({
                            'body': proto.Message.InteractiveMessage.Body.create({
                                'text': `╭━━━━[ ¡EL ONE PIECE VISUAL HA SIDO ENCONTRADO! 💰 ]━━━━⬣\n🖼️ *Mapa del Tesoro (Término):* ${text}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
                            }),
                            'footer': proto.Message.InteractiveMessage.Footer.create({
                                'text': "⪛✰ ¡Yo seré el Rey de los Piratas! - Gomu Gomu no Bot ✰⪜"
                            }),
                            'header': proto.Message.InteractiveMessage.Header.create({
                                'hasMediaAttachment': false
                            }),
                            'carouselMessage': proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                                'cards': carouselCards
                            })
                        })
                    }
                }
            }, { 'quoted': m });

            await m.react('✅');
            await conn.relayMessage(m.chat, carouselMessage.message, { 'messageId': carouselMessage.key.id });
        
        } else {
            // Error devuelto por la API
             throw new Error(`[${json.status}] ${json.message || 'La API devolvió un estado de error sin mensaje.'}`);
        }


    } catch (error) {
        console.error("Error al llamar a la API de Pinterest:", error);
        await m.react('💥'); // Reacción de explosión/pelea

        // Manejar errores específicos de la API y de conexión
        const apiErrorMessage = error.response?.data?.message || '¡No pudimos atracar en el puerto del servidor!';
        
        conn.reply(m.chat, `⚠️ *¡ALERTA DE MARINA! Fallo de Conexión, Nakama ${name}.*\nEl equipo de Nico Robin no pudo descifrar el Poneglyph (API Python).\nDetalles: ${apiErrorMessage}`, m, { contextInfo, quoted: m });
    }
};

handler.help = ["pinterest <término>"];
handler.tags = ["descargas"];
handler.coin = 1;
handler.group = true;
handler.register = true;
handler.command = ['pinterest', 'pin', 'tesorovisual']; // Añadí 'tesorovisual'

export default handler;