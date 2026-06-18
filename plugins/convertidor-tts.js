import gtts from 'node-gtts';
import { readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const defaultLang = 'es';
const emoji = '🔊'; // 🛠️ CORRECCIÓN: Definimos el emoji que faltaba

// Configuración segura de rutas para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handler = async (m, { conn, args, usedPrefix, command }) => {
  let lang = args[0];
  let text = args.slice(1).join(' ');

  if ((args[0] || '').length !== 2) {
    lang = defaultLang;
    text = args.join(' ');
  }

  // Si no hay texto pero se citó un mensaje, usa el texto del mensaje citado
  if (!text && m.quoted?.text) text = m.quoted.text;
  
  // Validación inicial de texto
  if (!text) throw `${emoji} Por favor, ingresa una frase o texto para convertir a voz.`;

  let res;
  try {
    res = await tts(text, lang);
  } catch (e) {
    console.error("Error en TTS principal:", e);
    text = args.join(' ');
    if (!text) throw `${emoji} Por favor, ingresa una frase.`;
    res = await tts(text, defaultLang);
  } finally {
    if (res) {
      // El parámetro 'true' al final fuerza el envío como nota de voz (PTT)
      await conn.sendFile(m.chat, res, 'tts.opus', null, m, true);
    }
  }
};

handler.help = ['tts <lang> <text>'];
handler.tags = ['transformador'];
handler.group = true;
handler.register = true;
handler.command = ['tts'];

export default handler;

function tts(text, lang = 'es') {
  return new Promise((resolve, reject) => {
    try {
      const speech = gtts(lang);
      const tmpDir = join(__dirname, '../tmp');

      // 🛠️ SEGURIDAD: Crea la carpeta tmp si no existe para evitar que el bot se apague
      if (!existsSync(tmpDir)) {
        mkdirSync(tmpDir, { recursive: true });
      }

      const filePath = join(tmpDir, `${Date.now()}.wav`);
      
      speech.save(filePath, text, () => {
        try {
          const buffer = readFileSync(filePath);
          unlinkSync(filePath); // Elimina el archivo temporal después de leerlo
          resolve(buffer);
        } catch (err) {
          reject(err);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}
