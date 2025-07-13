import fetch from 'node-fetch';
import cheerio from 'cheerio';

async function performY2mateRequest(url, payload) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'accept': "*/*",
            'accept-language': "en-US,en;q=0.9",
            'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: new URLSearchParams(Object.entries(payload))
    });
    return response.json();
}

const commonLogic = async (yutub, isVideo) => {
    const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;
    const ytId = ytIdRegex.exec(yutub);

    if (!ytId) {
        throw new Error('No se pudo encontrar una ID de YouTube válida en el enlace.');
    }

    const videoId = ytId[1];
    const analyzeUrl = 'https://www.y2mate.com/mates/en68/analyze/ajax';
    const analyzePayload = { url: `https://www.youtube.com/watch?v=${videoId}`, q_auto: 0, ajax: 1 };

    const analyzeResponse = await performY2mateRequest(analyzeUrl, analyzePayload);

    // **VERIFICACIÓN 1**: Asegurarse de que la primera respuesta de la API sea válida
    if (!analyzeResponse || typeof analyzeResponse.result !== 'string' || analyzeResponse.result.includes('error')) {
        throw new Error('Fallo al analizar el video. Puede que el video no esté disponible o la API haya cambiado.');
    }

    const $ = cheerio.load(analyzeResponse.result);
    const k_id = /var k__id = "(.*?)"/.exec(analyzeResponse.result)?.[1];
    if (!k_id) {
        throw new Error('No se pudo encontrar la clave de conversión (k__id) en la respuesta.');
    }

    const thumb = $('.thumbnail.cover > a > img').attr('src');
    const title = $('.thumbnail.cover > div > b').text();
    const tableSelector = isVideo ? '#mp4' : '#mp3';

    // Para simplificar, tomamos la primera opción disponible en la tabla de audio o video
    const firstRow = $(`${tableSelector} table tbody tr`).first();
    const quality = firstRow.find('a').attr('data-fquality');
    const ftype = firstRow.find('a').attr('data-ftype');
    const size = firstRow.find('td:nth-child(2)').text();

    if (!ftype || !quality) {
        throw new Error(`No se encontraron opciones de descarga para ${isVideo ? 'video' : 'audio'}.`);
    }

    const convertUrl = 'https://www.y2mate.com/mates/en68/convert';
    const convertPayload = { type: 'youtube', _id: k_id, v_id: videoId, ajax: '1', token: '', ftype, fquality: quality };

    const convertResponse = await performY2mateRequest(convertUrl, convertPayload);

    // **VERIFICACIÓN 2**: Asegurarse de que la respuesta de conversión sea válida
    if (!convertResponse || typeof convertResponse.result !== 'string' || convertResponse.result.includes('error')) {
        throw new Error('Fallo al convertir el archivo. La respuesta de la API no es válida.');
    }

    const $$ = cheerio.load(convertResponse.result);
    const link = $$('a').attr('href');

    if (!link) {
        throw new Error('No se pudo extraer el enlace de descarga final.');
    }

    return { thumb, title, quality, tipe: ftype, size, link, output: `${title}.${ftype}` };
};

const ytv = (yutub) => commonLogic(yutub, true);
const yta = (yutub) => commonLogic(yutub, false);

export { yta, ytv };
/*
by https://instabio.cc/fg98ff
Código refactorizado y asegurado por Gemini
*/
