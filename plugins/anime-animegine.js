
import fetch from 'node-fetch';

// Tu API Key proporcionada
const ApiKey = 'stellar-eFNHF99t';

let handler = async (m, { conn, args }) => {
  const prompt = args.join(' ');

  // Validación de prompt vacío
  if (!prompt) {
    return m.reply(
      '*¡Hey! 🏴‍☠️ Necesito saber qué imagen crear.*\n' +
      'Ejemplo: `.text2img un barco pirata en el mar`'
    );
  }

  try {
    // Reacción de "procesando" y mensaje inicial
    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });
    await m.reply('*Creando imagen... ¡Shishishi! 🎨*');

    // Construcción de la URL con la API Key insertada
    const apiUrl = `https://rest.alyabotpe.xyz/ai/texttoimage?prompt=${encodeURIComponent(prompt)}&style=realista&key=${ApiKey}`;

    const res = await fetch(apiUrl);
    
    // Verificación de respuesta del servidor
    if (!res.ok) throw new Error(`Error en el servidor (HTTP ${res.status})`);

    const data = await res.json();

    // Verificación de la estructura de datos recibida
    if (!data.status || !data.result) { 
      // Nota: Cambié data.url por data.result si es que la API devuelve la URL ahí, 
      // asegúrate de revisar si el campo es 'url' o 'result'.
      throw new Error('La API no devolvió una URL válida.');
    }

    // Envío de la imagen final
    await conn.sendMessage(
      m.chat,
      {
        image: { url: data.result || data.url }, // Intenta ambos por seguridad
        caption: `*¡Aquí está tu imagen, nakama! 🏴‍☠️*\n\n> *Prompt:* ${prompt}`
      },
      { quoted: m }
    );

    // Reacción de éxito
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error(error);
    // Reacción de error y mensaje al usuario
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
    m.reply('*¡Oh no! Algo salió mal... 💢*\nDetalle: ' + error.message);
  }
};

handler.help = ['text2img <texto>'];
handler.tags = ['ai'];
handler.command = ['text2img', 't2i', 'imagen']; // Añadí un par de alias
handler.limit = true;
handler.register = true;

export default handler;