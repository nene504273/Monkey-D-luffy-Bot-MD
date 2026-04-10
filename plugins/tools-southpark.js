import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🍖 ¡Oye! Necesito el nombre de algún país.\nEjemplo: ${usedPrefix + command} Peru`);

    await conn.sendMessage(m.chat, { 
        text: `🏴‍☠️ ¡Zarpando a buscar información de *${text}*!\n\n⏳ Navegando por el Grand Line de datos...\n🍖 Espera un momento, nakama...` 
    }, { quoted: m });

    try {
        // Limpiar acentos
        let query = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        let api = `https://api.alyacore.xyz/tools/country?text=${encodeURIComponent(query)}&apikey=LUFFY-GEAR4`;
        let response = await fetch(api);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        let json = await response.json();

        // Validación de respuesta
        if (!json.status || !json.result) {
            return m.reply(`❌ ¡Maldición! No encontré la isla "${text}". Verifica que el nombre esté bien escrito en el mapa.`);
        }

        let pais = json.result;

        // --- PROCESAMIENTO ROBUSTO DE CAMPOS ---

        // Monedas: puede ser objeto { USD: {...} } o array
        let moneda = 'No disponible';
        if (pais.currencies) {
            if (Array.isArray(pais.currencies)) {
                moneda = pais.currencies.map(c => `${c.name} (${c.symbol || ''})`).join(', ');
            } else {
                let values = Object.values(pais.currencies);
                moneda = values.map(c => `${c.name} (${c.symbol || ''})`).join(', ');
            }
        }

        // Idiomas: objeto { spa: "Spanish", eng: "English" } -> string
        let idiomas = pais.languages 
            ? (Array.isArray(pais.languages) ? pais.languages.join(', ') : Object.values(pais.languages).join(', '))
            : 'No disponible';

        // Fronteras: array -> string
        let fronteras = pais.borders ? (Array.isArray(pais.borders) ? pais.borders.join(', ') : pais.borders) : 'Ninguna';

        // Zonas horarias: array -> string
        let timezones = pais.timezones ? (Array.isArray(pais.timezones) ? pais.timezones.join(', ') : pais.timezones) : 'N/A';

        // TLD: array o string
        let tld = pais.tld ? (Array.isArray(pais.tld) ? pais.tld.join(', ') : pais.tld) : 'N/A';

        // Continentes: array -> string
        let continentes = pais.continents ? (Array.isArray(pais.continents) ? pais.continents.join(', ') : pais.continents) : 'N/A';

        // Imagen de bandera: probar varias propiedades posibles
        let banderaUrl = pais.flagImage || pais.flag_url || pais.flags?.png || pais.flags?.svg || '';

        // --- CONSTRUCCIÓN DEL MENSAJE ---
        let textoInfo = `🏴‍☠️ *INFORMACIÓN DE PAÍS* 👒\n\n` +
            `- *País:* ${pais.flag || '🏳️'} ${pais.name || 'N/A'}\n` +
            `- *Nombre Oficial:* ${pais.officialName || 'N/A'}\n` +
            `- *Capital:* ${pais.capital || 'N/A'}\n` +
            `- *Región:* ${pais.region || 'N/A'}\n` +
            `- *Subregión:* ${pais.subregion || 'N/A'}\n` +
            `- *Continente:* ${continentes}\n\n` +
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

        // Enviar con imagen de bandera si existe
        if (banderaUrl) {
            await conn.sendMessage(m.chat, { 
                image: { url: banderaUrl }, 
                caption: textoInfo 
            }, { quoted: m });
        } else {
            // Si no hay imagen, enviamos solo texto
            await conn.sendMessage(m.chat, { text: textoInfo }, { quoted: m });
        }

    } catch (e) {
        console.error(e);
        m.reply(`❌ ¡Rayos! El barco chocó con un error: ${e.message}`);
        if (m.react) m.react('✖️');
    }
};

handler.command = ['paisinfo', 'flag', 'pais'];

export default handler;