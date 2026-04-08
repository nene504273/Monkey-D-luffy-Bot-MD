import fetch from 'node-fetch';

const ApiKey = 'LUFFY-GEAR4';

let handler = async (m, { conn, args }) => {
  const prompt = args.join(' ');

  if (!prompt) return m.reply('*¡Hey! 🏴‍☠️ Necesito un texto para crear la imagen.*');

  try {
    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

    const apiUrl = `https://rest.alyabotpe.xyz/ai/texttoimage?prompt=${encodeURIComponent(prompt)}&style=realista&key=${ApiKey}`;

    // Añadimos un Header de User-Agent por si el server bloquea bots
    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const contentType = res.headers.get('content-type');

    if (contentType && contentType.includes('image')) {
      // Cambio clave: Uso de arrayBuffer para mayor compatibilidad
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: `*¡Imagen generada! 🎨*\n\n*Prompt:* ${prompt}`
      }, { quoted: m });

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else {
      // Si no es imagen, leemos el texto del error
      const textError = await res.text();
      let errorMessage = 'La API no devolvió una imagen.';
      
      try {
        const jsonError = JSON.parse(textError);
        errorMessage = jsonError.message || errorMessage;
      } catch (e) {
        errorMessage = textError.slice(0, 100); // Tomamos los primeros 100 caracteres si no es JSON
      }
      
      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
    m.reply(`*¡Error! 💢*\n\n> *Detalle:* ${error.message}`);
  }
};

handler.help = ['text2img <texto>'];
handler.tags = ['ai'];
handler.command = ['text2img', 'imagen', 'iaimg'];
handler.limit = true;
handler.register = true;

export default handler;