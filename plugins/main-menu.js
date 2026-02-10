import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '🏴‍☠️ luffy-gear5 🏴‍☠️'; 

let handler = async (m, { conn, usedPrefix }) => {
    let mediaLinks;
    try {
        const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
        mediaLinks = JSON.parse(fs.readFileSync(dbPath)).links;
    } catch (e) {
        return conn.reply(m.chat, '❌ *Error en la bodega:* No se encontraron los tesoros.', m);
    }

    if (m.quoted?.id && m.quoted?.fromMe) return;

    let name = await conn.getName(m.sender);
    const uptime = clockString(process.uptime() * 1000);
    const totalreg = Object.keys(global.db?.data?.users || {}).length;
    const venezuelaTime = moment().tz('America/Caracas').format('HH:mm:ss');

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

    // --- DISEÑO DEL MENÚ ---
    let menuText = `╔══════════════════╗\n`;
    menuText += `║   ⚓ *LUFFY - BOT* ⚓\n`;
    menuText += `╚══════════════════╝\n\n`;

    menuText += `┌───〔 *DATOS DEL NAVEGANTE* 〕───\n`;
    menuText += `│ 👤 *Usuario:* ${name}\n`;
    menuText += `│ 👑 *Creador:* +58 4244144821\n`;
    menuText += `│ 🎖️ *Alianza:* ${totalreg} Piratas\n`;
    menuText += `│ ⏳ *Activo:* ${uptime}\n`;
    menuText += `│ 🕒 *Hora:* ${venezuelaTime} (VZLA)\n`;
    menuText += `└─────────────────────────\n\n`;

    const sortedTags = Object.keys(groups).sort();
    sortedTags.forEach(tag => {
        menuText += `┏━━〔 *${tag.toUpperCase()}* 〕━━╼\n`;
        const sortedCommands = Array.from(groups[tag]).sort();
        sortedCommands.forEach((cmd, index) => {
            const isLast = index === sortedCommands.length - 1;
            menuText += `┃ ${isLast ? '╰' : '├'} 🍖 \`\`\`${cmd.trim()}\`\`\`\n`;
        });
        menuText += `┗━━━━━━━━━━━━━━━━━━╼\n\n`;
    });

    menuText += `> *“Si no arriesgas tu vida, no puedes crear un futuro.”*\n`;
    menuText += `_— Monkey D. Luffy_\n\n`;
    menuText += `⚓ *Contacto:* wa.me/584244144821`;

    // --- CONFIGURACIÓN OPTIMIZADA ---
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
            title: '🏴‍☠️ BY: +58 424-4144821 🏴‍☠️',
            body: 'Luffy-Gear5 Bot',
            thumbnailUrl: randomThumbnail,
            sourceUrl: 'https://wa.me/584244144821',
            mediaType: 1,
            showAdAttribution: false,
            renderLargerThumbnail: false // <--- IMAGEN PEQUEÑA HABILITADA
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