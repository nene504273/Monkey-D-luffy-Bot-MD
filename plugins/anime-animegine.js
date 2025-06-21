import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

const newsletterJid = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡';

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
    // Traducir prompt a inglés
    const { text: translatedPrompt } = await translate(prompt, { to: 'en', autoCorrect: true });

    await conn.reply(m.chat, `🎨 *Creando imagen a partir del texto...* ✨\n(⌒‿⌒) 〰️`, m, { contextInfo, quoted: m });

    const apiUrl = `https://api.vreden.my.id/api/artificial/aiease/text2img?prompt=${encodeURIComponent(translatedPrompt)}&style=19`;
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API respondió con ${res.status}: ${errorText}`);
    }

    const json = await res.json();
    const images = json?.result;
    if (!images || images.length === 0) throw new Error('No se recibieron imágenes de la API.');

    // Tomamos la primera imagen origin
    const imageUrl = images[0].origin;
    if (!imageUrl) throw new Error('No se encontró la URL de la imagen.');

    // Descargar imagen con header Referer para evitar 404 (si hace falta)
    const imageRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://api.vreden.my.id/'
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
    console.error(e);
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

    
