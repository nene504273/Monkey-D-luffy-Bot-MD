/* País Info - AlyaCore API 
- Key: LUFFY-GEAR4
*/

import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verificamos que el usuario haya escrito un país
    if (!text) return m.reply(`Por favor, ingresa el nombre de algún país.\nEjemplo: ${usedPrefix + command} Peru`);

    try {
        // Usamos tu Key: LUFFY-GEAR4 y el parámetro 'text' que es el estándar de esa API
        let api = `https://api.alyacore.xyz/tools/country?text=${encodeURIComponent(text)}&apikey=LUFFY-GEAR4`;

        let response = await fetch(api);
        
        // Si la respuesta no es 200 OK, lanzamos error
        if (!response.ok) throw new Error('Error en la respuesta de la API');
        
        let json = await response.json();

        // Validamos la estructura del resultado
        if (!json.status || !json.result) {
            return m.reply(`❌ No se encontró información para "${text}". Verifica que el nombre esté bien escrito.`);
        }

        let pais = json.result;

        // Formateamos la moneda
        let moneda = pais.currencies && pais.currencies.length > 0 
            ? `${pais.currencies[0].name} (${pais.currencies[0].symbol})` 
            : 'No disponible';

        // Mensaje estético
        let textoInfo = `🍭 *Información De:* ${pais.name} ${pais.flag}\n\n` +
            `🍬 *Nombre Oficial:* ${pais.officialName}\n` +
            `🔖 *Capital:* ${pais.capital}\n` +
            `🗺️ *Continente:* ${pais.continents}\n` +
            `📍 *Región:* ${pais.region}\n` +
            `👥 *Población:* ${pais.population.toLocaleString('es-ES')}\n` +
            `🗣️ *Idiomas:* ${pais.languages}\n` +
            `💬 *Prefijo:* ${pais.phone}\n` +
            `💸 *Moneda:* ${moneda}\n` +
            `📏 *Área:* ${pais.area.toLocaleString('es-ES')} km²\n` +
            `📍 *Ubicación:* ${pais.googleMaps}`;

        // Enviamos con la imagen de la bandera
        await conn.sendMessage(m.chat, { 
            image: { url: pais.flagImage }, 
            caption: textoInfo 
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`❌ Hubo un fallo: ${e.message}`);
        if (m.react) m.react('✖️');
    }
};

handler.command = ['paisinfo', 'flag', 'pais'];

export default handler;