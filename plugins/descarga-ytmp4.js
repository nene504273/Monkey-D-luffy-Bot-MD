//código creado por Dioneibi-rip
import fetch from 'node-fetch';

// Considera si estos JIDs y nombres son estáticos o si deben ser dinámicos.
// Si el error está relacionado con el envío de mensajes, estos podrían ser un punto a revisar.
const newsletterJid = '120363447935700207@newsletter'; // Asegúrate de que este JID sea válido para tu entorno
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️ 』࿐⟡';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🏴‍☠️';
  const namebotLuffy = 'Sombrero de Paja Bot';
  const devLuffy = '¡Por el Rey de los Piratas!';

  // Configuración para la vista previa del mensaje en WhatsApp.
  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    // Esta sección es específica para mensajes de boletín (newsletter).
    // Si tu bot no está diseñado para esto o si es una característica nueva/experimental,
    // podría ser una fuente de errores. Si tienes problemas para enviar mensajes,
    // intenta comentar temporalmente esta sección para descartarla como causa.
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1 // -1 es un valor común para mensajes nuevos, pero verifica la documentación de tu librería.
    },
    externalAdReply: {
      title: namebotLuffy,
      body: devLuffy,
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1, // 1 para imagen (thumbnail), 2 para video. Asegúrate de que sea correcto.
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `${emoji} *¡Oye, nakama!* Necesito un enlace de YouTube para descargar ese video. ¡Vamos, no perdamos el tiempo!\n\nEjemplo de uso:\n*${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ* (¡Este es un ejemplo real de URL de YouTube!)`, // Ejemplo de URL real
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

    const api = `https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(url)}`;
    console.log(`[DEBUG] Llamando a la API externa: ${api}`); // **Paso de Depuración 2: Rastrea la llamada a la API**

    const res = await fetch(api);
    console.log(`[DEBUG] Estado de la respuesta de la API: ${res.status}`); // **Paso de Depuración 3: Verifica el estado de la respuesta**

    // **Paso de Depuración 4: Manejo robusto de la respuesta JSON**
    // Intenta parsear la respuesta como JSON. Si falla, intenta leerla como texto para ver el error crudo.
    const jsonResponse = await res.clone().json().catch(e => {
        console.error(`[ERROR] No se pudo parsear la respuesta JSON de la API: ${e.message}`);
        return null; // Retorna null si no se puede parsear como JSON
    });

    if (!jsonResponse) {
        const rawText = await res.text().catch(() => "No se pudo obtener el texto de la respuesta.");
        return conn.reply(
            m.chat,
            `❌ *¡Rayos! La API no me dio una respuesta JSON válida, nakama.*\nPodría ser un problema con la API o un formato inesperado.\nRespuesta cruda (si disponible, primeros 200 caracteres): ${rawText.substring(0, 200)}...`,
            m,
            { contextInfo, quoted: m }
        );
    }

    if (jsonResponse.status !== 200 || !jsonResponse.result?.download?.url) {
      console.error(`[ERROR] Fallo de la API externa (respuesta completa):`, jsonResponse); // **Paso de Depuración 5: Log el JSON completo del error de la API**
      return conn.reply(
        m.chat,
        `❌ *¡Rayos! No pude descargar el video, nakama.*\nRazón: ${jsonResponse.message || 'La respuesta no es la que esperaba. ¡Quizás el Grand Line es más difícil de lo que pensaba!'}.`,
        m,
        { contextInfo, quoted: m }
      );
    }

    const {
      title,
      description,
      timestamp, // Esto parece ser la duración del video (ej: "00:05:30")
      views,
      // image, // No se usa en el caption, pero podrías usarlo para el thumbnail si lo deseas.
      author,
      // url: videoURL // Esto es la URL original del video de YouTube, no la de descarga
    } = jsonResponse.result.metadata;

    const {
      url: downloadURL,
      quality,
      filename
    } = jsonResponse.result.download;

    console.log(`[DEBUG] URL de descarga del video obtenida: ${downloadURL}`); // **Paso de Depuración 6: Verifica la URL de descarga**

    const videoRes = await fetch(downloadURL);

    // **Paso de Depuración 7: Verifica si la descarga del video fue exitosa**
    if (!videoRes.ok) { // `videoRes.ok` es true si el estado HTTP es 2xx
        console.error(`[ERROR] Fallo al descargar el video del URL: ${downloadURL}, Estado HTTP: ${videoRes.status}`);
        return conn.reply(
            m.chat,
            `❌ *¡Problemas en el Grand Line!* No pude obtener el archivo de video. El servidor de descarga respondió con un error ${videoRes.status}.`,
            m,
            { contextInfo, quoted: m }
        );
    }

    const videoBuffer = await videoRes.buffer();
    console.log(`[DEBUG] Video descargado en buffer. Tamaño: ${videoBuffer.length} bytes`); // **Paso de Depuración 8: Verifica el tamaño del buffer**

    await conn.sendMessage(
      m.chat,
      {
        video: videoBuffer,
        caption:
`╭━━━━[ 🏴‍☠️ YTMP4 del Rey de los Piratas 🏴‍☠️ ]━━━━⬣
📹 *Título:* ${title}
🧑‍💻 *Tripulación:* ${author?.name || 'Desconocido'}
🕒 *Duración de la Aventura:* ${timestamp}
📅 *Fecha de Zarpe:* ${jsonResponse.result.metadata.ago}
👁️ *Vistas por la Tripulación:* ${views.toLocaleString()}
🎞️ *Calidad de la Aventura:* ${quality}
📄 *Bitácora del Capitán:*
${description ? description.substring(0, 500) + (description.length > 500 ? '...' : '') : 'Sin descripción.'}
╰━━━━━━━━━━━━━━━━━━⬣`, // Limita la descripción para evitar mensajes demasiado largos
        mimetype: 'video/mp4',
        fileName: filename || `${title}.mp4` // Asegura que siempre haya un nombre de archivo
      },
      { contextInfo, quoted: m }
    );
    console.log(`[DEBUG] Video enviado exitosamente.`); // **Paso de Depuración 9: Confirmación de envío**

  } catch (e) {
    console.error(`[ERROR FATAL] Ocurrió un error inesperado en el manejador:`, e); // **Paso de Depuración 10: Captura errores inesperados**
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