import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

const { generateWAMessageFromContent, generateWAMessage, delay } = baileys;

async function sendAlbumMessage(conn, jid, medias, options = {}) {
  const album = generateWAMessageFromContent(jid, {
    messageContextInfo: {},
    albumMessage: {
      expectedImageCount: medias.filter(m => m.type === "image").length,
      expectedVideoCount: medias.filter(m => m.type === "video").length,
      ...(options.quoted ? { contextInfo: { ...options.quoted.message, ...options.quoted.key } } : {})
    }
  }, {});

  await conn.relayMessage(jid, album.message, { messageId: album.key.id });

  for (let i = 0; i < medias.length; i++) {
    const img = await generateWAMessage(jid, { 
      [medias[i].type]: medias[i].data, 
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
    
    if (!response.ok) throw new Error('Error en la API');
    
    const json = await response.json();
    const data = json.result; // Ajustado según estructura típica de Alyabot

    if (!data || data.length === 0) return m.reply('✨ No se encontraron resultados.');

    const limit = Math.min(data.length, 10);
    const medias = data.slice(0, limit).map(url => ({
      type: 'image',
      data: { url }
    }));

    // Estilo Yuki / Luffy-MD (Limpio y directo)
    const txt = `乂  P I N T E R E S T  🔍\n\n` +
                `✩  Búsqueda: ${text}\n` +
                `✩  Cantidad: ${limit}\n\n` +
                `L u f f y - M D`;

    await sendAlbumMessage(conn, m.chat, medias, {
      caption: txt,
      quoted: m
    });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('✖️');
    m.reply('🚀 Ocurrió un fallo con la API de búsqueda.');
  }
};

handler.help = ['pin'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];
handler.register = true;

export default handler;