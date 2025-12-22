import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

//  Datos del canal con la personalidad de Monkey D. Luffy
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '🏴‍☠️ Monkey D. Luffy - Rey de los Piratas 🏴‍☠️';

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
      title: '¡Soy Luffy! El que se convertirá en el Rey de los Piratas 🍖',
      body: '¡Shishishi! ¿Quieres unirse a mi tripulación?',
      thumbnail: 'https://i.imgur.com/5Ves2Ij.jpg', // Puedes cambiar por una imagen de Luffy
      sourceUrl: 'https://whatsapp.com/channel/0029VaXlCkE6QJWcGQZz12345',
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  const prompt = args.join(' ');
  if (!prompt) {
    return conn.reply(
      m.chat,
      `¡Hey! 🏴‍☠️ *Necesito que me digas qué imagen quieres que cree.*\n\n*Por ejemplo:* \n\`${usedPrefix + command} un barco pirata navegando en el Grand Line\`\n\n¡Vamos, no tengo todo el día! ¡Quiero carne! 🍖`,
      m,
      { contextInfo, quoted: m }
    );
  }

  try {
    // Traducir prompt a inglés para mejores resultados
    const { text: translatedPrompt } = await translate(prompt, { to: 'en', autoCorrect: true });

    await conn.reply(m.chat, `¡Vale! 🎨 *Estoy creando tu imagen...* ¡Esto es más divertido que pelear con un Yonkou! 🏴‍☠️`, m, { contextInfo, quoted: m });

    // Llamada a la API con tu clave Stellar
    const apiUrl = `https://rest.alyabotpe.xyz/ai/texttoimage`;
    
    const res = await fetch(apiUrl, {
      method: 'POST', // Usualmente las APIs de generación usan POST
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'stellar-t1opU0P4' // Tu clave aquí
      },
      body: JSON.stringify({ prompt: translatedPrompt }) // El parámetro debe ser "prompt" según la API
    });

    const json = await res.json();

    // Manejo de errores basado en la respuesta de la API
    if (!res.ok || json.status === false) {
      throw new Error(json.message || `La API respondió con el estado ${res.status}`);
    }

    // Extraer la URL de la imagen de la respuesta
    let imageUrl;
    // Diferentes estructuras posibles de respuesta
    if (json.image) {
      imageUrl = json.image;
    } else if (json.url) {
      imageUrl = json.url;
    } else if (json.data && json.data.url) {
      imageUrl = json.data.url;
    } else if (json.result && Array.isArray(json.result) && json.result[0]) {
      imageUrl = json.result[0];
    } else {
      console.log('Respuesta completa de la API para depuración:', JSON.stringify(json, null, 2));
      throw new Error('No se pudo encontrar la URL de la imagen en la respuesta de la API.');
    }

    // Descargar la imagen
    const imageRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://rest.alyabotpe.xyz/'
      }
    });

    if (!imageRes.ok) throw new Error(`No se pudo descargar la imagen (estado ${imageRes.status})`);
    const buffer = await imageRes.buffer();

    // Enviar la imagen con un mensaje de Luffy
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `¡Yosh! 🏴‍☠️ *Aquí tienes tu imagen, nakama!*\n\n*Tu idea era:* "${prompt}"\n\n¡Espero que te guste! ¡Ahora, a por la carne! 🍖`
    }, { quoted: m, contextInfo });

  } catch (e) {
    console.error('Error en el comando text2img:', e);
    conn.reply(m.chat, `¡Rayos! 💢 *Algo salió mal...*\n\n\`\`\`${e.message}\`\`\`\n\n¡Pero no me rindo! ¡Inténtalo de nuevo! 💪`, m, { contextInfo, quoted: m });
  }
};

// Configuración del comando
handler.help = ['text2img'].map(v => v + ' <texto>');
handler.tags = ['ai', 'image', 'luffy'];
handler.command = ['text2img', 'crearimagen', 'imagenluffy'];
handler.limit = true;
handler.coin = 3;
handler.register = true;

export default handler;