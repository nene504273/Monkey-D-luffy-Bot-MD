import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

const { generateWAMessageFromContent, generateWAMessage, delay } = baileys;

async function sendAlbumMessage(conn, jid, imagenes, options = {}) {
  const album = generateWAMessageFromContent(jid, {
    messageContextInfo: {},
    albumMessage: {
      expectedImageCount: imagenes.length,
      expectedVideoCount: 0,
      ...(options.quoted ? { contextInfo: { ...options.quoted.message, ...options.quoted.key } } : {})
    }
  }, {});

  await conn.relayMessage(jid, album.message, { messageId: album.key.id });

  for (let i = 0; i < imagenes.length; i++) {
    // Aquí tomamos la URL directamente, sin importar el nombre en el JSON
    const url = typeof imagenes[i] === 'string' ? imagenes[i] : (imagenes[i].url || imagenes[i].image || imagenes[i].link);
    
    const img = await generateWAMessage(jid, { 
      image: { url: url }, 
      ...(i === 0 ? { caption: options.caption } : {}) 
    }, { upload: conn.waUploadToServer });
    
    img.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key } };
    await conn.relayMessage(jid, img.message, { messageId: img.key.id });
    await delay(500);
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🍟 Ingresa el texto de lo que quieres buscar.');

  try {
    await m.react('🔍');
    
    const apiKey = 'stellar-LarjcWHD';
    const response = await fetch(`https://rest.alyabotpe.xyz/search/pinterest?q=${encodeURIComponent(text)}&apikey=${apiKey}`);
    const res = await response.json();

    // Intentamos extraer los resultados de cualquier forma posible
    const data = res.result || res.results || res.data || (Array.isArray(res) ? res : null);

    if (!data || !Array.isArray(data)) {
      return m.reply('✨ No se encontraron resultados.');
    }

    const limit = Math.min(data.length, 12);
    const imagenesParaEnviar = data.slice(0, limit);

    const txt = `乂  P I N T E R E S T  🔍\n\n` +
                `✩  Búsqueda: ${text}\n` +
                `✩  Imágenes: ${limit}\n\n` +
                `L u f f y - M D`;

    await sendAlbumMessage(conn, m.chat, imagenesParaEnviar, {
      caption: txt,
      quoted: m
    });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    m.reply('🚀 Hubo un error con la API.');
  }
};

handler.help = ['pin'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];

export default handler;