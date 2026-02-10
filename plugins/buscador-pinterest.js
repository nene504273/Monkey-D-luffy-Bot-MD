// powered by Ander 
import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(conn, jid, medias, options = {}) {
    if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`);
    if (medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para un álbum");
    const caption = options.text || options.caption || "";
    const delay = !isNaN(options.delay) ? options.delay : 500;
    const quoted = options.quoted || null;

    const album = baileys.generateWAMessageFromContent(
        jid,
        { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.length } },
        quoted ? { quoted } : {}
    );
    await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

    for (let i = 0; i < medias.length; i++) {
        const { type, data } = medias[i];
        const img = await baileys.generateWAMessage(
            album.key.remoteJid,
            { [type]: data, ...(i === 0 ? { caption } : {}) },
            { upload: conn.waUploadToServer }
        );
        img.message.messageContextInfo = {
            messageAssociation: { associationType: 1, parentMessageKey: album.key },
        };
        await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id });
        await baileys.delay(delay);
    }
    return album;
}

const apikey = "LUFFY-GEAR5"

const pinterest = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `✎ Uso Correcto: \n> ${usedPrefix + command} Goku`, m);
    
    await m.react('⏳');
    
    try {
        const res = await fetch(`https://rest.alyabotpe.xyz/search/pinterest?query=${encodeURIComponent(text)}&key=${apikey}`);
        const json = await res.json();

        // 1. Intentamos obtener el array de datos (algunas APIs usan .data y otras .result)
        const result = json.data || json.result;

        // 2. Validación estricta del contenido
        if (!result || !Array.isArray(result) || result.length < 2) {
            await m.react('❌');
            return conn.reply(m.chat, '✎ No se encontraron suficientes imágenes.', m);
        }

        // 3. Mapeo inteligente (Busca la URL en hd, luego en url, luego el string directo)
        const images = result.slice(0, 10).map(img => {
            const url = (typeof img === 'string') ? img : (img.hd || img.url || img.image);
            return {
                type: "image",
                data: { url: url }
            };
        }).filter(item => item.data.url); // Eliminamos entradas vacías

        if (images.length < 2) {
            await m.react('❌');
            return conn.reply(m.chat, '✎ Las imágenes obtenidas no tienen un formato válido.', m);
        }

        const caption = `✎ *Resultados:* ${text}`;
        await sendAlbumMessage(conn, m.chat, images, { caption, quoted: m });
        await m.react('✅');

    } catch (error) {
        console.error(error);
        await m.react('❌');
        conn.reply(m.chat, '✎ Error interno al procesar el álbum.', m);
    }
};

pinterest.help = ['pinterest <query>'];
pinterest.tags = ['buscador', 'descargas'];
pinterest.command = ['pinterest', 'pin'];
pinterest.register = true;

export default pinterest;