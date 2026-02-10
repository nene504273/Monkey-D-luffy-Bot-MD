import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import PhoneNumber from 'awesome-phonenumber';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '🏴‍☠️ luffy-gear5 🏴‍☠️'; 
const packname = '🏴‍☠️ LUFFY-Bot  🏴‍☠️';

let handler = async (m, { conn, usedPrefix }) => {
    let mediaLinks;
    try {
        const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
        mediaLinks = JSON.parse(fs.readFileSync(dbPath)).links;
    } catch (e) {
        return conn.reply(m.chat, '❌ Error al cargar los tesoros del barco.', m);
    }

    if (m.quoted?.id && m.quoted?.fromMe) return;

    let name = await conn.getName(m.sender);
    const uptime = clockString(process.uptime() * 1000);
    const totalreg = Object.keys(global.db?.data?.users || {}).length;
    const venezuelaTime = moment().tz('America/Caracas').format('h:mm A');

    const gifVideo = mediaLinks.video[Math.floor(Math.random() * mediaLinks.video.length)];
    const randomThumbnail = mediaLinks.imagen[Math.floor(Math.random() * mediaLinks.imagen.length)];

    let groups = {};
    Object.values(global.plugins || {}).forEach(plugin => {
        if (!plugin.help || !plugin.tags) return;
        plugin.tags.forEach(tag => {
            if (!groups[tag]) groups[tag] = new Set(); 
            plugin.help.forEach(help => {
                if (!/^\$|^=>|^>/.test(help)) {
                    groups[tag].add(`${usedPrefix}${help}`);
                }
            });
        });
    });

    // --- DISEÑO RENOVADO: BITÁCORA DEL REY PIRATA ---
    let menuText = `〆  *B I T Á C O R A  •  D E  •  V I A J E* 〆\n\n`;
    
    menuText += `〉*USUARIO:* ${name}\n`;
    menuText += `〉*RECOMPENSA:* ${totalreg} Aliados\n`;
    menuText += `〉*NAVEGACIÓN:* ${uptime}\n`;
    menuText += `〉*HORA:* ${venezuelaTime}\n`;
    menuText += `\n— — — — — — — — — — — — —\n\n`;

    const sortedTags = Object.keys(groups).sort();
    sortedTags.forEach(tag => {
        // Título de sección más minimalista y estético
        menuText += `  ⚓ *__${tag.toUpperCase()}__*\n`;
        
        const sortedCommands = Array.from(groups[tag]).sort();
        // Usamos un separador más fino para que no se vea saturado
        menuText += `  │\n`;
        sortedCommands.forEach((cmd, index) => {
            const isLast = index === sortedCommands.length - 1;
            menuText += `  ${isLast ? '╰' : '├'}─ 肉 ${cmd.trim()}\n`;
        });
        menuText += `\n`;
    });

    menuText += `*“La pasión y los sueños son como el tiempo, nada puede detenerlos.”*\n`;
    menuText += `_— Monkey D. Luffy_`;

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
            title: '⚓ M O N K E Y • D • L U F F Y ⚓',
            body: 'Sistema de Navegación Pirata',
            thumbnailUrl: randomThumbnail,
            sourceUrl: 'https://wa.me/584244144821',
            mediaType: 1,
            renderLargerThumbnail: false 
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
handler.command = ['menu', 'help']; 

export default handler;

function clockString(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}