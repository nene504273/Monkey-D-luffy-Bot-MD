import moment from 'moment-timezone';

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⿻̸̷᮫̼̼፝͠🥨᪲ 𝐋𝗎𝖿𝖿𝗒 𝐆͢𝖾𝖺⃜𝗋 𝟧 ׅ ࿔𔗨̶🌊'; 

const gifVideo = 'https://cdn.dev-ander.xyz/upload_1776229736427.gif';
const randomThumbnail = 'https://cdn.dev-ander.xyz/upload_1776228957469.jpg';
const AlyaCore = 'https://api.alyacore.xyz'
let handler = async (m, { conn, usedPrefix }) => {
    if (m.quoted?.id && m.quoted?.fromMe) return;

    let name = await conn.getName(m.sender);
    const uptime = clockString(process.uptime() * 1000);
    const totalreg = Object.keys(global.db?.data?.users || {}).length;
    const venezuelaTime = moment().tz('America/Caracas').format('HH:mm:ss');

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

    const sortedTags = Object.keys(groups).sort();
    sortedTags.forEach(tag => {
        menuText += `✿ㅤ໋︵ּㅤׄ⏜ּㅤ֯✿ִㅤ⃞ׄ🧭⃞ㅤִ❀֯ㅤּ⏜ׄㅤּ︵  ✿\n`;
        menuText += `┄ ֺ 〪ᨘ✿🥂 〫࣫〇ׁ┄ \`${tag.toUpperCase()}\` ┄〇ׁ🥂✿ ׅ ۬┄\n`;
        
        const sortedCommands = Array.from(groups[tag]).sort();
        sortedCommands.forEach((cmd, index) => {
            menuText += `│ ᗢׁ̇ᰍ〪֙  ᳝ ׁ \`\`\`${cmd.trim()}\`\`\`\n`;
        });
        menuText += `╰ׅ━ׁ┉ׅ─ׁ┉ׅ─ׁ┉ׅ─ׁ 𝆭⚓˳ּ ׁ─ׅ┉ׁ─ׅ┉ׁ─ׅ┉ׁ━ִ╯\n\n`;
    });

    menuText += `.   ╓᷼─ໍ۪┅֟፝─̥࣪:¨᜔⠣۟⠜¨᜔:࣪─࣮࣪͡┅ꊥ᜔۫👒ꊥ᜔┅࣮࣪͡─:࣪¨᜔⠣۟⠜¨᜔:࣪─̥፝֟┅۪─᷼ໍ╖\n`;
    menuText += `> *“Si no arriesgas tu vida, no puedes crear un futuro.”*\n`;
    menuText += `> _— Monkey D. Luffy_\n`;
    menuText += `.   ╙᷼─ໍ۪┅֟፝─̥࣪:¨᜔⠣۟⠜¨᜔:࣪─࣮࣪͡┅ꊥ᜔۫⚓ꊥ᜔┅࣮࣪͡─:࣪¨᜔⠣۟⠜¨᜔:࣪─̥፝֟┅۪─᷼ໍ╜`;


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
            title: '🏴‍☠️ ⚓ 𝐋𝐔𝐅𝐅𝐘 - 𝐁𝐎𝐓 ⚓ 🏴‍☠️',
            body: '𐚁๋࣭⭑ֶָ֢ 𝙇𝙪𝙛𝙛𝙮 𝙂𝙚𝙖𝙧 5 𝘽𝙤𝙩 ᕙ(  •̀ ᗜ •́  )ᕗ',
            thumbnailUrl: randomThumbnail,
            sourceUrl: AlyaCore,
            mediaType: 1,
            showAdAttribution: false,
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