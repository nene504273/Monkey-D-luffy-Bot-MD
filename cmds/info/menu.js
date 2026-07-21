import moment from 'moment-timezone';
import db from "#db";
import { prepareWAMessageMedia } from 'baileys';
import { commands } from '../../lib/system/comandos.js';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⿻̸̷᮫̼̼፝͠🥨᪲ 𝐋𝗎𝖿𝖿𝗒 𝐆͢𝖾𝖺⃜𝗋 𝟧 ׅ ࿔𔗨̶🌊';
const banner = 'https://cdn.dev-ander.xyz/a/4zOF.jpg';

function clockString(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

export default {
    command: ['menu', 'help'],
    category: 'info',
    run: async ({ msg, sock, usedPrefix: prefix }) => {
        const name = msg.pushName || (await sock.getName(msg.sender));
        const uptime = clockString(Date.now() - (sock.uptime || Date.now()));
        const totalreg = Object.keys(await db.getUser()).length;
        const venezuelaTime = moment().tz('America/Caracas').format('HH:mm:ss');

        // Agrupar comandos por categoría
        const categories = {};
        for (const cmd of commands) {
            const cat = cmd.category || 'otros';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(cmd);
        }

        let menuText = `⏝ᩙ ׅ   ׄ᷼⏜֟፝᷼͡⏜͜   ׄ ░⃝ᩘ🏴‍☠️ᩙ ׄ  ͜⏜፝֟᷼͡⏜ׄ᷼   ׅ ⏝ᩙ\n\n`;
        menuText += `     *⿻̸̷᮫̼̼፝͠🍖̸̷ᩙ᪶𔗨̶࿔:: 𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝𝐨 𝐚 𝐛𝐨𝐫𝐝𝐨*\n`;
        menuText += `             *𝐝𝐞𝐥 𝐦𝐞𝐣𝐨𝐫 𝐛𝐚𝐫𝐜𝐨 𝐩𝐢𝐫𝐚𝐭𝐚*\n`;
        menuText += `                   *⚓ 𝐋𝐔𝐅𝐅𝐘 - 𝐁𝐎𝐓 ⚓*\n\n`;
        menuText += `       ᡴꪫּ ᩿ 𝆬 ┤ ֵ𝆬 ꥓꥓۪۫⏝꥓̥𝆬︶۪ ׄ𖹭 ۪  ְ̊   ̥𝆬👒 ۪  ְ̊   ̥𝆬 𖹭꥓۪۫︶꥓۪⏝۪𝆬 ꥓\n\n`;

        menuText += `╭ׅ━ׁ┉ׅ─ׁ┉ׅ─ׁ┉ׅ─ׁ 𝆭˳ּ🌊 ׁ─ׅ┉ׁ─ׅ┉ׁ─ׅ┉ׁ━ִ╮\n`;
        menuText += `*✿ֶׁ〪 🅓︩︪𝗮𝘁𝗼𝘀 𝗱𝗲𝗹 𝗡𝗮𝘃𝗲𝗴𝗮𝗻𝘁𝗲 ⠶*\n`;
        menuText += `> ⌑ׄ👤〪𝆭݀₊ _Usuario:_ ${name}\n`;
        menuText += `> ⌑ׄ🎖️〪𝆭݀₊ _Alianza:_ ${totalreg} Piratas\n`;
        menuText += `> ⌑ׄ⏳〪𝆭݀₊ _Activo:_ ${uptime}\n`;
        menuText += `> ⌑ׄ🕒〪𝆭݀₊ _Hora:_ ${venezuelaTime} (VZLA)\n`;
        menuText += `╰ׅ━ׁ┉ׅ─ׁ┉ׅ─ׁ┉ׅ─ׁ 𝆭˳ּ👒 ׁ─ׅ┉ׁ─ׅ┉ׁ─ׅ┉ׁ━ִ╯\n\n`;

        menuText += `* ˳࣪𫆪𫇭֦˚ּ ⠶ 𝗟𝗶𝘀𝘁𝗮 𝗱𝗲 𝗧𝗲𝘀𝗼𝗿𝗼𝘀 ᩡ\n\n`;

        const sortedCategories = Object.keys(categories).sort();
        for (const cat of sortedCategories) {
            // NO filtramos, usamos todos los comandos como en tu menú original
            const cmds = categories[cat];
            if (cmds.length === 0) continue;

            menuText += `✿ㅤ໋︵ּㅤׄ⏜ּㅤ֯✿ִㅤ⃞ׄ🧭⃞ㅤִ❀֯ㅤּ⏜ׄㅤּ︵  ✿\n`;
            menuText += `┄ ֺ 〪ᨘ✿🥂 〫࣫〇ׁ┄ \`${cat.toUpperCase()}\` ┄〇ׁ🥂✿ ׅ ۬┄\n`;

            // Ordenar con protección por si command o alias no existen
            cmds.sort((a, b) => {
                const aName = (a.alias?.[0] || a.command?.[0] || '').toLowerCase();
                const bName = (b.alias?.[0] || b.command?.[0] || '').toLowerCase();
                return aName.localeCompare(bName);
            });

            for (const cmd of cmds) {
                // Usamos alias si existe; si no, command (como hacías antes)
                const names = cmd.alias || cmd.command || [];
                if (names.length === 0) continue; // sin nombres no se muestra

                const aliases = names
                    .map(a => prefix + a.split(/[\/#!+.\-]+/).pop().toLowerCase())
                    .join(' › ');
                menuText += `│ ᗢׁ̇ᰍ〪֙  ᳝ ׁ \`\`\`${aliases}\`\`\`\n`;
            }
            menuText += `╰ׅ━ׁ┉ׅ─ׁ┉ׅ─ׁ┉ׅ─ׁ 𝆭⚓˳ּ ׁ─ׅ┉ׁ─ׅ┉ׁ─ׅ┉ׁ━ִ╯\n\n`;
        }

        menuText += `.   ╓᷼─ໍ۪┅֟፝─̥࣪:¨᜔⠣۟⠜¨᜔:࣪─࣮࣪͡┅ꊥ᜔۫👒ꊥ᜔┅࣮࣪͡─:࣪¨᜔⠣۟⠜¨᜔:࣪─̥፝֟┅۪─᷼ໍ╖\n`;
        menuText += `> *“Si no arriesgas tu vida, no puedes crear un futuro.”*\n`;
        menuText += `> _— Monkey D. Luffy_\n`;
        menuText += `.   ╙᷼─ໍ۪┅֟፝─̥࣪:¨᜔⠣۟⠜¨᜔:࣪─࣮࣪͡┅ꊥ᜔۫⚓ꊥ᜔┅࣮࣪͡─:࣪¨᜔⠣۟⠜¨᜔:࣪─̥፝֟┅۪─᷼ໍ╜`;

        const link = global.api?.url || '';

        const contextInfo = {
            mentionedJid: [msg.sender],
            isForwarded: true,
            forwardingScore: 1,
            forwardedNewsletterMessageInfo: {
                newsletterJid,
                newsletterName,
                serverMessageId: -1
            }
        };

        const linkPreview = link && banner
            ? await prepareWAMessageMedia(
                { image: { url: banner } },
                { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
              ).then(({ imageMessage }) => ({
                'canonical-url': link,
                'matched-text': link,
                title: '⚓ LUFFY - BOT ⚓',
                description: 'El mejor barco pirata 🏴‍☠️ powered by Ander',
                jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined,
                highQualityThumbnail: imageMessage || undefined
              }))
            : undefined;

        await sock.sendMessage(msg.chat, {
            text: link ? `${menuText}\n\n${link}` : menuText,
            linkPreview,
            contextInfo
        }, { quoted: msg });
    }
};