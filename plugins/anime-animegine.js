import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const prompt = args.join(' ');
  
  // 1. Validar que el usuario envió un texto
  if (!prompt) {
    return conn.reply(
      m.chat,
      `¡Hola! 🎨 *Para crear una imagen, escribe lo que quieres ver.*\n\n*Ejemplo:* \n\`${usedPrefix + command} un gato astronauta en Marte\``,
      m
    );
  }

  try {
    // 2. Avisar al usuario que se está procesando
    await m.reply('*Generando tu imagen...* Por favor espera un momento. ⏳');

    // 3. Traducir el prompt al inglés (las IA suelen entender mejor el inglés)
    const { text: translatedPrompt } = await translate(prompt, { to: 'en', autoCorrect: true });

    // 4. Configuración de la API
    const apiUrl = `https://rest.alyabotpe.xyz/ai/texttoimage`;
    
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'stellar-t1opU0P4' // Tu clave API
      },
      body: JSON.stringify({ prompt: translatedPrompt })
    });

    const json = await res.json();

    // 5. Verificar si la respuesta es exitosa
    if (!res.ok || (json.status === false)) {
      throw new Error(json.message || 'Error al conectar con el servidor de imágenes.');
    }

    // 6. Obtener la URL de la imagen (probando diferentes estructuras comunes)
    let imageUrl = json.image || json.url || (json.data && json.data.url) || (json.result && json.result[0]);

    if (!imageUrl) {
      throw new Error('No se encontró la imagen en la respuesta.');
    }

    // 7. Enviar la imagen final
    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: `✅ *Imagen Generada*\n\n*Pedido:* "${prompt}"\n*IA:* Alyabot API`
    }, { quoted: m });

  } catch (e) {
    console.error('Error en comando imagen:', e);
    m.reply(`❌ *Ocurrió un error:* \n\n${e.message}`);
  }
};

// Configuración del comando
handler.help = ['text2img <texto>'];
handler.tags = ['ai'];
handler.command = ['text2img', 'imagen', 'iaimg']; // Comandos que activan la función

export default handler;