import fetch from 'node-fetch';

const CAUSA_API_KEY = 'LUFFY-GEAR5';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '🎵';

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `${emoji} Envíame un enlace de YouTube.\n\nEjemplo:\n${usedPrefix + command} https://youtu.be/KHgllosZ3kA`,
      m
    );
  }

  try {
    await conn.reply(m.chat, `📌 Procesando audio...`, m);

    const url = args[0];
    const apiUrl = `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=${encodeURIComponent(url)}&type=audio&apikey=${CAUSA_API_KEY}`;

    const res = await fetch(apiUrl);
    const json = await res.json().catch(() => null);

    if (!json || !json.status || !json.data) {
      return conn.reply(m.chat, `❌ No se pudo obtener el audio. Verifica el enlace.`, m);
    }

    const data = json.data;
    const title = data.title || 'audio';
    const downloadURL = data.download?.url;

    if (!downloadURL) {
      return conn.reply(m.chat, `❌ No se encontró enlace de descarga.`, m);
    }

    // Enviar el audio sin ninguna decoración que cause errores
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: downloadURL },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false
      },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, `❌ Error: ${e.message}`, m);
  }
};

handler.help = ['ytmp3 <link>'];
handler.tags = ['descargas'];
handler.command = ['ytmp3', 'ytaudio'];
handler.register = true;
handler.limit = true;
handler.coin = 2;

export default handler;