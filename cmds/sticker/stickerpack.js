import db from "#db";
import axios from 'axios';
import sharp from 'sharp';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const toBuffer = async (url) => Buffer.from((await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data);

const toWebp = async (buffer, isAnimated = false) => {
  if (isAnimated) {
    return await sharp(buffer, { animated: true }).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 50, loop: 0 }).toBuffer();
  }
  let webp = await sharp(buffer).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 50 }).toBuffer();
  if (webp.length > 100 * 1024) {
    webp = await sharp(buffer).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 40 }).toBuffer();
  }
  return webp;
};

const isStickerUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?sticker\.ly\/s\/[a-zA-Z0-9]+$/i.test(url);
};

// Pasamos apiUrl y apiKey como argumentos para que no crashee en la raíz
const searchPacks = async (query, apiUrl, apiKey, attempt = 1) => {
  try {
    const { data } = await axios.get(`${apiUrl}/stickerly/search`, { params: { query, key: apiKey }, timeout: 10000 });
    return data;
  } catch (e) {
    if (e.response?.status === 429 && attempt <= 3) { await delay((e.response.headers['retry-after'] || 5) * 1000); return searchPacks(query, apiUrl, apiKey, attempt + 1); }
    throw e;
  }
};

const downloadPack = async (url, apiUrl, apiKey, attempt = 1) => {
  try {
    const { data } = await axios.get(`${apiUrl}/stickerly/detail`, { params: { url, key: apiKey }, timeout: 10000 });
    return data;
  } catch (e) {
    if (e.response?.status === 429 && attempt <= 3) { await delay((e.response.headers['retry-after'] || 5) * 1000); return downloadPack(url, apiUrl, apiKey, attempt + 1); }
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
  command: ['stickerpack', 'spack'],
  category: 'stickers',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      // 1. Obtenemos las credenciales de la API de forma segura al momento de ejecutar
      const apiUrl = typeof api !== 'undefined' ? api.url : (global.api?.url || 'URL_POR_DEFECTO');
      const apiKey = typeof api !== 'undefined' ? api.key : (global.api?.key || 'KEY_POR_DEFECTO');

      if (!text) return sock.reply(msg.chat, `《✧》 Ingresa un texto para buscar packs de stickers o una URL de sticker.ly.`, msg);
      
      // 2. Agregamos el encadenamiento opcional (?.) para evitar el error si el usuario es nuevo
      const userData = await db.getUser(msg.sender);
      const name = userData?.name || msg.sender.split('@')[0];
      
      let packData;
      const stickerMatch = text.match(/(?:sticker\.ly\/s\/)([a-zA-Z0-9]+)(?:\s|$)/);
      const url = stickerMatch ? 'https://sticker.ly/s/' + stickerMatch[1] : (isStickerUrl(text) ? text : null);
      
      if (url) {
        let detail = await downloadPack(url, apiUrl, apiKey);
        if (!detail || !detail.status || detail.error === 500) {
          return sock.reply(msg.chat, `《✧》 El pack de la URL no está disponible o es privado.`, msg);
        }
        if (!detail.detalles) return sock.reply(msg.chat, `《✧》 No se pudo obtener el pack desde la URL.`, msg);
        packData = detail.detalles;
      } else {
        const search = await searchPacks(text, apiUrl, apiKey);
        if (!search.status || !search.resultados?.length) return sock.reply(msg.chat, `《✧》 No se encontraron packs para *${text}*.`, msg);
        
        const relevantPacks = filterRelevantPacks(search.resultados, text);
        let packsToTry = relevantPacks.length > 0 ? relevantPacks : search.resultados;
        let selectedPack = null;
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
          selectedPack = packsToTry[index];
          const res = await downloadPack(selectedPack.url, apiUrl, apiKey);
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
      
      const { name: packName, author, stickers, thumbnailUrl } = packData;      
      if (!stickers?.length) {
        return sock.reply(msg.chat, `《✧》 El pack no contiene stickers válidos.`, msg);
      }
      
      const MAX_STICKERS = 30;
      const selectedStickers = stickers.slice(0, MAX_STICKERS);
      
      const [cover, stickerResults] = await Promise.all([
        (async () => {
          try {
            return await sharp(await toBuffer(thumbnailUrl)).resize(96, 96, { fit: 'cover' }).webp({ quality: 60 }).toBuffer();
          } catch {
            return await sharp({ create: { width: 96, height: 96, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } }}).webp().toBuffer();
          }
        })(),
        Promise.all(selectedStickers.map(async (s) => {
          try {
            const buffer = await toBuffer(s.imageUrl);
            const sticker = await toWebp(buffer, s.isAnimated || false);
            return { sticker, isAnimated: s.isAnimated || false, isLottie: false, emojis: ['🎭'] };
          } catch {
            return null;
          }
        })).then(results => results.filter(r => r !== null))
      ]);      
      
      if (!stickerResults.length) return sock.reply(msg.chat, `《✧》 No se pudieron procesar los stickers del pack.`, msg);
      
      await sock.sendMessage(msg.chat, { stickerPack: { name: packName, publisher: author?.name || author?.username || `@${name}`, description: 'Sᴛᴇʟʟᴀʀ 🧠 Wᴀʙᴏᴛ', cover, stickers: stickerResults }}, { quoted: msg });      
      
    } catch (e) {
      console.error("Error en spack:", e); // Esto te permitirá ver el error real en tu consola
      // 3. Fallback en caso de que msgglobal no esté definida globalmente
      const errorText = typeof msgglobal !== 'undefined' ? msgglobal : `《✧》 Ocurrió un error inesperado al descargar el pack.`;
      
      if (typeof msg.reply === 'function') return msg.reply(errorText);
      return sock.reply(msg.chat, errorText, msg);
    }
  }
};
