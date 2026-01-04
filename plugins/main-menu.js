import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import PhoneNumber from 'awesome-phonenumber';

// --- Constantes de Configuración ---
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '*🏴‍☠️ Luffy - Rey de los Piratas V2 🏴‍☠️*'; 
const packname = '🍖 StrawHat-Crew - Gear 5 🍖';

const styles = {
    section_title: (text) => `\n╭┈─────── 🍖 ───────╼ \n*╰┈➤ 👒 ${text}*`, 
    command: (cmd, desc) => `*🍖* \`${cmd}\`\n   └─ _${desc}_`,
};

let handler = async (m, { conn, usedPrefix }) => {
    let mediaLinks;
    try {
        const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
        const dbRaw = fs.readFileSync(dbPath);
        mediaLinks = JSON.parse(dbRaw).links;
    } catch (e) {
        return conn.reply(m.chat, '¡El Log Pose se rompió! Error de base de datos. ⚓', m);
    }

    let name = await conn.getName(m.sender);
    const uptime = clockString(process.uptime() * 1000);
    const totalreg = Object.keys(global.db?.data?.users || {}).length;

    const emojis = {
        'main': '📜', 'tools': '🛠️', 'audio': '🎶', 'group': '🏴‍☠️', 
        'owner': '👑', 'fun': '🍖', 'info': '💡', 'downloads': '📥', 
        'admin': '⚓', 'anime': '🎌', 'search': '🔍', 'sticker': '🖼️', 'game': '🎲'
    };

    let groups = {};
    let uniqueCommands = new Set(); // Para evitar comandos repetidos

    for (let plugin of Object.values(global.plugins || {})) {
        if (!plugin.help || !plugin.tags) continue;
        for (let tag of plugin.tags) {
            if (!groups[tag]) groups[tag] = [];
            
            for (let i = 0; i < plugin.help.length; i++) {
                let helpName = plugin.help[i];
                if (/^\$|^=>|^>/.test(helpName)) continue;

                // FILTRO DE REPETIDOS: Si el comando ya existe, no lo agregamos otra vez
                if (uniqueCommands.has(helpName)) continue;
                uniqueCommands.add(helpName);

                // LÓGICA DE EXPLICACIÓN (Personaliza aquí según tus necesidades)
                let description = '';
                if (plugin.desc && plugin.desc[i]) {
                    description = plugin.desc[i];
                } else {
                    // Descripciones automáticas por tag si no existe una específica
                    const autoDesc = {
                        'main': 'Comandos principales del sistema.',
                        'downloads': 'Descarga contenido de redes sociales.',
                        'group': 'Gestión de grupos y nakamas.',
                        'tools': 'Herramientas de navegación útiles.',
                        'sticker': 'Crea y edita tus propios stickers.',
                        'fun': 'Diversión y juegos para la tripulación.',
                        'owner': 'Habilidades exclusivas de mi capitán.',
                        'search': 'Busca información en los siete mares.'
                    };
                    description = autoDesc[tag] || 'Comando para la aventura pirata.';
                }

                groups[tag].push({
                    cmd: `${usedPrefix}${helpName}`,
                    desc: description
                });
            }
        }
    }

    // Ordenar categorías y comandos
    const sortedTags = Object.keys(groups).sort();
    let sections = sortedTags.map(tag => {
        const emoji = emojis[tag] || '🍖';
        const sectionTitle = styles.section_title(`${emoji} ${tag.toUpperCase()} `);
        const commandList = groups[tag]
            .sort((a, b) => a.cmd.localeCompare(b.cmd))
            .map(c => styles.command(c.cmd, c.desc))
            .join('\n');
        return `${sectionTitle}\n${commandList}`;
    }).join('');

    const header = `🍖 *¡BIENVENIDO A BORDO, ${name.toUpperCase()}!* 👒\n\n` +
                   `🏴‍☠️ *Navegando hace:* ${uptime}\n` +
                   `🏴‍☠️ *Tripulantes:* ${totalreg}\n` +
                   `🏴‍☠️ *Estatus:* Buscando el One Piece\n\n` +
                   `*╭━━━ ☠️ ━━━✶━━━ ☠️ ━━━╮*\n` +
                   `*✨ M E N Ú   P I R A T A ✨*\n` +
                   `*╰━━━ ☠️ ━━━✶━━━ ☠️ ━━━╮*`;

    const footer = `\n\n*╭┈─────── 👒 ───────╼*\n*╰┈➤* ¡Usa los comandos con sabiduría!\n*¡S E R É   E L   R E Y! 🍖*`;

    const finalText = `${header}\n${sections}${footer}`;

    const gifVideo = mediaLinks.video[Math.floor(Math.random() * mediaLinks.video.length)];
    const randomThumbnail = mediaLinks.imagen[Math.floor(Math.random() * mediaLinks.imagen.length)];

    await conn.sendMessage(m.chat, {
        video: { url: gifVideo },
        gifPlayback: true,
        caption: finalText,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: packname,
                body: 'Rumbo al One Piece',
                thumbnailUrl: randomThumbnail,
                mediaType: 1
            }
        }
    }, { quoted: m });
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'help', 'comandos', 'luffy']; 

export default handler;

function clockString(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}