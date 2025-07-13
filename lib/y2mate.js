import fetch from 'node-fetch';
import cheerio from 'cheerio';

async function performY2mateRequest(url, payload) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'accept': "*/*",
            'accept-language': "en-US,en;q=0.9",
            'content-type': "application/x-www-form-urlencoded; charset=UTF-8",
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        },
        body: new URLSearchParams(Object.entries(payload))
    });

    // VERIFICACIÓN 1: Chequear si la petición fue exitosa (códigos 2xx)
    if (!response.ok) {
        throw new Error(`La API de y2mate respondió con un error HTTP ${response.status} ${response.statusText}. El sitio podría estar bloqueando las peticiones.`);
    }

    // VERIFICACIÓN 2: Asegurarse de que la respuesta es JSON antes de procesarla.
    let data;
    try {
        data = await response.json();
    } catch (e) {
        throw new Error('La API de y2mate no devolvió un JSON válido. Es probable que haya respondido con una página de error o CAPTCHA.');
    }

    return data;
}

const commonLogic = async (yutub, isVideo) => {
    const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;
    const ytId = ytIdRegex.exec(yutub);
    if (!ytId) throw new Error('No se pudo encontrar una ID de YouTube válida en el enlace.');

    const videoId = ytId[1];
    const analyzeResponse = await performY2mateRequest('https://www.y2mate.com/mates/en68/analyze/ajax', {
        url: `https://www.youtube.com/watch?v=${videoId}`, q_auto: 0, ajax: 1
    });

    if (analyzeResponse.status !== 'ok' || typeof analyzeResponse.result !== 'string') {
        throw new Error('Fallo al analizar el video. La respuesta de la API no fue exitosa o tiene un formato incorrecto.');
    }

    const $ = cheerio.load(analyzeResponse.result);
    const k_id = /var k__id = "(.*?)"/.exec(analyzeResponse.result)?.[1];
    if (!k_id) throw new Error('No se pudo encontrar la clave de conversión (k__id).');

    const thumb = $('div.thumbnail.cover > a > img').attr('src');
    const title = $('div.thumbnail.cover > div > b').text();
    const tableSelector = isVideo ? '#mp4' : '#mp3';
    const firstRow = $(`${tableSelector} table tbody tr`).first();
    const quality = firstRow.find('a').attr('data-fquality');
    const ftype = firstRow.find('a').attr('data-ftype');
    const size = firstRow.find('td:nth-child(2)').text();

    if (!ftype || !quality) throw new Error(`No se encontraron opciones de descarga para ${isVideo ? 'video' : 'audio'}.`);

    const convertResponse = await performY2mateRequest('https://www.y2mate.com/mates/en68/convert', {
        type: 'youtube', _id: k_id, v_id: videoId, ajax: '1', token: '', ftype, fquality: quality
    });

    if (convertResponse.status !== 'ok' || typeof convertResponse.result !== 'string') {
        throw new Error('Fallo al convertir el archivo. La respuesta de la API no fue exitosa.');
    }

    const $$ = cheerio.load(convertResponse.result);
    const link = $$('a').attr('href');
    if (!link) throw new Error('No se pudo extraer el enlace de descarga final.');

    return { thumb, title, quality, tipe: ftype, size, link };
};

const ytv = (yutub) => commonLogic(yutub, true);
const yta = (yutub) => commonLogic(yutub, false);

export { yta, ytv };
