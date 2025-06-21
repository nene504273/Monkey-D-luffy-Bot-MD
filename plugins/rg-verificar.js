import axios from 'axios'
import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i
let handler = async function (m, { conn, text, args, usedPrefix, command }) {
    let user = global.db.data.users[m.sender]
    let name2 = conn.getName(m.sender)
    let whe = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let perfil = await conn.profilePictureUrl(whe, 'image').catch(_ => 'https://qu.ax/FGSG.jpg')

    if (user.registered === true) {
        return m.reply(`*『✦』Ya estás registrado, para volver a registrarte, usa el comando: #unreg*`)
    }

    if (!Reg.test(text)) return m.reply(`*『✦』El comando ingresado es incorrecto, uselo de la siguiente manera:*\n\n#reg *Nombre.edad*\n\n\`\`\`Ejemplo:\`\`\`\n#reg *${name2}.18*`)

    let [_, name, splitter, age] = text.match(Reg)
    if (!name) return m.reply('*『✦』No puedes registrarte sin nombre, el nombre es obligatorio. Inténtelo de nuevo.*')
    if (!age) return m.reply('*『✦』No puedes registrarte sin la edad, la edad es opcional. Inténtelo de nuevo.*')
    if (name.length >= 100) return m.reply('*『✦』El nombre no debe tener más de 30 caracteres.*')

    age = parseInt(age)
    if (age > 1000 || age < 5) return m.reply('⏤͟͟͞͞𝑳𝒂 𝑬𝒅𝒂𝒅 𝒊𝒏𝒈𝒓𝒆𝒔𝒂𝒅𝒂 𝑬𝒔 𝒊𝒏𝒄𝒐𝒓𝒓𝒆𝒄𝒕𝒂⏤͟͟͞͞')

    user.name = name.trim()
    user.age = age
    user.regTime = +new Date
    user.registered = true
    global.db.data.users[m.sender].money += 600
    global.db.data.users[m.sender].estrellas += 10
    global.db.data.users[m.sender].exp += 245
    global.db.data.users[m.sender].joincount += 5    

    let sn = createHash('md5').update(m.sender).digest('hex');
    let moneda = '💸'
    let regbot = `
╭══• ೋ•✧๑♡๑✧•ೋ •══╮
*¡𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙾 𝙴𝚇𝙸𝚃𝙾𝚂𝙾!*
╰══• ೋ•✧๑♡๑✧•ೋ •══╯
║
║ ֪ ׂ⛓️ ̶ 𝐍𝐨𝐦𝐛𝐫𝐞: ${name}
║ ֪ ׁ🌫️ 𝐄𝐝𝐚𝐝: ${age} años
║
║ 𝙶𝚛𝚊𝚌𝚒𝚊𝚜 𝚙𝚘𝚛 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚛𝚝𝚎
║ 📝 Usa *.menu* para ver comandos
║
║ ✨ 𝗥𝗲𝗰𝗼𝗺𝗽𝗲𝗻𝘀𝗮𝘀:
║ • ${moneda} » 600
║ • Experiencia » 245 🪙
║ • Tokens » 10 💸
╚═══════════════════════
> 🎈 ¡Gracias por usar Ruby-Hoshino-Bot!
`;

    await conn.sendMessage(m.chat, {
        text: regbot,
        contextInfo: {
            externalAdReply: {
                title: '⊱『✅𝆺𝅥 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗔𝗗𝗢(𝗔) 𝆹𝅥✅』⊰',
                thumbnailUrl: 'https://qu.ax/FGSG.jpg',
                mediaType: 1,
                body: '𝙼𝚎𝚗𝚞 𝚍𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎 𝚌𝚘𝚗 *.menu*',
            }
        }
    }, { quoted: m });

    // Envío silencioso al canal, solo si el bot es admin
    let chtxt = `🩰 ɴᥱ𝒘 𝙍𝙐𝘽𝙔 𝙃𝙊𝙎𝙃𝙄𝙉𝙊 𝙐𝙎𝙀𝙍 ꜜ
˚₊· ➳💎 *𝗨𝘀𝘂𝗮𝗿𝗶𝗼:* ${m.pushName || 'Anónimo'}    
˚₊· ➳📂 *𝗩𝗲𝗿𝗶𝗳𝗶𝗰𝗮𝗰𝗶𝗼́𝗻:* ${user.name}    
˚₊· ➳🍰 *𝗘𝗱𝗮𝗱:* ${user.age} años    
˚₊· ➳⌨️ *𝗥𝗲𝗴𝗶𝘀𝘁𝗿𝗼 𝗜𝗗:*  
⤷ ${sn}`;

    let channelID = '120363397177582655@newsletter';
    try {
        let metadata = await conn.groupMetadata(channelID);
        let botID = conn.user.jid;
        let isBotAdmin = metadata.participants?.some(p => p.id === botID && (p.admin === 'admin' || p.admin === 'superadmin'));

        if (isBotAdmin) {
            await conn.sendMessage(channelID, {
                text: chtxt,
                contextInfo: {
                    externalAdReply: {
                        title: "꒰🎀꒱ ʀᴇɢɪsᴛʀᴏ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ ꒰🌸꒱",
                        body: '✦⃟ 𝑬𝒏𝒄𝒐𝒏𝒕𝒓𝒂𝒅𝒐… 𝒕𝒆 𝒕𝒆𝒏𝒈𝒐 𝒆𝒏 𝒎𝒊 𝒗𝒊𝒔𝒕𝒂 🌸',
                        thumbnailUrl: perfil,
                        sourceUrl: 'https://github.com/Dioneibi-rip/Ruby-Hoshino-Bot',
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: null });
        } else {
            console.log('[❌] El bot no es admin del canal, mensaje no enviado.')
        }
    } catch (e) {
        console.log('⚠️ Error al verificar canal o enviar mensaje:', e.message)
    }
};

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler
