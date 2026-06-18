import axios from 'axios';
const { proto, generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent, getDevice } = (await import("@whiskeysockets/baileys")).default;

let handler = async (message, { conn, text, usedPrefix, command }) => {
  // Definir emojis y textos fijos
  const rwait = '⏳';
  const done = '✅';
  const emoji = '🔍';
  const emoji2 = '📥';
  const dev = '⪛✰ Tiktok - Busquedas ✰⪜';

  if (!text) return conn.reply(message.chat, `${emoji} Por favor, ingrese lo que desea buscar en tiktok.`, message);

  async function createVideoMessage(url) {
    const { videoMessage } = await generateWAMessageContent({ video: { url } }, { upload: conn.waUploadToServer });
    return videoMessage;
  }

  async function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  try {
    await message.react(rwait);
    conn.reply(message.chat, `${emoji2} Buscando y procesando videos, espere un momento...`, message);

    // 1. Buscamos los videos en TikTok usando un feed de búsqueda estable
    let form = new URLSearchParams();
    form.append('keywords', text);
    form.append('count', '10');

    let { data: response } = await axios.post('https://www.tikwm.com/api/feed/search', form, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.code !== 0 || !response.data || !response.data.videos || response.data.videos.length === 0) {
       await message.react('❌');
       return conn.reply(message.chat, 'No se encontraron resultados para tu búsqueda.', message);
    }

    let searchResults = response.data.videos;
    shuffleArray(searchResults);
    
    // Seleccionamos 5 videos (ideal para procesar en paralelo rápido sin saturar los scrapers)
    let selectedResults = searchResults.splice(0, 5);
    let results = [];

    // 2. Procesamos cada video encontrado usando tu sistema multi-scraper en paralelo
    await Promise.all(selectedResults.map(async (video) => {
      try {
        // Reconstruimos la URL estándar del video de TikTok usando su ID
        const mockTiktokUrl = `https://www.tiktok.com/@user/video/${video.video_id}`;
        
        // Pasamos la URL por tus funciones de raspado de contingencia
        const scraperResult = await downloadFromMultipleAPIs(mockTiktokUrl);
        
        // Si el scraper obtiene una URL limpia la usa, sino se usa el play directo como respaldo
        const finalVideoUrl = scraperResult?.videoUrl || video.play;
        const finalTitle = video.title || scraperResult?.title || 'Sin título';

        if (finalVideoUrl) {
          results.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: dev }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
              title: '' + finalTitle,
              hasMediaAttachment: true,
              videoMessage: await createVideoMessage(finalVideoUrl)
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
          });
        }
      } catch (err) {
        console.error("Error procesando tarjeta de video:", err.message);
      }
    }));

    if (results.length === 0) {
       await message.react('❌');
       return conn.reply(message.chat, 'No se pudo procesar ningún video con los scrapers actuales.', message);
    }

    // 3. Armando y enviando el contenedor del Carrusel Interactivo
    const responseMessage = generateWAMessageFromContent(message.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({ text: `${emoji} Resultado de: ` + text }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: dev }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...results] })
          })
        }
      }
    }, { quoted: message });

    await message.react(done);
    await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id });
  } catch (error) {
    await message.react('❌');
    console.error("Error en tiktoksearch:", error?.response?.data || error.message);
    await conn.reply(message.chat, `Ocurrió un error: ${error.message}`, message);
  }
};

handler.help = ['tiktoksearch <txt>'];
handler.tags = ['buscador'];
handler.command = ['tiktoksearch', 'ttss', 'tiktoks'];
handler.group = true;
handler.register = true;
handler.coin = 2;

export default handler;


// --- Sistema Scraper de Contingencia (Adaptado a Axios) ---

async function downloadFromMultipleAPIs(url) {
    const apis = [
        { name: 'TikWM', func: () => tiktokTikWM(url) },
        { name: 'Eliasar', func: () => tiktokEliasar(url) },
        { name: 'SSSTik', func: () => tiktokSSSTik(url) },
        { name: 'TikDown', func: () => tiktokTikDown(url) }
    ];

    for (const api of apis) {
        try {
            const result = await api.func();
            if (result && result.videoUrl) {
                return result;
            }
        } catch (error) {
            continue;
        }
    }
    return null;
}

async function tiktokTikWM(url) {
    try {
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.tikwm.com/',
                'Origin': 'https://www.tikwm.com'
            },
            timeout: 10000
        });

        if (data.code === 0 && data.data && data.data.play) {
            return {
                videoUrl: data.data.play,
                title: data.data.title || 'Sin título',
                author: data.data.author?.unique_id || 'Desconocido'
            };
        }
        throw new Error('No video data');
    } catch (error) {
        throw new Error(`TikWM error: ${error.message}`);
    }
}

async function tiktokEliasar(url) {
    try {
        const apiUrl = `https://eliasar-yt-api.vercel.app/api/search/tiktok?query=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 10000
        });

        if (data.results && data.results.video) {
            return {
                videoUrl: data.results.video,
                title: data.results.title || 'Sin título',
                author: data.results.author || 'Desconocido'
            };
        }
        throw new Error('No video data');
    } catch (error) {
        throw new Error(`Eliasar error: ${error.message}`);
    }
}

async function tiktokSSSTik(url) {
    try {
        const apiUrl = `https://ssstik.io/abc?url=dl`;
        const formData = new URLSearchParams();
        formData.append('id', url);
        formData.append('locale', 'en');
        formData.append('tt', 'RFBiZ3Bi');

        const { data: html } = await axios.post(apiUrl, formData.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://ssstik.io',
                'Referer': 'https://ssstik.io/'
            },
            timeout: 10000
        });

        const videoMatch = html.match(/href="([^"]*\.mp4[^"]*)"/);
        const titleMatch = html.match(/<p class="maintext">([^<]+)</);

        if (videoMatch && videoMatch[1]) {
            return {
                videoUrl: videoMatch[1],
                title: titleMatch ? titleMatch[1] : 'Sin título',
                author: 'Desconocido'
            };
        }
        throw new Error('No video URL found');
    } catch (error) {
        throw new Error(`SSSTik error: ${error.message}`);
    }
}

async function tiktokTikDown(url) {
    try {
        const apiUrl = `https://tikdown.org/api/ajaxSearch`;
        const formData = new URLSearchParams();
        formData.append('q', url);
        formData.append('lang', 'en');

        const { data } = await axios.post(apiUrl, formData.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://tikdown.org',
                'Referer': 'https://tikdown.org/'
            },
            timeout: 10000
        });

        if (data.status === 'ok' && data.data) {
            const videoMatch = data.data.match(/href="([^"]*\.mp4[^"]*)"/);
            if (videoMatch && videoMatch[1]) {
                return {
                    videoUrl: videoMatch[1],
                    title: 'Video de TikTok',
                    author: 'Desconocido'
                };
            }
        }
        throw new Error('No video data');
    } catch (error) {
        throw new Error(`TikDown error: ${error.message}`);
    }
}
