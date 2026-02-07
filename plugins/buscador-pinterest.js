// powerde by Ander 
import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(conn, jid, medias, options = {}) {
    if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`);
    if (medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para un álbum");
    const caption = options.text || options.caption || "";
    const delay = !isNaN(options.delay) ? options.delay : 500;
    const quoted = options.quoted || null;
    delete options.text;
    delete options.caption;
    delete options.delay;
    delete options.quoted;
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
    if (!text) return conn.reply(m.chat, `✎ Uso Correcto: \n> ${usedPrefix + command} Goku`, m, global.rcanal);
    await m.react('⏳');
    conn.reply(m.chat, '✎ Descargando imágenes de Pinterest...', m);
    try {
        const res = await fetch(`https://rest.alyabotpe.xyz/search/pinterest?query=${encodeURIComponent(text)}&key=${apikey}`);
        
        if (!res.ok) {
            throw new Error(`Error en la API: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        
        if (!data.status || data.status !== true || !Array.isArray(data.data) || data.data.length < 2) {
            return conn.reply(m.chat, '✎ No se encontraron suficientes imágenes para un álbum.', m, global.rcanal);
        }
        
        const images = data.data.slice(0, 10).map(img => ({ 
            type: "image", 
            data: { url: img.hd } 
        }));
        
        const caption = `✎ *Resultados de búsqueda para:* ${text}`;
        await sendAlbumMessage(conn, m.chat, images, { caption, quoted: m });
        await m.react('✅');
    } catch (error) {
        console.error('Error en pinterest:', error);
        await m.react('❌');
        conn.reply(m.chat, '✎ Hubo un error al obtener las imágenes de Pinterest.', m, global.rcanal);
    }
};

pinterest.help = ['pinterest <query>'];
pinterest.tags = ['buscador', 'descargas'];
pinterest.command = ['pinterest', 'pin'];
pinterest.register = true;

export default pinterest;