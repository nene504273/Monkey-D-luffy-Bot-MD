import fetch from 'node-fetch';

const ApiKey = 'stellar-LarjcWHD';

let handler = async (m, { conn, args }) => {
  const prompt = args.join(' ');

  if (!prompt) {
    return m.reply('*¡Hey! 🏴‍☠️ Necesito un texto para crear la imagen.*');
  }

  try {
    // Reacción de "procesando"
    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

    const apiUrl = `https://rest.alyabotpe.xyz/ai/texttoimage?prompt=${encodeURIComponent(prompt)}&style=realista&key=${ApiKey}`;

    const res = await fetch(apiUrl);

    // Verificamos si la respuesta es una imagen (binario)
    const contentType = res.headers.get('content-type');

    if (contentType && contentType.includes('image')) {
      // Si es imagen, la convertimos en buffer para enviarla directamente
      const buffer = await res.buffer();

      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          caption: `*¡Imagen generada! 🎨*\n\n*Prompt:* ${prompt}\n*Estilo:* Realista`
        },
        { quoted: m }
      );

      // Reacción de éxito
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } else {
      // Si no es imagen, intentamos leer el error en formato JSON
      const data = await res.json();
      throw new Error(data.message || 'La API no devolvió una imagen válida.');
    }

  } catch (error) {
    console.error('Error en el comando:', error);
    
    // Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });

    // Mensaje de error amigable
    m.reply(`*¡Error! 💢*\n\n> *Detalle:* ${error.message}`);
  }
};

handler.help = ['text2img <texto>'];
handler.tags = ['ai'];
handler.command = ['text2img', 'imagen', 'iaimg']; // Atajos extra
handler.limit = true;
handler.register = true;

export default handler;