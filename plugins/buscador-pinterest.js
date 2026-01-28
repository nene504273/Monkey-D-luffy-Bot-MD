import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

const { generateWAMessageFromContent, generateWAMessage, delay } = baileys;

/**
 * Función para enviar álbumes de fotos/videos de forma simplificada
 */
async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError("El JID debe ser un string.");
  if (medias.length < 2) throw new RangeError("Se requieren al menos 2 medios para un álbum.");

  const caption = options.text || options.caption || "";
  const albumDelay = 500;

  // Configuración de la cita (quoted)
  const quotedMessageOptions = options.quoted ? {
    contextInfo: {
      remoteJid: options.quoted.key.remoteJid,
      fromMe: options.quoted.key.fromMe,
      stanzaId: options.quoted.key.id,
      participant: options.quoted.key.participant || options.quoted.key.remoteJid,
      quotedMessage: options.quoted.message,
    }
  } : {};

  // Crear mensaje contenedor del álbum
  const album = generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: {
        expectedImageCount: medias.filter(m => m.type === "image").length,
        expectedVideoCount: medias.filter(m => m.type === "video").length,
        ...quotedMessageOptions,
      },
    },
    {}
  );

  await conn.relayMessage(jid, album.message, { messageId: album.key.id });

  // Enviar cada medio del álbum
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
    await delay(albumDelay);
  }
  return album;
}

/**
 * Handler principal
 */
let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('✨ *Luffy-MD* | Ingresa lo que deseas buscar.\n\nEjemplo: *.pin anime*');

  try {
    await m.react('🔍');

    const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
    if (!res.ok) throw new Error();
    
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return m.reply('❌ No se encontraron imágenes.');
    }

    // Máximo 12 imágenes para un álbum equilibrado
    const max = Math.min(data.length, 12);
    const medias = data.slice(0, max).map(item => ({
      type: 'image',
      data: { url: item.image_large_url || item.image_medium_url || item.image_small_url }
    }));

    await sendAlbumMessage(conn, m.chat, medias, {
      caption: `🏴‍☠️ *LUFFY - PINTEREST*\n\n🔍 *Búsqueda:* ${text}\n🖼️ *Imágenes:* ${max}`,
      quoted: m
    });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('✖️');
    m.reply('⚠️ Error al buscar imágenes.');
  }
};

handler.help = ['pin'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];
handler.register = true;

export default handler;