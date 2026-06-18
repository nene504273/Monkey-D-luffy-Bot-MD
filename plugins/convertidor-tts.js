import axios from 'axios';

const defaultVoice = 'es_002'; // Voz estándar de TikTok en Español (Femenina)
const emoji = '🔊';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  let text = args.join(' ');
  let voice = defaultVoice;

  // Soporte para cambiar de idioma/voz si ponen el código al principio (ej: #tts en hello)
  if (args[0] && args[0].length === 2) {
    const lang = args[0].toLowerCase();
    if (lang === 'en') voice = 'en_us_001'; // Inglés Femenino
    if (lang === 'es') voice = 'es_002';    // Español Femenino
    if (lang === 'br' || lang === 'pt') voice = 'br_003'; // Portugués
    text = args.slice(1).join(' ');
  }

  // Si no hay texto directo, revisa si respondieron a un mensaje de texto
  if (!text && m.quoted?.text) text = m.quoted.text;
  
  if (!text) throw `${emoji} Por favor, ingresa un texto o responde a un mensaje para convertirlo a voz de TikTok.`;

  try {
    // Generar el audio con el scraper de TikTok
    let audioBuffer = await generateTikTokTTS(text, voice);
    
    if (audioBuffer) {
      // Enviamos el buffer directo en memoria como nota de voz (PTT)
      await conn.sendFile(m.chat, audioBuffer, 'tts.opus', null, m, true);
    } else {
      throw new Error("No se recibió respuesta de audio válida.");
    }
  } catch (e) {
    console.error("Error en TikTok TTS Principal:", e.message);
    
    // Sistema de contingencia: Si falló con una voz personalizada, intenta con la voz por defecto
    try {
      let backupBuffer = await generateTikTokTTS(text, defaultVoice);
      if (backupBuffer) {
        await conn.sendFile(m.chat, backupBuffer, 'tts.opus', null, m, true);
      }
    } catch (err) {
      m.reply(`❌ Ocurrió un error al conectar con el servidor de voz de TikTok: ${err.message}`);
    }
  }
};

handler.help = ['tts <lang> <text>'];
handler.tags = ['transformador'];
handler.group = true;
handler.register = true;
handler.command = ['tts'];

export default handler;

// --- Función Scraper para la API de Voz de TikTok ---
async function generateTikTokTTS(text, voiceId) {
  try {
    const form = new URLSearchParams();
    form.append('text', text);
    form.append('voice', voiceId);

    // Consultamos el endpoint de recursos TTS de TikWM
    const { data } = await axios.post('https://www.tikwm.com/api/resources/tts', form, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 12000
    });

    // La API devuelve un string base64 del archivo de audio en data.data
    if (data.code === 0 && data.data) {
      return Buffer.from(data.data, 'base64');
    }
    
    throw new Error(data.msg || 'Error en la respuesta de la API');
  } catch (error) {
    throw new Error(`Scraper TTS falló: ${error.message}`);
  }
}
