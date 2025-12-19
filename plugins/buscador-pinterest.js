import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(jid, medias, options = {}) {
    if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`);
    if (medias.length < 2) throw new RangeError("¡Oi! Se necesitan al menos 2 imágenes para armar el tesoro");

    const caption = options.text || options.caption || "";
    const delay = !isNaN(options.delay) ? options.delay : 500;
    delete options.text;
    delete options.caption;
    delete options.delay;

    const album = baileys.generateWAMessageFromContent(
        jid,
        { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.length } },
        {}
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

const pinterest = async (m, { conn, text, usedPrefix, command }) => {
    // Estilo Luffy: Uso de "Nakama", "Pirata" y comida
    if (!text) return conn.reply(m.chat, `*🍖 ¡Oi Nakama! Olvidaste decirme qué buscar: ${usedPrefix + command} One Piece*`, m, global.rcanal);

    await m.react('👒'); // Sombrero de paja
    conn.reply(m.chat, '🌊 *¡Zarpando a Pinterest para buscar tu tesoro...!* 🍖', m, {
        contextInfo: {
            externalAdReply: {
                mediaUrl: null,
                mediaType: 1,
                showAdAttribution: true,
                title: '🏴‍☠️ ¡SOY EL PRÓXIMO REY DE LOS PIRATAS!',
                body: 'Buscando imágenes para mi tripulación...',
                previewType: 0,
                thumbnail: icons,
                sourceUrl: channel
            }
        }
    });

    try {
        const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length < 2) {
            return conn.reply(m.chat, '💀 *¡Rayos! No encontré ningún tesoro con ese nombre.*', m, global.rcanal);
        }

        const images = data.slice(0, 10).map(img => ({ type: "image", data: { url: img.image_large_url } }));

        const caption = `👒 *¡TESORO ENCONTRADO!* 🍖\n✨ *Búsqueda:* ${text}\n\n_¡Aquí tienes tus imágenes, Nakama!_`;
        await sendAlbumMessage(m.chat, images, { caption, quoted: m });

        await m.react('🍖'); // Carne para celebrar
    } catch (error) {
        console.error(error);
        await m.react('⛈️');
        conn.reply(m.chat, '🚢 *¡Tormenta a la vista! Hubo un error al navegar por Pinterest.*', m , global.rcanal);
    }
};

pinterest.help = ['pinterest <query>'];
pinterest.tags = ['buscador', 'descargas'];
pinterest.command = /^(pinterest|pin)$/i;
pinterest.register = true;

export default pinterest;