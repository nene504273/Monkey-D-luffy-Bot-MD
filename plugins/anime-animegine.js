import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  let prompt = args.join(' ');
  
  if (!prompt) {
    return m.reply('*¡Hey! 🏴‍☠️ Necesito saber qué imagen crear.*\nEjemplo: .text2img un barco pirata en el mar');
  }
  
  try {
    await m.reply('*Creando imagen... ¡Shishishi! 🎨*');
    
    // Llamada a la API
    let response = await fetch('https://rest.alyabotpe.xyz/ai/texttoimage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'stellar-t1opU0P4'
      },
      body: JSON.stringify({ prompt: prompt })
    });
    
    let data = await response.json();
    
    if (!data.image) throw new Error('No se generó la imagen');
    
    // Descargar y enviar la imagen
    let imageBuffer = await fetch(data.image).then(res => res.buffer());
    
    await conn.sendFile(m.chat, imageBuffer, 'imagen.jpg', 
      `*¡Aquí está tu imagen, nakama! 🏴‍☠️*\nPrompt: ${prompt}`, m);
    
  } catch (error) {
    console.error(error);
    m.reply('*¡Error! 💢* ' + error.message);
  }
};

handler.help = ['text2img <texto>'];
handler.tags = ['ai'];
handler.command = ['text2img'];
handler.desc = 'Genera imágenes con IA';

export default handler;