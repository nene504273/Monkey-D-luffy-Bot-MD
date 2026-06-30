import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '🏴‍☠️ luffy-gear5 🏴‍☠️'; 
const packname = '🏴‍☠️ LUFFY-Bot  🏴‍☠️';
const redes = 'https://github.com/nevi-dev';
const GIF_VIDEO_URL = 'https://cdn.dev-ander.xyz/upload_1776229736427.gif';

let handler = async (m, { conn, usedPrefix, text, command }) => {
  try {
    // 1. Inicializar estado de audios para el chat (crea si no existe)
    if (!global.db.data.chats) global.db.data.chats = {};
    if (!global.db.data.chats[m.chat]) {
      global.db.data.chats[m.chat] = {
        audios: true, // por defecto activado
        // puedes agregar más propiedades si quieres
      };
    }
    let chat = global.db.data.chats[m.chat];

    // 2. Comandos on / off
    if (text === 'on') {
      chat.audios = true;
      return m.reply('🍖 **¡Digan "Whisky"! Audios encendidos.**');
    }
    if (text === 'off') {
      chat.audios = false;
      return m.reply('⚓ **Servicio de audios guardado en la bodega (Apagado).**');
    }

    // 3. Cargar base de datos de audios (con fallback seguro)
    let db_audios = [];
    try {
      const audioPath = path.join(process.cwd(), 'src', 'database', 'audios.json');
      if (fs.existsSync(audioPath)) {
        const data = fs.readFileSync(audioPath, 'utf-8');
        db_audios = JSON.parse(data);
        if (!Array.isArray(db_audios)) db_audios = [];
      } else {
        console.warn('⚠️ audios.json no encontrado, se usará lista vacía.');
      }
    } catch (e) {
      console.error('❌ Error leyendo audios.json:', e.message);
      // No detenemos, seguimos con []
    }

    // 4. Obtener miniatura aleatoria (si existe)
    let miniaturaRandom = 'https://i.imgur.com/9qoEM9U.jpeg'; // fallback por defecto
    try {
      const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
      if (fs.existsSync(dbPath)) {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const imagenes = dbData?.links?.imagen;
        if (Array.isArray(imagenes) && imagenes.length) {
          miniaturaRandom = imagenes[Math.floor(Math.random() * imagenes.length)];
        }
      }
    } catch (e) {
      console.warn('⚠️ No se pudo cargar miniatura desde db.json, usando fallback.');
    }

    // 5. Construir lista de audios (con formato)
    let listaAudios = '';
    if (db_audios.length === 0) {
      listaAudios = '⚠️ *No hay audios en la base de datos. Agrega algunos.*';
    } else {
      listaAudios = db_audios.map((audio, index) => {
        const keys = audio.keywords?.join(' / ') || 'sin palabras clave';
        const icon = audio.convert === false ? '📜' : '🎵';
        return `*${index + 1}.* ${icon} ${keys}`;
      }).join('\n');
    }

    // 6. Preparar datos del mensaje
    const horaRD = moment().tz('America/Santo_Domingo').format('h:mm A');
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

    // 7. Contexto de reenvío (para el mensaje)
    const contextInfo = {
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid,
        newsletterName,
        serverMessageId: -1
      },
      externalAdReply: {
        title: '🏴‍☠️ 𝐆𝐄𝐀𝐑 𝟓: 𝐀𝐔𝐃𝐈𝐎 𝐒𝐘𝐒𝐓𝐄𝐌',
        body: `Tripulación: ${db_audios.length} comandos`,
        thumbnailUrl: miniaturaRandom,
        sourceUrl: redes,
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // 8. Enviar el mensaje (video o imagen de respaldo)
    try {
      const response = await fetch(GIF_VIDEO_URL);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const videoBuffer = await response.buffer();

      await conn.sendMessage(m.chat, {
        video: videoBuffer,
        gifPlayback: true,
        caption: encabezado,
        contextInfo
      }, { quoted: m });
    } catch (videoError) {
      console.error('❌ Error enviando video, se envía imagen:', videoError.message);
      // Fallback a imagen
      await conn.sendMessage(m.chat, {
        image: { url: miniaturaRandom },
        caption: encabezado,
        contextInfo
      }, { quoted: m });
    }

  } catch (error) {
    // Captura cualquier error inesperado y envía un mensaje de error amigable
    console.error('❌ Error en handler menu2:', error);
    await m.reply('⚠️ Ocurrió un error al mostrar el menú. Revisa la consola.');
  }
};

handler.help = ['menu2', 'audios on', 'audios off'];
handler.tags = ['main'];
handler.command = ['menu2', 'menuaudios', 'audios'];

export default handler;