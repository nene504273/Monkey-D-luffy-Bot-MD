import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '🏴‍☠️ luffy-gear5 🏴‍☠️'; 
const packname = '🏴‍☠️ LUFFY-Bot  🏴‍☠️';
const redes = 'https://github.com/nevi-dev';
// ⭐ Video fijo que solicitaste
const GIF_VIDEO_URL = 'https://cdn.dev-ander.xyz/upload_1776229736427.gif';

let handler = async (m, { conn, usedPrefix, text, command }) => {
  // 1. Lógica de Activación/Desactivación
  let chat = global.db.data.chats[m.chat];
  if (text === 'on') {
    chat.audios = true;
    return m.reply('🍖 **¡Digan "Whisky"! Audios encendidos.**');
  }
  if (text === 'off') {
    chat.audios = false;
    return m.reply('⚓ **Servicio de audios guardado en la bodega (Apagado).**');
  }

  // 2. Carga segura de Bases de Datos
  let db_audios = [];
  let miniaturaRandom = ''; // por si no hay miniatura

  try {
    const audioPath = path.join(process.cwd(), 'src', 'database', 'audios.json');
    if (fs.existsSync(audioPath)) {
      db_audios = JSON.parse(fs.readFileSync(audioPath, 'utf-8'));
    } else {
      console.warn('⚠️ audios.json no encontrado, se usará lista vacía.');
    }
  } catch (e) {
    console.error('❌ Error leyendo audios.json:', e);
    // No detenemos el comando, continuamos con array vacío
  }

  // Intentamos obtener miniatura desde db.json (opcional)
  try {
    const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
    if (fs.existsSync(dbPath)) {
      const enlacesMultimedia = JSON.parse(fs.readFileSync(dbPath, 'utf-8')).links;
      if (enlacesMultimedia?.imagen?.length) {
        miniaturaRandom = enlacesMultimedia.imagen[Math.floor(Math.random() * enlacesMultimedia.imagen.length)];
      }
    }
  } catch (e) {
    console.warn('⚠️ No se pudo cargar miniatura desde db.json.');
  }

  // 3. Construcción de la Lista
  const listaAudios = db_audios.length 
    ? db_audios.map((audio, index) => {
        const keys = audio.keywords?.join(' / ') || 'sin palabras clave';
        const icon = audio.convert === false ? '📜' : '🎵';
        return `*${index + 1}.* ${icon} ${keys}`;
      }).join('\n')
    : '⚠️ *No hay audios en la base de datos. Agrega algunos.*';

  // 4. Diseño del Mensaje
  const horaRD = moment().tz("America/Santo_Domingo").format('h:mm A');
  const estadoAudios = chat.audios ? '✅ NAVEGANDO' : '❌ ANCLADO';
  const sep = '━━━━━━━━━━━━━━━━━━━━';

  const encabezado = `
🏴‍☠️ **${packname} | AUDIO MENU**
${sep}
*— ¡Me voy a convertir en el Rey de los Audios!*
*¡Escucha estas voces de mi tripulación!*

🍖 **ESTADO:** ${estadoAudios}
⌚ **HORA:** ${horaRD}
🎙️ **REPERTORIO:** ${db_audios.length} Sonidos
${sep}
⚙️ **AJUSTES DEL BARCO:**
| 🔓 \`${usedPrefix}audios on\`
| 🔒 \`${usedPrefix}audios off\`
${sep}

${listaAudios}

${sep}
*— ¡Vámonos! ¡A la siguiente aventura!*
*${newsletterName}*`.trim();

  // 5. Contexto (Info de reenvío y newsletter)
  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
    externalAdReply: {
      title: '🏴‍☠️ 𝐆𝐄𝐀𝐑 𝟓: 𝐀𝐔𝐃𝐈𝐎 𝐒𝐘𝐒𝐓𝐄𝐌',
      body: `Tripulación: ${db_audios.length} comandos`,
      thumbnailUrl: miniaturaRandom || 'https://i.imgur.com/9qoEM9U.jpeg', // fallback
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  // 6. Envío del video fijo
  try {
    const response = await fetch(GIF_VIDEO_URL);
    if (!response.ok) throw new Error('No se pudo descargar el GIF');
    const videoBuffer = await response.buffer();

    await conn.sendMessage(m.chat, {
      video: videoBuffer,
      gifPlayback: true,
      caption: encabezado,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    console.error('❌ Error enviando video, se envía imagen de respaldo:', e);
    // Si falla el video, enviamos solo imagen
    await conn.sendMessage(m.chat, { 
      image: { url: miniaturaRandom || 'https://i.imgur.com/9qoEM9U.jpeg' }, 
      caption: encabezado, 
      contextInfo 
    }, { quoted: m });
  }
};

handler.help = ['menu2', 'audios on', 'audios off'];
handler.tags = ['main'];
handler.command = ['menu2', 'menuaudios', 'audios'];

export default handler;