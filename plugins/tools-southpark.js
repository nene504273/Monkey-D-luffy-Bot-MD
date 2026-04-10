/* País Info - Adaptado para AlyaCore API */

import fetch from 'node-fetch';

// 👇 COLOCA TU API KEY DE ALYACORE AQUÍ 👇
const API_KEY = 'LUFFY-GEAR4'; 

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verificamos que el usuario haya escrito un país
    if (!text) {
        return m.reply(`Por favor, ingresa el nombre de algún país.\nEjemplo: ${usedPrefix + command} Peru`);
    }

    try {
        // Estructura de la URL con la nueva API y tu API Key
        // Nota: He usado "?query=" para el nombre del país. Si la API de AlyaCore usa "?name=" o "?q=", solo cambia la palabra "query" en el enlace.
        let api = `https://api.alyacore.xyz/tools/country?query=${encodeURIComponent(text)}&apikey=${API_KEY}`;

        let response = await fetch(api);
        let json = await response.json();

        // Verificamos si la API devolvió un status true o si tiró error de API Key
        if (!json.status || !json.result) {
            return m.reply(`❌ No se encontró información para el país "${text}" o la API Key es incorrecta/está vencida.`);
        }

        // Accedemos a los datos
        let pais = json.result;

        // Extraemos la moneda de forma segura
        let moneda = pais.currencies && pais.currencies.length > 0 
            ? `${pais.currencies[0].name} (${pais.currencies[0].symbol})` 
            : 'Desconocida';

        // Construimos el mensaje con los datos
        let textoInfo = `🍭 *Información De:* ${pais.name} ${pais.flag}\n\n` +
            `🍬 *Nombre Oficial:* ${pais.officialName}\n` +
            `🔖 *Capital:* ${pais.capital}\n` +
            `🗺️ *Continente:* ${pais.continents}\n` +
            `📍 *Región:* ${pais.region} (${pais.subregion})\n` +
            `👥 *Población:* ${pais.population.toLocaleString('es-ES')}\n` +
            `🗣️ *Idiomas:* ${pais.languages}\n` +
            `💬 *Prefijo:* ${pais.phone}\n` +
            `💸 *Moneda:* ${moneda}\n` +
            `📏 *Área:* ${pais.area.toLocaleString('es-ES')} km²\n` +
            `📍 *Ubicación:* ${pais.googleMaps}`;

        let img = pais.flagImage;

        // Enviamos el mensaje con la imagen
        await conn.sendMessage(m.chat, { image: { url: img }, caption: textoInfo }, { quoted: m });

    } catch (e) {
        // Captura de errores de conexión o caídas de la API
        console.error(e);
        m.reply(`Ocurrió un error al intentar conectarse a la API: ${e.message}`);
        
        if (typeof m.react === 'function') {
            m.react('✖️');
        }
    }
};

handler.command = ['paisinfo', 'flag', 'pais'];

export default handler;