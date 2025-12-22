import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ m᥆ᥒkᥱᥡ ძ ᥣᥙ𝖿𝖿ᥡ';

let handler = async (m, { conn, args, usedPrefix, command }) => {
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
      title: botname,
      body: wm,
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  const prompt = args.join(' ');
  if (!prompt) {
    return conn.reply(
      m.chat,
      `🌸 *Onii-chan~ dime qué imagen deseas crear con texto...* (◕‿◕✿)\n\n🌼 *Ejemplo:* \n\`${usedPrefix + command} Un dragón azul volando sobre montañas nevadas\``,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    // Traducir prompt a inglés (opcional, puedes eliminar esta parte si la API acepta español)
    const { text: translatedPrompt } = await translate(prompt, { to: 'en', autoCorrect: true });

    await conn.reply(m.chat, `🎨 *Creando imagen a partir del texto...* ✨\n(⌒‿⌒) 〰️`, m, { contextInfo, quoted: m });

    // Nueva API Stellar con autenticación
    const apiUrl = `https://rest.alyabotpe.xyz/ai/texttoimage?text=${encodeURIComponent(translatedPrompt)}`;
    
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Authorization': 'stellar-t1opU0P4' // Tu key como header de autorización
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API respondió con ${res.status}: ${errorText}`);
    }

    const json = await res.json();
    
    // Verificar la estructura de respuesta de la nueva API
    let imageUrl;
    if (json.result && Array.isArray(json.result) && json.result[0]) {
      imageUrl = json.result[0]; // La nueva API podría devolver un array con URLs
    } else if (json.image) {
      imageUrl = json.image; // O podría devolver un campo "image"
    } else if (json.url) {
      imageUrl = json.url; // O un campo "url"
    } else if (json.data && json.data.url) {
      imageUrl = json.data.url; // O anidado en data
    } else {
      // Si no encontramos la estructura esperada, mostramos lo que recibimos para debugging
      console.log('Respuesta API completa:', JSON.stringify(json, null, 2));
      throw new Error('Formato de respuesta inesperado de la API');
    }

    if (!imageUrl) throw new Error('No se recibió URL de imagen de la API.');

    // Descargar imagen
    const imageRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://rest.alyabotpe.xyz/'
      }
    });

    if (!imageRes.ok) throw new Error(`No se pudo descargar la imagen (status ${imageRes.status})`);

    const buffer = await imageRes.buffer();

    // Enviar imagen con caption del prompt original
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `╭─❍𓂃⟡🌸⟡𓂃❍─╮  
🌸 *Imagen creada a partir de:*  
╰─────────────╯\n\n*${prompt}*`,
    }, { quoted: m, contextInfo });

  } catch (e) {
    console.error('Error en text2img:', e);
    conn.reply(m.chat, `😿 *Ocurrió un error al crear la imagen...*\n\`\`\`${e.message}\`\`\``, m, { contextInfo, quoted: m });
  }
};

handler.help = ['text2img'].map(v => v + ' <texto>');
handler.tags = ['ai', 'image'];
handler.command = ['text2img', 'imagengen'];
handler.limit = true;
handler.coin = 3;
handler.register = true;

export default handler;