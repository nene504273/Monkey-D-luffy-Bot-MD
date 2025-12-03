import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import PhoneNumber from 'awesome-phonenumber';

// --- Constantes de Configuración Navideña ---
// ¡SE ELIMINÓ TODO EL SISTEMA DE COOLDOWN!
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '*🎄 Jolly Roger Navideño V2 🎄*'; 
const packname = '🎁 StrawHat-Crew 🎁';

// --- Estilos de Letras Kawaii/Aesthetic/Navideñas ---
const kawaiis = {
    // Encabezado limpio sin adornos
    border_line: '', 
    
    // Estilo para cada línea de información
    info: (key, value) => `*| ${key}:* _${value}_`,
    
    // Estilo para el encabezado de cada categoría de comandos
    section_title: (text) => `\n╭┈─────── ೄྀ࿐ ˊˎ- \n*╰┈➤ ❄️ ${text}*`, 
    
    // Estilo para cada comando
    command: (cmd) => `*•* ${cmd}`,
};

let handler = async (m, { conn, usedPrefix }) => {
    // --- ¡Alerta de Jolly Roger! Manejo de errores de lectura de DB ---
    let mediaLinks;
    try {
        const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
        const dbRaw = fs.readFileSync(dbPath);
        mediaLinks = JSON.parse(dbRaw).links;
    } catch (e) {
        console.error("¡Ay no! Error al leer o parsear src/database/db.json:", e);
        return conn.reply(m.chat, '¡Error de mapa navideño! No pude leer la base de datos de los tesoros. ☠️', m);
    }
    // --- ¡Fin del Bloque de Aventuras! ---

    if (m.quoted?.id && m.quoted?.fromMe) return;

    // --- LÓGICA DE COOLDOWN ELIMINADA ---

    let name;
    try {
        name = await conn.getName(m.sender);
    } catch {
        name = 'Duende Novato'; // Nombre predeterminado navideño
    }

    const isMain = conn.user.jid === global.conn.user.jid;
    const principalNumber = global.conn?.user?.jid?.split('@')[0] || "¡Regalo Desconocido!";
    const totalCommands = Object.keys(global.plugins || {}).length;
    const uptime = clockString(process.uptime() * 1000);
    const totalreg = Object.keys(global.db?.data?.users || {}).length;

    // --- Bloque de Tiempos y Zonas Horarias ---
    const venezuelaTime = moment().tz('America/Caracas').format('h:mm A');
    let userTimezoneText = 'Hora Desconocida 🗺️';
    const userDB = global.db.data.users[m.sender];

    if (userDB && userDB.timezone && moment.tz.names().includes(userDB.timezone)) {
        try {
            const userTime = moment().tz(userDB.timezone).format('h:mm A');
            const friendlyName = userDB.timezone.split('/').pop().replace('_', ' ');
            userTimezoneText = `${userTime} (${friendlyName})`;
        } catch (e) {}
    }

    if (userTimezoneText === 'Hora Desconocida 🗺️') {
        try {
            const pn = new PhoneNumber(m.sender);
            const regionCode = pn.getRegionCode();
            if (regionCode) {
                const timezones = moment.tz.zonesForCountry(regionCode);
                if (timezones && timezones.length > 0) {
                    const userTime = moment().tz(timezones[0]).format('h:mm A');
                    userTimezoneText = `${userTime} (Detectado: ${regionCode})`;
                }
            }
        } catch (e) {}
    }
    // --- Fin del Bloque de Tiempos ---

    const gifVideo = mediaLinks.video[Math.floor(Math.random() * mediaLinks.video.length)];
    const randomThumbnail = mediaLinks.imagen[Math.floor(Math.random() * mediaLinks.imagen.length)];

    const emojis = {
        'main': '📜', 'tools': '🛠️', 'audio': '🎶', 'group': '🦌', 
        'owner': '👑', 'fun': '🥳', 'info': '🎁', 'internet': '🌐',
        'downloads': '⬇️', 'admin': '⚓', 'anime': '🎌', 'nsfw': '🔞',
        'search': '🔍', 'sticker': '🖼️', 'game': '🎲', 'premium': '💎', 'bot': '🤖'
    };

    let groups = {};
    for (let plugin of Object.values(global.plugins || {})) {
        if (!plugin.help || !plugin.tags) continue;
        for (let tag of plugin.tags) {
            if (!groups[tag]) groups[tag] = [];
            for (let help of plugin.help) {
                if (/^\$|^=>|^>/.test(help)) continue;
                groups[tag].push(`${usedPrefix}${help}`);
            }
        }
    }

    for (let tag in groups) {
        groups[tag].sort((a, b) => a.localeCompare(b));
    }
    
    // --- Creación de Secciones con Estilo Kawaii ---
    const sections = Object.entries(groups).map(([tag, cmds]) => {
        const emoji = emojis[tag] || '🎁';
        const sectionTitle = kawaiis.section_title(`${emoji} ${tag.toUpperCase()} `);
        const commandList = cmds.map(cmd => kawaiis.command(cmd)).join('\n');
        return `${sectionTitle}\n${commandList}`;
    }).join(''); 

    // --- Encabezado Navideño (Limpio) ---
    const headerTitle = `🎄 ¡B I E N V E N I D O S V2! 🎁`;
    
    const headerInfo = `
${kawaiis.info('Capitán', name)}
${kawaiis.info('Bote Pirata', isMain ? 'Principal' : `Sub-Bote | Principal: ${principalNumber}`)}
${kawaiis.info('Comandos del Mapa', totalCommands)}
${kawaiis.info('Tiempo en Alta Mar', uptime)}
${kawaiis.info('Hora del Polo Norte', venezuelaTime)}
${kawaiis.info('Hora del Usuario', userTimezoneText)}
${kawaiis.info('Tripulantes', totalreg)}
${kawaiis.info('Rey Pirata', `wa.me/${global.owner?.[0]?.[0] || "¡Santa Desconocido!"}`)}
`.trim();

    const finalHeader = `${headerTitle}\n\n${headerInfo}`;
    
    // --- BLOQUE DE MENÚ ENCERRADO CON BORDES (Menú Navideño) ---
    const menuBlock = `
*╭━━⋆⋅⋅━━✶━━⋅⋅⋆━━╮*
*✨ M E N Ú   N A V I D E Ñ O ❄️*
*╰━━⋆⋅⋅━━✶━━⋅⋅⋆━━╮*
${sections}

*╭┈─────── ೄྀ࿐ ˊˎ-*\n*╰┈➤* [💡] Si tu hora no es correcta, usa *.settimezone* para ajustarla.
*╭━━⋆⋅⋅━━✶━━⋅⋅⋆━━╮*
*¡F E L I Z   N A V I D A D! 🎅🏻*
*╰━━⋆⋅⋅━━✶━━⋅⋅⋆━━╮*
`.trim();

    const finalText = `${finalHeader}\n\n${menuBlock}`;

    const contextInfo = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName,
            serverMessageId: -1
        },
        externalAdReply: {
            title: packname,
            body: '¡Descubre todos los regalos del StrawHat-Bot V2!',
            thumbnailUrl: randomThumbnail,
            sourceUrl: 'https://github.com/nevi-dev/Vermeil-bot', 
            mediaType: 1,
            renderLargerThumbnail: false
        }
    };

    let sentMsg;
    try {
        sentMsg = await conn.sendMessage(m.chat, {
            video: { url: gifVideo },
            gifPlayback: true,
            caption: finalText,
            contextInfo
        }, { quoted: m });
    } catch (e) {
        console.error("¡Problemas con el trineo! Error al enviar el menú:", e);
        sentMsg = await conn.reply(m.chat, finalText, m, { contextInfo });
    }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help', 'comandos', 'tesoros', 'diciembre', 'navidad', 'v2']; 

export default handler;

// ¡Aquí está la brújula para el tiempo en alta mar!
function clockString(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}