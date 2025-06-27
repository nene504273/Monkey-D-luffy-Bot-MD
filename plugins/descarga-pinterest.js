import axios from 'axios';
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@whiskeysockets/baileys')).default;

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const emoji = '📌';

  if (!args[0]) return m.reply(`${emoji} Ingresa un enlace de *Pinterest* válido.\nEjemplo: ${usedPrefix + command} https://www.pinterest.com/pin/862439397377053654`);

  await m.react('⏳');
  try {
    const url = args[0];
    const res = await axios.get(`https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(url)}`);
    const json = res.data;

    if (!json.status || !json.data?.url) {
      return m.reply(`${emoji} No se pudo obtener el video. Asegúrate de que el enlace es válido.`);
    }

    await conn.sendMessage(m.chat, {
      video: { url: json.data.url },
      caption: `${emoji} *Video descargado desde Pinterest*\n📎 ID: ${json.data.id}\n🕒 Fecha: ${json.data.created_at}`
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    console.error(e);
    await m.reply('❌ Ocurrió un error al intentar descargar el video de Pinterest.');
  }
};

handler.command = ['pinvideo', 'pindl', 'pinterestdl'];
handler.register = true;
handler.help = ['pinvideo <url>'];
handler.tags = ['descargas'];

export default handler;
