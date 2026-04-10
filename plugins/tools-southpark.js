import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verificamos que el usuario haya escrito un país
    if (!text) return m.reply(`🍖 ¡Oye! Necesito el nombre de algún país.\nEjemplo: ${usedPrefix + command} Peru`);

    // Mensaje de espera con estilo Luffy
    await conn.sendMessage(m.chat, { 
        text: `🏴‍☠️ ¡Zarpando a buscar información de *${text}*!\n\n⏳ Navegando por el Grand Line de datos...\n🍖 Espera un momento, nakama...` 
    }, { quoted: m });

    try {
        // Limpiamos acentos (ej. Perú -> Peru) para evitar errores en la API
        let query = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Usamos tu Key: LUFFY-GEAR4
        let api = `https://api.alyacore.xyz/tools/country?text=${encodeURIComponent(query)}&apikey=LUFFY-GEAR4`;

        let response = await fetch(api);

        // Si la respuesta no es 200 OK, lanzamos error
        if (!response.ok) throw new Error('Error en la respuesta de la API');

        let json = await response.json();

        // Validamos la estructura del resultado
        if (!json.status || !json.result) {
            return m.reply(`❌ ¡Maldición! No encontré la isla "${text}". Verifica que el nombre esté bien escrito en el mapa.`);
        }

        let pais = json.result;

        // Formateamos variables seguras (por si la API no devuelve algún dato)
        let moneda = pais.currencies && pais.currencies.length > 0 
            ? `${pais.currencies[0].name} (${pais.currencies[0].symbol || ''})` 
            : 'No disponible';
            
        let idiomas = pais.languages ? pais.languages : 'No disponible';
        let fronteras = pais.borders ? pais.borders : 'Ninguna';
        let tld = pais.tld ? pais.tld : 'N/A';
        let timezones = pais.timezones ? pais.timezones : 'N/A';

        // Diseño detallado con temática de Luffy
        let textoInfo = `🏴‍☠️ *INFORMACIÓN DE PAÍS* 👒\n\n` +
            `- *País:* ${pais.flag || '🏳️'} ${pais.name || 'N/A'}\n` +
            `- *Nombre Oficial:* ${pais.officialName || 'N/A'}\n` +
            `- *Capital:* ${pais.capital || 'N/A'}\n` +
            `- *Región:* ${pais.region || 'N/A'}\n` +
            `- *Subregión:* ${pais.subregion || 'N/A'}\n` +
            `- *Continente:* ${pais.continents || 'N/A'}\n\n` +
            `👥 *TRIPULACIÓN Y DEMOGRAFÍA* 🍖\n\n` +
            `- *Población:* ${pais.population ? pais.population.toLocaleString('es-ES') : 'N/A'} habitantes\n` +
            `- *Área:* ${pais.area ? pais.area.toLocaleString('es-ES') : 'N/A'} km²\n` +
            `- *Idiomas:* ${idiomas}\n\n` +
            `💰 *TESOROS Y ECONOMÍA* 🪙\n\n` +
            `- *Moneda:* ${moneda}\n` +
            `- *Índice Gini:* ${pais.gini || 'No registrado'}\n\n` +
            `📍 *COORDENADAS DEL LOG POSE* 🧭\n\n` +
            `- *Sin salida al mar:* ${pais.landlocked ? 'Sí' : 'No'}\n` +
            `- *Fronteras con:* ${fronteras}\n\n` +
            `📞 *CÓDIGOS Y DEN DEN MUSHI* 🐌\n\n` +
            `- *Código telefónico:* ${pais.phone || 'N/A'}\n` +
            `- *TLD:* ${tld}\n` +
            `- *Código ISO (2):* ${pais.cca2 || 'N/A'}\n` +
            `- *Código ISO (3):* ${pais.cca3 || 'N/A'}\n\n` +
            `🚢 *BARCOS Y TRANSPORTE* ⚓\n\n` +
            `- *Lado de conducción:* ${pais.drivingSide === 'right' ? 'Derecha' : pais.drivingSide === 'left' ? 'Izquierda' : 'N/A'}\n\n` +
            `📜 *DATOS DE LA BITÁCORA* 📝\n\n` +
            `- *Independiente:* ${pais.independent ? 'Sí' : 'No'}\n` +
            `- *Miembro ONU:* ${pais.unMember ? 'Sí' : 'No'}\n` +
            `- *Zonas Horarias:* ${timezones}\n` +
            `- *Inicio de semana:* ${pais.startOfWeek || 'N/A'}\n\n` +
            `🗺️ *Ver en mapa:* ${pais.googleMaps || 'N/A'}\n\n` +
            `> _Procesado por *AlyaCore Api* - Gear 4_ 👊🏽💨`;

        // Enviamos con la imagen de la bandera
        await conn.sendMessage(m.chat, { 
            image: { url: pais.flagImage || pais.flag_url }, 
            caption: textoInfo 
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`❌ ¡Rayos! El barco chocó con un error: ${e.message}`);
        if (m.react) m.react('✖️');
    }
};

handler.command = ['paisinfo', 'flag', 'pais'];

export default handler;