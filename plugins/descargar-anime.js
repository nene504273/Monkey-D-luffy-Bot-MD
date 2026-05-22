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

    // data esperado: { title, image, description, episodios, episodesList: [{ num, url }] }
    const { title, image, description, episodios, episodesList } = data;

    // Mostrar máximo 30 capítulos en la lista, con aviso si hay más
    const MAX_LIST = 30;
    let epsText = episodesList
      .slice(0, MAX_LIST)
      .map(e => `• Episodio ${e.num}`)
      .join('\n');
    if (episodesList.length > MAX_LIST) {
      epsText += `\n... y ${episodesList.length - MAX_LIST} episodios más`;
    }

    let caption = `
≡ 🌷 *Título:* ${title}
≡ 🌾 *Descripción:* ${description.slice(0, 200)}...
≡ 🌱 *Episodios totales:* ${episodios}
≡ 🌿 *Episodios disponibles:*

${epsText}

> Responde a este mensaje con el número del episodio (ej: \`1\`, \`5\`, \`• Episodio 3\`) para iniciar la descarga.
`.trim();

    // Enviar imagen de portada
    let buffer = await (await fetch(image)).buffer();
    let sent = await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: m });

    // Guardar sesión para después seleccionar episodio
    conn.anime = conn.anime || {};
    conn.anime[m.sender] = {
      title,
      episodes: episodesList,    // array { num, url }
      key: sent.key,
      timeout: setTimeout(() => {
        // Limpiar sesión tras 10 minutos de inactividad
        if (conn.anime && conn.anime[m.sender]) delete conn.anime[m.sender];
      }, 600_000)
    };

    m.react('✅');
  } catch (err) {
    console.error(err);
    m.reply('❌ Error al buscar el anime. Verifica el nombre o la API Key.');
  }
};

// ----- Intercepta la respuesta para seleccionar episodio -----
handler.before = async (m, { conn }) => {
  conn.anime = conn.anime || {};
  const session = conn.anime[m.sender];
  
  // Solo actuar si hay sesión activa y el mensaje citado coincide con el de la portada
  if (!session || !m.quoted || m.quoted.id !== session.key.id) return;

  const input = m.text.trim();

  // Extraer el número: admite "5", "episodio 5", "• Episodio 5", "capítulo 5", etc.
  const match = input.match(/\b(\d+)\b/);
  const epNum = match ? parseInt(match[1]) : NaN;

  if (isNaN(epNum) || epNum < 1 || epNum > session.episodes.length) {
    return m.reply(`⚠️ Episodio no válido. Responde solo con el número (ej: 1, 2…) o algo como "• Episodio 5".`);
  }

  const episode = session.episodes.find(e => e.num === epNum);
  if (!episode) return m.reply(`❌ El episodio ${epNum} no se encontró en la lista.`);

  // Aquí puedes conectar la lógica de descarga (próximamente)
  // Por ahora notificamos y mantenemos la sesión para usar la URL
  m.reply(`⏳ Preparando descarga de *${session.title}* - Episodio ${epNum}...\n🔗 URL: ${episode.url}`);
  
  // Opcional: mantén la sesión unos segundos más si vas a procesar descarga asincrónica
  // clearTimeout(session.timeout);
  // (No borramos la sesión aún, la descarga puede tomar tiempo)
};

handler.command = ['anime2', 'animedl2'];
handler.tags = ['download'];
handler.help = ['anime2'];

export default handler;