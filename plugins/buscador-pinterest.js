// powered by Ander & Gemini
import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(conn, jid, medias, options = {}) {
    const { generateWAMessageFromContent, generateWAMessage, delay } = baileys;
    
    // Generar el mensaje contenedor del álbum
    const album = await generateWAMessageFromContent(
        jid,
        { 
            messageContextInfo: {}, 
            albumMessage: { expectedImageCount: medias.length } 
        },
        options.quoted ? { quoted: options.quoted } : {}
    );

    await conn.relayMessage(jid, album.message, { messageId: album.key.id });

    for (let i = 0; i < medias.length; i++) {
        const { type, data } = medias[i];
        const img = await generateWAMessage(
            jid,
            { [type]: data, ...(i === 0 ? { caption: options.caption || "" } : {}) },
            { upload: conn.waUploadToServer }
        );
        
        img.message.messageContextInfo = {
            messageAssociation: { 
                associationType: 1, 
                parentMessageKey: album.key 
            },
        };

        await conn.relayMessage(jid, img.message, { messageId: img.key.id });
        await new Promise(resolve => setTimeout(resolve, options.delay || 500));
    }
    return album;
}

const pinterest = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `✎ *Uso Correcto:*\n> ${usedPrefix + command} Goku`, m);

    await m.react('⏳');

    try {
        const apikey = "LUFFY-GEAR5";
        const apiUrl = `https://rest.alyabotpe.xyz/search/pinterest?query=${encodeURIComponent(text)}&key=${apikey}`;
        
        const response = await fetch(apiUrl);
        const res = await response.json();

        // Extracción segura del array de imágenes
        // Intentamos: res.data, res.result o el objeto raíz si es array
        const rawData = res.data || res.result || (Array.isArray(res) ? res : null);

        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            await m.react('❌');
            return conn.reply(m.chat, '✎ No encontré resultados para tu búsqueda.', m);
        }

        // Mapeo y filtrado estricto: solo tomamos lo que sea una URL válida
        const images = rawData
            .map(item => {
                const url = typeof item === 'string' ? item : (item.hd || item.url || item.image);
                return url ? { type: 'image', data: { url } } : null;
            })
            .filter(item => item !== null)
            .slice(0, 10); // Máximo 10 para no saturar

        if (images.length < 2) {
            // Si hay 1 sola, la enviamos normal para que el comando "sirva" sí o sí
            if (images.length === 1) {
                await conn.sendMessage(m.chat, { image: images[0].data, caption: `✎ *Resultado único para:* ${text}` }, { quoted: m });
                return await m.react('✅');
            }
            throw new Error("No hay suficientes imágenes válidas");
        }

        // Enviar el álbum
        await sendAlbumMessage(conn, m.chat, images, { 
            caption: `✎ *Resultados para:* ${text}`, 
            quoted: m 
        });
        
        await m.react('✅');

    } catch (e) {
        console.error("Error en Pinterest Command:", e);
        await m.react('❌');
        conn.reply(m.chat, '✎ Ocurrió un error al procesar el álbum.', m);
    }
};

pinterest.help = ['pinterest <query>'];
pinterest.tags = ['buscador'];
pinterest.command = ['pinterest', 'pin'];
pinterest.register = true;

export default pinterest;