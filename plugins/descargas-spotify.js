// Importa las librerías necesarias
import fetch from "node-fetch";
import axios from 'axios';
import fs from 'fs';

// ¡Asegúrate de cambiar esto a tu clave de API real!
const NEVI_API_KEY = 'TU_CLAVE_API_REAL';

const SIZE_LIMIT_MB = 100;
// --- PERSONALIZACIÓN: Masha (Maria Kujou), la hermana menor ---
// Variables de estilo de Masha
const newsletterJid = '120363456789012345@newsletter'; // *Reemplazar si tienes un newsletter real.*
const newsletterName = '🌸 𝐌𝐚𝐬𝐡𝐚 (𝐌𝐚𝐫𝐢𝐚) 𝐁𝐨𝐭-𝐒𝐞𝐫𝐯𝐢𝐜𝐞 ♡';
// Las variables 'icons' y 'redes' se asumen definidas globalmente.
// ----------------------------------------------------

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const name = conn.getName(m.sender);
  const spotifyUrl = args[0];

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
      title: '💖 ⏤͟͟͞͞𝐌𝐀𝐒𝐇𝐀 - 𝐊𝐔𝐉𝐎𝐔 𝐁𝐎𝐓 ᨶ႒ᩚ',
      body: `✨ *¡Hola, ${name}-san! Estoy lista para ayudarte con tu música. 😊*`,
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!spotifyUrl) {
    return conn.reply(m.chat, `🎶 *¡Oh, parece que olvidaste el enlace!*
No te preocupes. ¿Podrías darme la **URL de Spotify** que quieres descargar, por favor?

🎧 *Ejemplo (Por favor, dime):*
${usedPrefix}spotify https://open.spotify.com/track/1234567890`, m, { contextInfo });
  }

  const isSpotifyUrl = /^(https?:\/\/)?(www\.)?open\.spotify\.com\/.+$/i.test(spotifyUrl);
  if (!isSpotifyUrl) {
    return conn.reply(m.chat, `💔 *¡Oh no! Esa URL no funciona.*
¿Estás seguro de que es un enlace de Spotify válido? Inténtalo de nuevo. ¡Yo te espero!`, m, { contextInfo });
  }

  await m.react("📥"); // Emoji de descarga/espera

  // Helper function to convert milliseconds to minutes and seconds
  const msToTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  };

  try {
    const neviApiUrl = `http://neviapi.ddns.net:5000/spotify`;
    const res = await fetch(neviApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': NEVI_API_KEY,
      },
      body: JSON.stringify({
        url: spotifyUrl,
      }),
    });

    const json = await res.json();

    if (json.status === true && json.result && json.result.download) {
      const result = json.result;

      // Create the caption with all the song metadata - Estilo Masha (Amable y Dulce)
      const caption = `
🌸────── *𝐌𝐚𝐬𝐡𝐚'𝐬 𝐌𝐮𝐬𝐢𝐜 𝐒𝐞𝐫𝐯𝐢𝐜𝐞* ──────🌸
*¡Aquí está tu canción, ${name}-san! Espero que la disfrutes mucho.*

> 🎶 *Título:* ${result.title}
> 🎤 *Artista:* ${result.artists}
> 💿 *Álbum:* ${result.album}
> ⏱️ *Duración:* ${msToTime(result.duration_ms)}
> 🗓️ *Lanzamiento:* ${result.release_date}
═════════════════════
*Si necesitas algo más, solo tienes que pedírmelo. (Спаси́бо - Spasíbo)* ♡`; // Spasíbo = Gracias (Masha es muy educada)

      // Send the image with the metadata caption
      await conn.sendMessage(m.chat, {
        image: { url: result.cover_url },
        caption: caption,
        footer: 'Escucha esta canción y ten un día maravilloso. ¡頑張って! (Ganbatte - ¡Ánimo!)',
        headerType: 4,
        contextInfo
      }, { quoted: m });

      await m.react("💖"); // Un emoji de cariño

      // **Descarga del archivo de audio.**
      const responseAudio = await axios.get(result.download, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(responseAudio.data);

      const fileSizeMb = audioBuffer.length / (1024 * 1024);
      if (fileSizeMb > SIZE_LIMIT_MB) {
          await conn.sendMessage(m.chat, {
              document: audioBuffer,
              fileName: `${result.title} - Masha.mp3`,
              mimetype: 'audio/mpeg',
              caption: `⚠️ *¡Ups! La canción es un poco grande (${fileSizeMb.toFixed(2)} MB).*
Te la envío como documento para que la puedas descargar mejor. ¡Ten paciencia!
🎵 *Pista:* ${result.title}`
          }, { quoted: m });
          await m.react("📄");
      } else {
          await conn.sendMessage(m.chat, {
              audio: audioBuffer,
              mimetype: "audio/mpeg",
              fileName: `${result.title} - Masha.mp3`
          }, { quoted: m });
          await m.react("🎧"); 
      }
      return;
    }
    throw new Error("NEVI API falló.");
  } catch (e) {
    console.error("Error con NEVI API:", e);
    await conn.reply(m.chat, `💔 *Oh, ¡lo siento mucho!*
Hubo un error y no pude conseguir tu pista. Por favor, inténtalo de nuevo más tarde.`, m);
    await m.react("😔"); // Un emoji de tristeza/disculpa
  }
};

handler.help = ['spotify'].map(v => v + ' <URL de Spotify>');
handler.tags = ['descargas'];
handler.command = ['spotify'];
handler.register = true;
handler.prefix = /^[./#]/;

export default handler;
