//código creado por Dioneibi-rip
//modificado por nevi-dev

import fetch from 'node-fetch';
import axios from 'axios'; // Mantenido por si se requiere en otras partes, aunque no se usa directamente para la descarga principal aquí.

// --- Constantes y Configuración de Transmisión ---
const NEVI_API_KEY = 'luffy'; // Asegúrate de que esta clave sea válida para la API de NEVI.
const newsletterJid = '120363447935700207@newsletter'; // Asegúrate de que este JID sea válido para tu entorno
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️ 』࿐⟡';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🏴‍☠️';
  const namebotLuffy = 'Sombrero de Paja Bot';
  const devLuffy = '¡Por el Rey de los Piratas!';
  const name = conn.getName(m.sender); // Identificando al Proxy

  // Configuración para la vista previa del mensaje en WhatsApp.
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
      title: namebotLuffy,
      body: devLuffy,
      thumbnail: icons, // Asegúrate de que 'icons' y 'redes' estén definidos globalmente o pasados
      sourceUrl: redes,
      mediaType: 1, // 1 para imagen (thumbnail), 2 para video.
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `${emoji} *¡Oye, nakama!* Necesito un enlace de YouTube para descargar ese video. ¡Vamos, no perdamos el tiempo!\n\nEjemplo de uso:\n*${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ*`,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    const url = args[0];

    // **Paso de Depuración 1: Validación de URL**
    // Asegúrate de que la URL proporcionada sea realmente de YouTube.
    if (!url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/)) {
        return conn.reply(
            m.chat,
            `❌ *¡Rayos! Ese no parece un enlace de YouTube válido, nakama.*\nPor favor, proporciona un enlace correcto.`,
            m,
            { contextInfo, quoted: m }
        );
    }

    await conn.reply(
      m.chat,
      `🍖 *¡Gomu Gomu no... Descarga!*
- 🏴‍☠️ ¡Estoy en ello, nakama! Dame un segundo para traer ese video.`,
      m,
      { contextInfo, quoted: m }
    );

    // *** CAMBIO: Usando la API de NEVI ***
    const neviApiUrl = `http://neviapi.ddns.net:5000/download`;
    console.log(`[DEBUG] Llamando a la API de NEVI: ${neviApiUrl}`);

    const res = await fetch(neviApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': NEVI_API_KEY, // Usando la clave de API definida
      },
      body: JSON.stringify({
        url: url,
        format: "mp4" // Solicitando formato MP4
      }),
    });

    console.log(`[DEBUG] Estado de la respuesta de la API de NEVI: ${res.status}`);

    const jsonResponse = await res.json().catch(e => {
        console.error(`[ERROR] No se pudo parsear la respuesta JSON de la API de NEVI: ${e.message}`);
        return null;
    });

    if (!jsonResponse) {
        const rawText = await res.text().catch(() => "No se pudo obtener el texto de la respuesta.");
        return conn.reply(
            m.chat,
            `❌ *¡Rayos! La API de NEVI no me dio una respuesta JSON válida, nakama.*\nPodría ser un problema con la API o un formato inesperado.\nRespuesta cruda (si disponible, primeros 200 caracteres): ${rawText.substring(0, 200)}...`,
            m,
            { contextInfo, quoted: m }
        );
    }

    // *** CAMBIO: Adaptando la verificación de la respuesta de NEVI ***
    if (jsonResponse.status !== "success" || !jsonResponse.download_link) {
      console.error(`[ERROR] Fallo de la API de NEVI (respuesta completa):`, jsonResponse);
      return conn.reply(
        m.chat,
        `❌ *¡Rayos! No pude descargar el video, nakama.*\nRazón: ${jsonResponse.message || 'La API de NEVI no devolvió un enlace de descarga válido. ¡Quizás el Grand Line es más difícil de lo que pensaba!'}.`,
        m,
        { contextInfo, quoted: m }
      );
    }

    // *** CAMBIO: Extrayendo datos directamente del JSON de NEVI ***
    const {
      title,
      description,
      duration, // La API de NEVI devuelve la duración como 'duration'
      views,
      author,
      quality, // La API de NEVI puede proporcionar la calidad directamente
      ago, // Fecha de subida relativa
    } = jsonResponse;

    const downloadURL = jsonResponse.download_link;
    const filename = `${title || 'video'}.mp4`; // Nombre de archivo sugerido

    console.log(`[DEBUG] URL de descarga del video obtenida de NEVI: ${downloadURL}`);

    // *** CAMBIO: Enviando el video directamente con la URL de descarga ***
    // Esto es más eficiente ya que no descarga el video al bot primero.
    await conn.sendMessage(
      m.chat,
      {
        video: { url: downloadURL }, // Envía el video directamente desde la URL
        caption:
`╭━━━━[ 🏴‍☠️ YTMP4 del Rey de los Piratas 🏴‍☠️ ]━━━━⬣
📹 *Título:* ${title || 'Desconocido'}
🧑‍💻 *Tripulación:* ${author?.name || 'Desconocido'}
🕒 *Duración de la Aventura:* ${duration || 'Desconocida'}
📅 *Fecha de Zarpe:* ${ago || 'Desconocida'}
👁️ *Vistas por la Tripulación:* ${views?.toLocaleString() || '0'}
🎞️ *Calidad de la Aventura:* ${quality || 'Desconocida'}
📄 *Bitácora del Capitán:*
${description ? description.substring(0, 500) + (description.length > 500 ? '...' : '') : 'Sin descripción.'}
╰━━━━━━━━━━━━━━━━━━⬣`,
        mimetype: 'video/mp4',
        fileName: filename
      },
      { contextInfo, quoted: m }
    );
    console.log(`[DEBUG] Video enviado exitosamente.`);

  } catch (e) {
    console.error(`[ERROR FATAL] Ocurrió un error inesperado en el manejador:`, e);
    await conn.reply(
      m.chat,
      `❌ *¡Problemas en el Grand Line!* Ocurrió un error al procesar el video, nakama.\nDetalles: ${e.message}. ¡Necesitamos más carne para esto!`,
      m,
      { contextInfo, quoted: m }
    );
  }
};

handler.help = ['ytmp4'].map(v => v + ' <enlace>');
handler.tags = ['descargas'];
handler.command = ['ytmp4', 'ytvideo', 'ytmp4dl'];
handler.register = true;
handler.limit = true;
handler.coin = 3;

export default handler;
