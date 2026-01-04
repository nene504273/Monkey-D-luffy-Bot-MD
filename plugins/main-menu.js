import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import PhoneNumber from 'awesome-phonenumber';

// --- Configuración de Identidad Pirata ---
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '*🏴‍☠️ StrawHat-Crew V2 - Dashboard 🏴‍☠️*'; 
const packname = '🏴‍☠️ StrawHat-Bot V2 🏴‍☠️';

// --- Estilos de Letras y Estética ---
const aesthetic = {
    info: (key, value) => `*| ${key}:* _${value}_`,
    section_title: (text) => `\n╭┈─────── ⚓ ─────── \n*╰┈➤ 🌊 ${text}*`, 
    command: (cmd) => `*🍖* ${cmd}`, // Emoji de carne solicitado
};

let handler = async (m, { conn, usedPrefix }) => {
    // --- Manejo de Base de Datos de Medios ---
    let mediaLinks;
    try {
        const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
        const dbRaw = fs.readFileSync(dbPath);
        mediaLinks = JSON.parse(dbRaw).links;
    } catch (e) {
        console.error("Error al leer la base de datos:", e);
        return conn.reply(m.chat, '❌ ¡Error de navegación! No se pudo acceder a los archivos del barco.', m);
    }

    if (m.quoted?.id && m.quoted?.fromMe) return;

    let name;
    try {
        name = await conn.getName(m.sender);
    } catch {
        name = 'Tripulante Nuevo';
    }

    const isMain = conn.user.jid === global.conn.user.jid;
    const principalNumber = global.conn?.user?.jid?.split('@')[0] || "No detectado";
    const totalCommands = Object.keys(global.plugins || {}).length;
    const uptime = clockString(process.uptime() * 1000);
    const totalreg = Object.keys(global.db?.data?.users || {}).length;

    // --- Gestión de Tiempos ---
    const localTime = moment().tz('America/Caracas').format('h:mm A');
    let userTimezoneText = 'No configurada 🗺️';
    const userDB = global.db.data.users[m.sender];

    if (userDB?.timezone && moment.tz.names().includes(userDB.timezone)) {
        const userTime = moment().tz(userDB.timezone).format('h:mm A');
        const friendlyName = userDB.timezone.split('/').pop().replace('_', ' ');
        userTimezoneText = `${userTime} (${friendlyName})`;
    } else {
        try {
            const pn = new PhoneNumber(m.sender);
            const regionCode = pn.getRegionCode();
            if (regionCode) {
                const timezones = moment.tz.zonesForCountry(regionCode);
                if (timezones?.length > 0) {
                    const userTime = moment().tz(timezones[0]).format('h:mm A');
                    userTimezoneText = `${userTime} (${regionCode})`;
                }
            }
        } catch (e) {}
    }

    const gifVideo = mediaLinks.video[Math.floor(Math.random() * mediaLinks.video.length)];
    const randomThumbnail = mediaLinks.imagen[Math.floor(Math.random() * mediaLinks.imagen.length)];

    const emojis = {
        'main': '📜', 'tools': '🛠️', 'audio': '🎵', 'group': '🏴‍☠️', 
        'owner': '👑', 'fun': '🃏', 'info': '📂', 'internet': '🌐',
        'downloads': '📥', 'admin': '⚓', 'anime': '🎋', 'nsfw': '🔞',
        'search': '🔍', 'sticker': '✨', 'game': '🎮', 'premium': '🎫', 'bot': '🤖'
    };

    // --- Procesamiento de Comandos (Eliminando duplicados) ---
    let groups = {};
    for (let plugin of Object.values(global.plugins || {})) {
        if (!plugin.help || !plugin.tags) continue;
        for (let tag of plugin.tags) {
            if (!groups[tag]) groups[tag] = [];
            for (let help of plugin.help) {
                if (/^\$|^=>|^>/.test(help)) continue;
                
                let cmdName = `${usedPrefix}${help}`;
                // Evitamos que el mismo comando se repita en la misma categoría
                if (!groups[tag].includes(cmdName)) {
                    groups[tag].push(cmdName);
                }
            }
        }
    }

    // --- Generación de Secciones ---
    const sections = Object.entries(groups)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([tag, cmds]) => {
            const emoji = emojis[tag] || '🚩';
            const sectionTitle = aesthetic.section_title(`${emoji} ${tag.toUpperCase()}`);
            const commandList = cmds.sort().map(cmd => aesthetic.command(cmd)).join('\n');
            return `${sectionTitle}\n${commandList}`;
        }).join(''); 

    // --- Encabezado ---
    const headerTitle = `🏴‍☠️ *S T R A W H A T - B O T  V 2* 🏴‍☠️`;
    const headerInfo = `
${aesthetic.info('Capitán', name)}
${aesthetic.info('Estado', isMain ? 'Barco Principal' : 'Sub-Bote')}
${aesthetic.info('Técnicas', totalCommands)}
${aesthetic.info('Navegación', uptime)}
${aesthetic.info('Hora Local', localTime)}
${aesthetic.info('Tu Hora', userTimezoneText)}
${aesthetic.info('Tripulación', totalreg)}
`.trim();

    // --- Bloque Final del Menú ---
    const menuBlock = `
*┏━━━ ☠️ M E N Ú   P I R A T A ☠️ ━━━┓*
${sections}

*╭┈─────── ⚓ ───────*
*╰┈➤* [💡] Usa *.settimezone* para ajustar tu reloj.
*┗━━━━━━━━━━━━━━━━━━━━━━┛*
`.trim();

    const finalText = `${headerTitle}\n\n${headerInfo}\n\n${menuBlock}`;

    const contextInfo = {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
            newsletterJid,
            newsletterName,
            serverMessageId: -1
        },
        externalAdReply: {
            title: '⚓ ¡A bordo del Thousand Sunny!',
            body: 'Sistema de Comandos V2',
            thumbnailUrl: randomThumbnail,
            sourceUrl: 'https://github.com/nevi-dev/Vermeil-bot', 
            mediaType: 1,
            renderLargerThumbnail: true
        }
    };

    try {
        await conn.sendMessage(m.chat, {
            video: { url: gifVideo },
            gifPlayback: true,
            caption: finalText,
            contextInfo
        }, { quoted: m });
    } catch (e) {
        await conn.reply(m.chat, finalText, m, { contextInfo });
    }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help', 'v2']; 

export default handler;

function clockString(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}