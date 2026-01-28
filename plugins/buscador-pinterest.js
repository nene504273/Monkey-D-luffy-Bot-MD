import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

const { generateWAMessageFromContent, generateWAMessage, delay } = baileys;

async function sendAlbumMessage(conn, jid, medias, options = {}) {
  const album = generateWAMessageFromContent(jid, {
    messageContextInfo: {},
    albumMessage: {
      expectedImageCount: medias.length,
      expectedVideoCount: 0,
      ...(options.quoted ? { contextInfo: { ...options.quoted.message, ...options.quoted.key } } : {})
    }
  }, {});

  await conn.relayMessage(jid, album.message, { messageId: album.key.id });

  for (let i = 0; i < medias.length; i++) {
    const img = await generateWAMessage(jid, { 
      image: medias[i].data, 
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
    await m.react('⛏️');
    
    const apiKey = 'stellar-LarjcWHD';
    const response = await fetch(`https://rest.alyabotpe.xyz/search/pinterest?q=${encodeURIComponent(text)}&apikey=${apiKey}`);
    const json = await response.json();

    // La API de Alya devuelve las URLs directamente en json.result
    const data = json.result;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return m.reply('✨ No se encontraron imágenes para tu búsqueda.');
    }

    // Filtramos para enviar solo 12 imágenes (estilo álbum limpio)
    const limit = Math.min(data.length, 12);
    const medias = data.slice(0, limit).map(url => ({
      data: { url: url }
    }));

    // Estilo Yuki / Luffy-MD (Sin exceso de símbolos)
    const txt = `乂  P I N T E R E S T  🔍\n\n` +
                `✩  Búsqueda: ${text}\n` +
                `✩  Imágenes: ${limit}\n\n` +
                `L u f f y - M D`;

    await sendAlbumMessage(conn, m.chat, medias, {
      caption: txt,
      quoted: m
    });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('✖️');
    m.reply('🚀 Hubo un fallo en el servidor de imágenes.');
  }
};

handler.help = ['pin'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];

export default handler;