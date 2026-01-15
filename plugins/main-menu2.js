import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import moment from 'moment-timezone';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '🏴‍☠️ luffy-gear5 🏴‍☠️'; 
const packname = '🏴‍☠️ LUFFY-Bot  🏴‍☠️';
const redes = 'https://github.com/nevi-dev';

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

  // 2. Carga de Bases de Datos
  let db_audios = [];
  let enlacesMultimedia;
  try {
    const audioPath = path.join(process.cwd(), 'src', 'database', 'audios.json');
    db_audios = JSON.parse(fs.readFileSync(audioPath, 'utf-8'));

    const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
    enlacesMultimedia = JSON.parse(fs.readFileSync(dbPath, 'utf-8')).links;
  } catch (e) {
    return conn.reply(m.chat, '❌ ¡Oe! Hubo un problema con el mapa del tesoro (Error en DB).', m);
  }

  // 3. Construcción de la Lista
  const listaAudios = db_audios.map((audio, index) => {
    const keys = audio.keywords.join(' / ');
    const icon = audio.convert === false ? '📜' : '🎵';
    return `*${index + 1}.* ${icon} ${keys}`;
  }).join('\n');

  // 4. Diseño del Mensaje (Estilo Luffy)
  const horaRD = moment().tz("America/Santo_Dominio").format('h:mm A');
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

  // 5. Multimedia y Envío
  const videoGifURL = enlacesMultimedia.video[Math.floor(Math.random() * enlacesMultimedia.video.length)];
  const miniaturaRandom = enlacesMultimedia.imagen[Math.floor(Math.random() * enlacesMultimedia.imagen.length)];

  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: { newsletterJid, newsletterName, serverMessageId: -1 },
    externalAdReply: {
      title: '🏴‍☠️ 𝐆𝐄𝐀𝐑 𝟓: 𝐀𝐔𝐃𝐈𝐎 𝐒𝐘𝐒𝐓𝐄𝐌',
      body: `Tripulación: ${db_audios.length} comandos`,
      thumbnailUrl: miniaturaRandom,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  try {
    const response = await fetch(videoGifURL);
    if (!response.ok) throw new Error('Error al descargar video');
    const videoBuffer = await response.buffer();

    await conn.sendMessage(m.chat, {
      video: videoBuffer,
      gifPlayback: true,
      caption: encabezado,
      contextInfo
    }, { quoted: m });

  } catch (e) {
    await conn.sendMessage(m.chat, { 
      image: { url: miniaturaRandom }, 
      caption: encabezado, 
      contextInfo 
    }, { quoted: m });
  }
};

handler.help = ['menu2', 'audios on', 'audios off'];
handler.tags = ['main'];
handler.command = ['menu2', 'menuaudios', 'audios'];

export default handler;