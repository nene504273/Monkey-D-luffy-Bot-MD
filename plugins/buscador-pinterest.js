import axios from 'axios';
import baileys from '@whiskeysockets/baileys';

// --- CONFIGURACIÓN DE LA API DE NEVI (Actualizada) ---
const NEVI_API_URL = 'http://neviapi.ddns.net:5000';
const NEVI_API_KEY = 'ellen'; 
// ----------------------------------------------------

const { generateWAMessageFromContent, generateWAMessage, delay } = baileys;

// 🎯 FUNCIÓN PARA MEJORAR LA URL DE PINTEREST (NUEVA FUNCIÓN)
const cleanPinterestUrl = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('pinimg.com')) {
        return url;
    }
    // Patrón regex para buscar /tamañox/ o /tamaño/ (ej: /236x/ o /736x/ o /564x/)
    // Reemplaza el segmento de tamaño por '/originals/'
    const pattern = /\/([0-9]+x|[0-9]+)\//g; 
    
    // Si el URL ya contiene 'originals', se devuelve directamente para evitar problemas.
    if (url.includes('/originals/')) {
        return url;
    }
    
    // Reemplaza el segmento de tamaño por 'originals/' para forzar la máxima calidad.
    const cleanedUrl = url.replace(pattern, '/originals/');
    return cleanedUrl;
};
// --------------------------------------------------------

// --- FUNCIONES AUXILIARES (Necesarias para el Álbum) ---
async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError(`⚠️ El JID debe ser un texto válido.`);
  if (medias.length < 2) throw new RangeError("⚠️ Se requieren al menos dos imágenes para crear un álbum.");

  for (const media of medias) {
    if (!['image', 'video'].includes(media.type))
      throw new TypeError(`❌ Tipo inválido: ${media.type}`);
    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data)))
      throw new TypeError(`⚠️ Los datos de la imagen o video no son válidos.`);
  }

  const caption = options.text || options.caption || "";
  const albumDelay = !isNaN(options.delay) ? options.delay : 500;

  // Creación del mensaje padre del álbum (contenedor)
  const album = generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: {
        expectedImageCount: medias.filter(m => m.type === "image").length,
        expectedVideoCount: medias.filter(m => m.type === "video").length,
        ...(options.quoted
          ? {
              contextInfo: {
                remoteJid: options.quoted.key.remoteJid,
                fromMe: options.quoted.key.fromMe,
                stanzaId: options.quoted.key.id,
                participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                quotedMessage: options.quoted.message,
              },
            }
          : {}),
      },
    },
    {}
  );

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

  // Envío de los mensajes individuales asociados al álbum
  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    const img = await generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    );
    img.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key },
    };
    await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id });
    await delay(albumDelay);
  }

  return album;
}

// 🎯 FUNCIÓN PINS MANTENIDA (Usa NEVI API por POST y clave)
const pins = async (query) => {
  try {
    const apiEndpoint = `${NEVI_API_URL}/pinterest`;

    const res = await axios.post(apiEndpoint, { query: query }, {
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': NEVI_API_KEY,
        }
    });

    const json = res.data;

    if (json.status === "success" && Array.isArray(json.urls)) {
      return json.urls.map(url => ({
        image_large_url: url,
        image_medium_url: url,
        image_small_url: url
      }));
    }
    return [];
  } catch (err) {
    console.error('💥 Error al obtener resultados de Pinterest (NEVI API):', err.message);
    return [];
  }
};

let handler = async (m, { conn, text }) => {
  const dev = 'nene 🏴‍☠️';
  const botname = 'luffybot 🍖';

  if (!text) {
    return conn.reply(
      m.chat,
      `📌 *Uso correcto:*\nEscribe el término que deseas buscar.\n\n✨ *Ejemplo:* .pinterest anime girl`,
      m
    );
  }

  try {
    await m.react('🔍');
    const results = await pins(text); 
    if (!results.length)
      return conn.reply(m.chat, `❌ No se encontraron resultados para *${text}*. Intenta con otro término. (Vía NEVI API)`, m);

    const max = Math.min(results.length, 15);
    const medias = [];

    for (let i = 0; i < max; i++) {
        // OBTENEMOS EL URL ORIGINAL Y LO OPTIMIZAMOS
        const rawUrl = results[i].image_large_url || results[i].image_medium_url || results[i].image_small_url;
        const finalUrl = cleanPinterestUrl(rawUrl); // <-- ¡Aplicamos la optimización de calidad!
        
      medias.push({
        type: 'image',
        data: {
          url: finalUrl
        }
      });
    }

    // Enviamos el álbum con las URL optimizadas
    await sendAlbumMessage(conn, m.chat, medias, {
      caption: `☠️ *luffy Sempai* te trae los resultados:\n\n📌 *Búsqueda:* ${text}\n🖼️ *Resultados:* ${max}\n👤 *Creador:* ${dev}\n\n[Datos obtenidos vía NEVI API]\n✨ *Calidad Optimzada*`,
      quoted: m
    });

    await conn.sendMessage(m.chat, { react: { text: '🏴‍☠️', key: m.key } });

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '⚠️ Ocurrió un error al procesar la búsqueda en Pinterest (Error de NEVI API o conexión).', m);
  }
};

handler.help = ['pinterest'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];
handler.register = true;

export default handler;