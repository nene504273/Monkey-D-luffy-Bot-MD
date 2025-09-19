import fetch from 'node-fetch';

// --- Constantes y Configuración de Transmisión ---
const NEVI_API_KEY = 'luffy'; // Clave de API para NEVI, según lo solicitado.
const newsletterJid  = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙:🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️』࿐⟡';

var handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🎵';
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
      title: wm, // Asume que 'wm' está definido globalmente
      body: dev, // Asume que 'dev' está definido globalmente
      thumbnail: icons, // Asume que 'icons' está definido globalmente
      sourceUrl: redes, // Asume que 'redes' está definido globalmente
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `${emoji} *¡Oh no~!* pásame un enlace de YouTube para traer el audio.\n\nUso:\n\`${usedPrefix + command} https://youtu.be/KHgllosZ3kA\``,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    await conn.reply(
      m.chat,
      `🌸 *Procesando tu petición...*\nUn momento, senpai~ 🎧`,
      m,
      { contextInfo, quoted: m }
    );

    const url = args[0];

    // --- CAMBIO: Usando la API de NEVI ---
    const neviApiUrl = `http://neviapi.ddns.net:5000/download`;
    const res = await fetch(neviApiUrl, {
      method: 'POST', // La API de NEVI usa POST para descargas
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': NEVI_API_KEY, // Usando la clave 'luffy'
      },
      body: JSON.stringify({
        url: url,
        format: "mp3" // Solicitando formato MP3
      }),
    });

    const json = await res.json().catch(e => {
        console.error(`[ERROR] No se pudo parsear la respuesta JSON de la API de NEVI: ${e.message}`);
        return null;
    });

    if (!json) {
        const rawText = await res.text().catch(() => "No se pudo obtener el texto de la respuesta.");
        return conn.reply(
            m.chat,
            `❌ *¡Oh no~! La API de NEVI no me dio una respuesta JSON válida, senpai.*\nPodría ser un problema con la API o un formato inesperado.\nRespuesta cruda (si disponible, primeros 200 caracteres): ${rawText.substring(0, 200)}...`,
            m,
            { contextInfo, quoted: m }
        );
    }

    // --- CAMBIO: Adaptando la verificación de la respuesta y extracción de metadatos de NEVI ---
    if (json.status === "success" && json.download_link) {
      // Los metadatos vienen directamente en el objeto JSON raíz de la respuesta de NEVI
      const title       = json.title || 'Título Desconocido';
      const description = json.description || 'Sin descripción.';
      const duration    = json.duration || 'Desconocida'; // NEVI usa 'duration'
      const views       = json.views?.toLocaleString() || '0';
      const ago         = json.ago || 'Desconocida';
      const authorName  = json.author?.name || 'Desconocido';
      const downloadURL = json.download_link;
      const quality     = json.quality || 'Desconocida';
      const filename    = `${title}.mp3`; // Construimos el nombre del archivo

      // Caption con separadores y datos de NEVI
      const caption = `
╭───[ 𝚈𝚃𝙼𝙿𝟹 • 🎶 ]───⬣
📌 *Título:* ${title}
👤 *Autor:* ${authorName}
⏱️ *Duración:* ${duration}
📅 *Publicado:* ${ago}
👁️ *Vistas:* ${views}
🎚️ *Calidad:* ${quality}
📄 *Descripción:*
${description.substring(0, 500) + (description.length > 500 ? '...' : '')}
╰────────────────⬣`;

      // --- CAMBIO: Enviar audio directamente desde la URL de descarga de NEVI ---
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: downloadURL }, // Usa directamente el enlace de descarga
          mimetype: 'audio/mpeg',
          fileName: filename,
          ptt: false, // Mantener ptt en false para enviar como música
          caption
        },
        { contextInfo, quoted: m }
      );

    } else {
      throw new Error(`No pude descargar el audio usando la API de NEVI. Razón: ${json.message || 'Respuesta inválida del servidor de NEVI.'}`);
    }

  } catch (e) {
    console.error(e);
    await conn.reply(
      m.chat,
      `❌ *Ocurrió un error al procesar el audio.*\nDetalles: ${e.message}`,
      m,
      { contextInfo, quoted: m }
    );
  }
};

handler.help = ['ytmp3'].map(v => v + ' <link>');
handler.tags = ['descargas'];
handler.command = ['ytmp3', 'ytaudio', 'mp3'];
handler.register = true;
handler.limit = true;
handler.coin = 2;

export default handler;
