import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import PhoneNumber from 'awesome-phonenumber';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '🏴‍☠️ StrawHat-Crew V2'; 
const packname = '🏴‍☠️ StrawHat-Bot V2 🏴‍☠️';

let handler = async (m, { conn, usedPrefix }) => {
    // --- Lectura de DB ---
    let mediaLinks;
    try {
        const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
        mediaLinks = JSON.parse(fs.readFileSync(dbPath)).links;
    } catch (e) {
        return conn.reply(m.chat, '❌ Error al cargar tesoros.', m);
    }

    if (m.quoted?.id && m.quoted?.fromMe) return;

    let name = await conn.getName(m.sender);
    const isMain = conn.user.jid === global.conn.user.jid;
    
    // Obtener número del bot correctamente
    const botNumber = conn.user.jid.split('@')[0];
    const principalNumber = `+${botNumber}`;

    const totalCommands = Object.keys(global.plugins || {}).length;
    const uptime = clockString(process.uptime() * 1000);
    const totalreg = Object.keys(global.db?.data?.users || {}).length;
    const venezuelaTime = moment().tz('America/Caracas').format('h:mm A');

    const gifVideo = mediaLinks.video[Math.floor(Math.random() * mediaLinks.video.length)];
    const randomThumbnail = mediaLinks.imagen[Math.floor(Math.random() * mediaLinks.imagen.length)];

    // --- Procesar Comandos (SIN REPETIDOS) ---
    let groups = {};
    const totalPlugins = Object.values(global.plugins || {});
    
    totalPlugins.forEach(plugin => {
        if (!plugin.help || !plugin.tags) return;
        plugin.tags.forEach(tag => {
            if (!groups[tag]) groups[tag] = new Set(); // Usamos Set para evitar duplicados automáticos
            plugin.help.forEach(help => {
                if (!/^\$|^=>|^>/.test(help)) {
                    groups[tag].add(`${usedPrefix}${help}`);
                }
            });
        });
    });

    // --- Construcción del Menú ---
    let menuText = `*┏━━━ 🏴‍☠️ STRAW HAT V2 🏴‍☠️ ━━━┓*\n`;
    menuText += `┃ *Capitán:* _${name}_\n`;
    menuText += `┃ *Número:* _${principalNumber}_\n`;
    menuText += `┃ *Tripulación:* _${totalreg}_\n`;
    menuText += `┃ *Navegación:* _${uptime}_\n`;
    menuText += `┃ *Hora Local:* _${venezuelaTime}_\n`;
    menuText += `*┗━━━━━━━━━━━━━━━━━━━━┛*\n\n`;

    // Secciones organizadas
    const sortedTags = Object.keys(groups).sort();
    sortedTags.forEach(tag => {
        menuText += `┏━━━━━━━ *⚓ ${tag.toUpperCase()}* ━━━━━━━┓\n`;
        const sortedCommands = Array.from(groups[tag]).sort();
        sortedCommands.forEach(cmd => {
            menuText += `┃ 🍖 ${cmd.trim()}\n`; // Emoji de carne para cada comando
        });
        menuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
    });

    menuText += `_🚢 ¡Rumbo al One Piece!_`;

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
            title: '🏴‍☠️ STRAW HAT BOT V2',
            body: 'Sistema de Comandos • Online',
            thumbnailUrl: randomThumbnail,
            sourceUrl: 'https://github.com/nevi-dev/Vermeil-bot',
            mediaType: 1,
            renderLargerThumbnail: false // <-- ESTO hace que la imagen sea PEQUEÑA
        }
    };

    await conn.sendMessage(m.chat, {
        video: { url: gifVideo },
        gifPlayback: true,
        caption: menuText,
        contextInfo
    }, { quoted: m });
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'help', 'comandos', 'v2']; 

export default handler;

function clockString(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}