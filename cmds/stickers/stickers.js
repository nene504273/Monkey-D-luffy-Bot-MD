import axios from 'axios';
import db from '#db';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isStickerUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?sticker\.ly\/s\/[a-zA-Z0-9]+$/i.test(url);
};

const searchPacks = async (query, attempt = 1) => {
  try {
    const { data } = await axios.get(`${global.APIs.yuki.url}/stickerly/search`, { params: { query, key: global.APIs.yuki.key }, timeout: 10000 });
    return data;
  } catch (e) {
    if (e.response?.status === 429 && attempt <= 3) { await delay((e.response.headers['retry-after'] || 5) * 1000); return searchPacks(query, attempt + 1); }
    throw e;
  }
};

const downloadPack = async (url, attempt = 1) => {
  try {
    const { data } = await axios.get(`${global.APIs.yuki.url}/stickerly/detail`, { params: { url, key: global.APIs.yuki.key }, timeout: 10000 });
    return data;
  } catch (e) {
    if (e.response?.status === 429 && attempt <= 3) { await delay((e.response.headers['retry-after'] || 5) * 1000); return downloadPack(url, attempt + 1); }
    if (e.response?.status === 500) return { status: false, error: 500 };
    throw e;
  }
};

const filterRelevantPacks = (packs, query) => {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return packs;
  return packs.filter(pack => {
    const packName = (pack.name || '').toLowerCase();
    return packName.includes(searchTerm);
  });
};

export default {
  command: ['stickerpack', 'spack', 'stickers'],
  category: 'stickers',
  description: 'Buscar y descargar packs de stickers.',
  run: async ({ msg, sock, text }) => {
    try {
      if (!text) return sock.reply(msg.chat, `《✧》 Ingresa un texto para buscar packs de stickers o una URL de sticker.ly.`, msg);
      await msg.react('🕒');
      const name = db.getUser(msg.sender)?.name || msg.sender.split('@')[0];
      let packData;
      const stickerMatch = text.match(/(?:sticker\.ly\/s\/)([a-zA-Z0-9]+)(?:\s|$)/);
      const url = stickerMatch ? 'https://sticker.ly/s/' + stickerMatch[1] : (isStickerUrl(text) ? text : null);
      if (url) {
        let detail = await downloadPack(url);
        if (!detail || !detail.status || detail.error === 500) {
          return sock.reply(msg.chat, `《✧》 El pack de la URL no está disponible o es privado.`, msg);
        }
        if (!detail.detalles) return sock.reply(msg.chat, `《✧》 No se pudo obtener el pack desde la URL.`, msg);
        packData = detail.detalles;
      } else {
        const search = await searchPacks(text);
        if (!search.status || !search.resultados?.length) return sock.reply(msg.chat, `《✧》 No se encontraron packs para *${text}*.`, msg);
        const relevantPacks = filterRelevantPacks(search.resultados, text);
        let packsToTry = relevantPacks.length > 0 ? relevantPacks : search.resultados;
        let detail = null;
        let intentos = 0;
        const maxIntentos = Math.min(packsToTry.length, 5);
        const indices = [...Array(packsToTry.length).keys()];
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        while (intentos < maxIntentos && !detail) {
          const index = indices[intentos];
          const res = await downloadPack(packsToTry[index].url);
          if (res?.status && res?.detalles?.stickers?.length > 0) {
            detail = res.detalles;
            break;
          }
          intentos++;
        }
        if (!detail) {
          return sock.reply(msg.chat, `《✧》 No se pudo descargar ningún pack válido.`, msg);
        }
        packData = detail;
      }
      const { name: packName, author, stickers } = packData;
      if (!stickers?.length) {
        return sock.reply(msg.chat, `《✧》 El pack no contiene stickers válidos.`, msg);
      }
      const MAX_STICKERS = 50;
      const selectedStickers = stickers.slice(0, MAX_STICKERS);
      const stickerResults = selectedStickers.map(s => ({
        url: s.imageUrl,
        isAnimated: s.isAnimated || false,
        isLottie: false,
        emojis: ['🎭']
      }));
      if (!stickerResults.length) return sock.reply(msg.chat, `《✧》 No se pudieron procesar los stickers del pack.`, msg);
      await sock.sendMessage(msg.chat, { stickerPack: { name: packName, publisher: author?.name || author?.username || `@${name}`, description: 'ʏᴜᴋɪ 🧠 Wᴀʙᴏᴛ', stickers: stickerResults } }, { quoted: msg });
      await msg.react('✔️');
    } catch (e) {
      await msg.react('✖️');
      return msg.reply(`> Error: *${e.message}*`);
    }
  }
};
