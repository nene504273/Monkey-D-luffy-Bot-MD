import fetch from 'node-fetch';

const ApiKey = 'stellar-eFNHF99t';

let handler = async (m, { conn, args }) => {
  const prompt = args.join(' ');

  if (!prompt) {
    return m.reply('*¡Hey! 🏴‍☠️ Necesito un texto para crear la imagen.*');
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

    const apiUrl = `https://rest.alyabotpe.xyz/ai/texttoimage?prompt=${encodeURIComponent(prompt)}&style=realista&key=${ApiKey}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    // Esto te ayudará a ver en la terminal qué está pasando si falla
    console.log('Respuesta de la API:', data);

    // Intentamos obtener la URL de diferentes posibles campos (url, result o link)
    const imageUrl = data.url || data.result || (data.data && data.data.url);

    if (!imageUrl) {
      throw new Error('La API no envió una imagen. Verifica si tu Key tiene créditos o si el prompt es válido.');
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imageUrl },
        caption: `*¡Imagen generada! 🎨*\n\n> ${prompt}`
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
    
    // Si el error es por la API, mostramos el mensaje que envíe el servidor
    m.reply(`*¡Error! 💢*\n${error.message}`);
  }
};

handler.help = ['text2img <texto>'];
handler.tags = ['ai'];
handler.command = ['text2img'];
handler.limit = true;
handler.register = true;

export default handler;