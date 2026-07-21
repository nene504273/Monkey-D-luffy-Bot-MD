import moment from 'moment-timezone';
import db from "#db";
import { commands } from '../../lib/system/comandos.js';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⿻̸̷᮫̼̼፝͠🥨᪲ 𝐋𝗎𝖿𝖿𝗒 𝐆͢𝖾𝖺⃜𝗋 𝟧 ׅ ࿔𔗨̶🌊';
const gifVideo = 'https://cdn.dev-ander.xyz/upload_1776229736427.gif';

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
            // 🔥 Filtrar solo comandos que tengan la propiedad 'command' con al menos un elemento
            const validCmds = categories[cat].filter(cmd => cmd.command && cmd.command.length > 0);
            if (validCmds.length === 0) continue; // omitir categorías vacías

            menuText += `✿ㅤ໋︵ּㅤׄ⏜ּㅤ֯✿ִㅤ⃞ׄ🧭⃞ㅤִ❀֯ㅤּ⏜ׄㅤּ︵  ✿\n`;
            menuText += `┄ ֺ 〪ᨘ✿🥂 〫࣫〇ׁ┄ \`${cat.toUpperCase()}\` ┄〇ׁ🥂✿ ׅ ۬┄\n`;

            // Ordenar por el primer nombre del comando
            const cmds = validCmds.sort((a, b) => a.command[0].localeCompare(b.command[0]));

            for (const cmd of cmds) {
                // Construir los alias con el prefijo
                const aliases = cmd.alias
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

        await sock.sendMessage(msg.chat, {
            video: { url: gifVideo },
            gifPlayback: true,
            caption: menuText,
            contextInfo
        }, { quoted: msg });
    }
};