import fetch from 'node-fetch';

const API_KEY = 'LUFFY-GEAR4';
const BASE_API = 'https://api.alyacore.xyz/anime/dl/anime';

// Función para consultar la API
async function fetchAnimeData(query) {
  const url = `${BASE_API}?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!json.status) throw new Error('API no devolvió resultados');
  return json.data;
}

let handler = async (m, { command, usedPrefix, conn, text }) => {
  if (!text) return m.reply(`🌱 Ingresa el título del anime.\nEjemplo: ${usedPrefix + command} Tokyo Ghoul`);

  try {
    m.react('🔍');
    const data = await fetchAnimeData(text);

    // data contiene title, image, description, episodesList, etc.
    const { title, image, description, episodios, episodesList } = data;

    let epsText = episodesList.map(e => `• Episodio ${e.num}`).join('\n');

    let caption = `
≡ 🌷 *Título:* ${title}
≡ 🌾 *Descripción:* ${description.slice(0, 200)}...
≡ 🌱 *Episodios totales:* ${episodios}
≡ 🌿 *Episodios disponibles:*

${epsText}

> Responde a este mensaje con el número del episodio para descargarlo (próximamente).
`.trim();

    // Enviar imagen de portada
    let buffer = await (await fetch(image)).buffer();
    let sent = await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: m });

    // Guardar sesión para después seleccionar episodio
    conn.anime = conn.anime || {};
    conn.anime[m.sender] = {
      title,
      episodes: episodesList,  // array { num, url }
      key: sent.key,
      timeout: setTimeout(() => delete conn.anime[m.sender], 600_000)
    };

    m.react('✅');
  } catch (err) {
    console.error(err);
    m.reply('❌ Error al buscar el anime. Verifica el nombre o la API Key.');
  }
};

// handler.before mejorado: soporta formatos como "• Episodio 1" o "capítulo 2"
handler.before = async (m, { conn }) => {
  conn.anime = conn.anime || {};
  const session = conn.anime[m.sender];
  if (!session || !m.quoted || m.quoted.id !== session.key.id) return;

  // Extraer número de episodio (soporta "1", "• Episodio 1", "capítulo 2", etc.)
  const match = m.text.trim().match(/(\d+)/);
  const epNum = match ? parseInt(match[1]) : NaN;

  if (isNaN(epNum) || epNum < 1 || epNum > session.episodes.length) {
    return m.reply(`⚠️ Episodio no válido. Responde solo con el número (ej: 1, 2...).`);
  }

  const episode = session.episodes.find(e => e.num === epNum);
  if (!episode) return m.reply(`Episodio ${epNum} no encontrado.`);

  m.reply(`⏳ Preparando descarga de ${session.title} - Episodio ${epNum}...`);
  // Aquí más adelante irá la lógica de descarga real
  clearTimeout(session.timeout);
  delete conn.anime[m.sender];
  // m.reply('Descarga no implementada aún...');
};

handler.command = ['anime2', 'animedl2'];
handler.tags = ['download'];
handler.help = ['anime2'];

export default handler;