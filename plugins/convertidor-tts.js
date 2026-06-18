import axios from 'axios';

const emoji = '🔊';

const handler = async (m, { conn, args }) => {
  let lang = 'es';
  let text = args.join(' ');

  // Detectar si el usuario especificó un idioma (ej: #tts en Hola)
  if (args[0] && args[0].length === 2) {
    lang = args[0].toLowerCase();
    text = args.slice(1).join(' ');
  }

  // Si no hay texto directo, usar el texto del mensaje al que se respondió
  if (!text && m.quoted?.text) text = m.quoted.text;
  
  if (!text) return m.reply(`${emoji} Por favor, ingresa un texto o responde a un mensaje para convertirlo a voz.`);

  // Reacción de espera
  await m.react('⏳');

  try {
    let audioBuffer;
    
    // ---------------------------------------------------------
    // INTENTO 1: API de Voz de TikTok (Femenina)
    // ---------------------------------------------------------
    try {
        let voiceId = lang === 'en' ? 'en_us_001' : lang === 'pt' ? 'br_003' : 'es_002';
        let tiktokUrl = `https://aemt.me/tiktoktts?text=${encodeURIComponent(text)}&voice=${voiceId}`;
        
        let resTikTok = await axios.get(tiktokUrl, { 
            responseType: 'arraybuffer', 
            timeout: 8000 
        });
        audioBuffer = Buffer.from(resTikTok.data);
        
    } catch (errTikTok) {
        console.log("Fallo la API de TikTok TTS, pasando automáticamente a Google TTS...");
        
        // ---------------------------------------------------------
        // INTENTO 2 (Respaldo): Google TTS Direct Stream
        // ---------------------------------------------------------
        let googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
        
        let resGoogle = await axios.get(googleUrl, { 
            responseType: 'arraybuffer', 
            timeout: 8000 
        });
        audioBuffer = Buffer.from(resGoogle.data);
    }

    // ---------------------------------------------------------
    // ENVÍO DEL AUDIO AL CHAT (Corregido para WhatsApp Oficial)
    // ---------------------------------------------------------
    if (audioBuffer) {
      // 🛠️ SOLUCIÓN: Usamos sendMessage directo y bloqueamos el externalAdReply
      await conn.sendMessage(m.chat, { 
          audio: audioBuffer, 
          ptt: true, // Esto lo envía como Nota de Voz
          mimetype: 'audio/mpeg',
          contextInfo: null // Esto le prohíbe a tu base inyectar el diseño 'external' que bugea el mensaje
      }, { quoted: m });
      
      await m.react('✅');
    } else {
      throw new Error("Ningún servidor de voz respondió.");
    }

  } catch (error) {
    await m.react('❌');
    m.reply(`❌ Error al generar la voz: ${error.message}`);
  }
};

handler.help = ['tts <lang> <text>'];
handler.tags = ['transformador'];
handler.group = true;
handler.register = true;
handler.command = ['tts'];

export default handler;
