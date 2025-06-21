import { promises } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
import { xpRange } from '../lib/levelling.js';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import moment from 'moment-timezone';

const defaultMenu = {
  before: `Hola %name ${ucapan()} , soy Ruby Hoshino bot

*\`☄︎  I N F O  -  B O T ☄︎\`*

┌  ◦ *Creador:* Dioneibi
│  ◦ *Modo:* Pública
│  ◦ *Baileys:* Multi Device
│  ◦ *Tiempo Activa:* %uptime
└  ◦ *Usuarios:* %totalreg`.trim(),
};

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    let _package = JSON.parse(await promises.readFile(join(__dirname, '../package.json')).catch(_ => ({}))) || {};
    let { exp, level, role } = global.db.data.users[m.sender];
    let { min, xp, max } = xpRange(level, global.multiplier);
    let name = await conn.getName(m.sender);

    let _uptime = process.uptime() * 1000;
    let _muptime;
    if (process.send) {
      process.send('uptime');
      _muptime = await new Promise(resolve => {
        process.once('message', resolve);
        setTimeout(resolve, 1000);
      }) * 1000;
    }

    let muptime = clockString(_muptime);
    let uptime = clockString(_uptime);
    let totalreg = Object.keys(global.db.data.users).length;

    const imageUrl = 'https://files.catbox.moe/yenx0h.png';
    let media = await prepareWAMessageMedia(
      { image: { url: imageUrl } },
      { upload: conn.waUploadToServer }
    );

    let sections = [{
      title: "𝐒𝐄𝐋𝐄𝐂𝐂𝐈𝐎𝐍𝐄 𝐀𝐐𝐔𝐈",
      rows: [
        {
          title: "📥 𝙈𝙚𝙣𝙪́ 𝙙𝙚 𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙨",
          description: "🎧 𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖 𝙘𝙤𝙣𝙩𝙚𝙣𝙞𝙙𝙤 𝙙𝙚 𝙡𝙖𝙨 𝙥𝙧𝙞𝙣𝙘𝙞𝙥𝙖𝙡𝙚𝙨 𝙧𝙚𝙙𝙚𝙨: 𝙔𝙤𝙪𝙏𝙪𝙗𝙚, 𝙁𝙖𝙘𝙚𝙗𝙤𝙤𝙠, 𝙄𝙜, 𝙚𝙩𝙘.",
          id: `${_p}menudescargas`
        },
        {
          title: "🧿 𝑴𝑬𝑵𝑼́ 𝑬𝑪𝑶𝑵𝑶𝑴𝑰́𝑨 + 𝑹𝑷𝑮 ⚔️",
          description: "🎮 𝘾𝙧𝙚𝙖 𝙩𝙪 𝙖𝙫𝙚𝙣𝙩𝙪𝙧𝙖, 𝙧𝙚𝙘𝙤𝙜𝙚 𝙧𝙚𝙘𝙪𝙧𝙨𝙤𝙨, 𝙜𝙖𝙣𝙖 𝙤𝙧𝙤 𝙮 𝙙𝙤𝙢𝙞𝙣𝙖 𝙚𝙡 𝙢𝙪𝙣𝙙𝙤 𝙍𝙋𝙂 ⚔️",
          id: `${_p}menueconomia`
        },
        {
          title: "🎲 𝑴𝑬𝑵𝑼́ 𝑮𝑨𝑪𝑯𝑨 | 𝑷𝒆𝒓𝒔𝒐𝒏𝒂𝒋𝒆𝒔 𝑬́𝒑𝒊𝒄𝒐𝒔 ⚔️",
          description: "🎭 ¡𝐔𝐬𝐚 𝐭𝐮 𝐬𝐮𝐞𝐫𝐭𝐞, 𝐠𝐢𝐫𝐚 𝐞𝐥 𝐝𝐞𝐬𝐭𝐢𝐧𝐨 𝐲 𝐥𝐥𝐞𝐧𝐚 𝐭𝐮 𝐢𝐧𝐯𝐞𝐧𝐭𝐚𝐫𝐢𝐨 𝐝𝐞 𝐡𝐞𝐫𝐨𝐞𝐬! 🌌",
          id: `${_p}menugacha`
        },
        {
          title: "🖼️🎉 𝐌𝐄𝐍𝐔́ 𝐃𝐄 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 🌈",
          description: "✨ Crea stickers animados, personalizados y súper únicos para compartir con tus amigos 🔥🎨",
          id: `${_p}menusticker`
        },
        {
          title: "⋆🛠️⋆  𝐌𝐄𝐍𝐔 𝐇𝐄𝐑𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀𝐒 ✨",
          description: "🛠️⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐮𝐭𝐢𝐥𝐞𝐬 𝐲 𝐝𝐢𝐯𝐞𝐫𝐬𝐨𝐬 𝐩𝐚𝐫𝐚 𝐜𝐚𝐝𝐚 𝐬𝐢𝐭𝐮𝐚𝐜𝐢𝐨́𝐧 ⚙️💕",
          id: `${_p}menuherramientas`
        },
        {
          title: "📇 𝑴𝑬𝑵𝑼́ 𝑫𝑬 𝑪𝑶𝑵𝑭𝑰𝑮. 𝑷𝑬𝑹𝑭𝑰𝑳",
          description: "🧩 𝙀𝙭𝙖𝙢𝙞𝙣𝙖 𝙩𝙪𝙨 𝙙𝙖𝙩𝙤𝙨, 𝙖𝙙𝙖𝙥𝙩𝙖 𝙩𝙪 𝙪𝙨𝙚𝙧 𝙖 𝙩𝙪 𝙨𝙩𝙮𝙡𝙚 𝙮 𝙢𝙖́𝙣𝙩𝙚𝙣 𝙩𝙪 𝙚𝙨𝙩𝙖𝙙𝙤 𝙖𝙘𝙩𝙪𝙖𝙡𝙞𝙯𝙖𝙙𝙤 💠",
          id: `${_p}menuperfil`
        },
        {
          title: "👥 𝐌𝐄𝐍𝐔́ 𝐃𝐄 𝐆𝐑𝐔𝐏𝐎𝐒 📢",
          description: "⟡ 𝐇𝐞𝐫𝐫𝐚𝐦𝐢𝐞𝐧𝐭𝐚𝐬 𝐲 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐩𝐚𝐫𝐚 𝐥𝐚 𝐠𝐞𝐬𝐭𝐢𝐨́𝐧 𝐲 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐜𝐢𝐨́𝐧 𝐝𝐞 𝐭𝐮 𝐠𝐫𝐮𝐩𝐨 🌐",
          id: `${_p}menugrupo`
        },
        {
          title: "🎌 𝐌𝐄𝐍𝐔́ 𝐃𝐄 𝐀𝐍𝐈𝐌𝐄 ┊ 𝐑𝐄𝐀𝐂𝐂𝐈𝐎𝐍𝐄𝐒",
          description: "💢 𝐄𝐱𝐩𝐫𝐞𝐬𝐚 𝐭𝐮 𝐞𝐬𝐭𝐚𝐝𝐨 𝐜𝐨𝐧 𝐫𝐞𝐚𝐜𝐜𝐢𝐨𝐧𝐞𝐬 𝐝𝐞 𝐚𝐧𝐢𝐦𝐞 𝐢𝐜𝐨́𝐧𝐢𝐜𝐚𝐬 🎭",
          id: `${_p}menuanime`
        },
        {
          title: "🧩🎮 𝑴𝑬𝑵𝑼́ 𝑫𝑬 𝑱𝑼𝑬𝑮𝑶𝑺 𝑬𝑷𝑰𝑪𝑶𝑺 ⚔️",
          description: "🎲 𝐏𝐫𝐮𝐞𝐛𝐚 𝐭𝐮 𝐬𝐮𝐞𝐫𝐭𝐞, 𝐫𝐞𝐭𝐚 𝐚 𝐭𝐮𝐬 𝐚𝐦𝐢𝐠𝐨𝐬 𝐲 𝐝𝐢𝐬𝐟𝐫𝐮𝐭𝐚 𝐝𝐞 𝐮𝐧𝐚 𝐚𝐯𝐞𝐧𝐭𝐮𝐫𝐚 𝐢𝐧𝐭𝐞𝐫𝐚𝐜𝐭𝐢𝐯𝐚 ✨",
          id: `${_p}menujuegos`
        },
        {
          title: "🍓🔥 𝑴𝑬𝑵𝑼́ 𝑷𝑰𝑪𝑨𝑵𝑻𝑬 🔞",
          description: "🔞✨⊹ 𝐀𝐜𝐜𝐞𝐬𝐨 𝐚 𝐥𝐨𝐬 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐍𝐒𝐅𝐖, 𝐬𝐨𝐥𝐨 𝐩𝐚𝐫𝐚 𝐚𝐝𝐮𝐥𝐭𝐨𝐬 🍑💦⊹",
          id: `${_p}menunsfw`
        },
        {
          title: "🔍 𝐌𝐄𝐍𝐔́ 𝐃𝐄 𝐁𝐔́𝐒𝐐𝐔𝐄𝐃𝐀𝐒 🌐",
description: "⟡ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐞𝐬𝐩𝐞𝐜𝐢𝐚𝐥𝐞𝐬 𝐩𝐚𝐫𝐚 𝐛𝐮𝐬𝐜𝐚𝐫 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐜𝐢𝐨́𝐧, 𝐚𝐮𝐝𝐢𝐨𝐬, 𝐯𝐢𝐝𝐞𝐨𝐬 𝐲 𝐦𝐮𝐜𝐡𝐨 𝐦𝐚́𝐬 𝐞𝐧 𝐥𝐢́𝐧𝐞𝐚 🌍",
id: `${_p}menubusquedas`



        }
      ]
    }];

    let bodyText = "*\`☄︎𝗜𝖭𝖥𝖮 - 𝗨𝖲𝖤𝖱☄︎\`*\n\n" +
                   "╭━━ *𝗡𝗈𝗆𝖻𝗋𝖾:* %name\n" +
                   "┃  ◦ *𝗘𝗑𝗉:* %exp\n" +
                   "┃  ◦ *𝗡𝗂𝗏𝖾𝗅:* %level\n" +
                   "╰━━ *𝗥𝖺𝗇𝗀𝗈:* %role";
    bodyText = bodyText.replace(/%name/g, name)
                       .replace(/%exp/g, exp)
                       .replace(/%level/g, level)
                       .replace(/%role/g, role);

    let beforeText = defaultMenu.before.replace(/%name/g, name)
                                       .replace(/%muptime/g, muptime)
                                       .replace(/%uptime/g, uptime)
                                       .replace(/%totalreg/g, totalreg)
                                       .replace(/%exp/g, exp)
                                       .replace(/%level/g, level)
                                       .replace(/%role/g, role);

    const interactiveMessage = {
      header: {
        title: "",
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },
      body: { 
        text: `${beforeText}\n\n${bodyText}`
      },
      footer: { text: "⏤͟͞ू⃪  ̸̷͢𝐑𝐮𝐛y͟ 𝐇𝐨𝐬𝐡𝐢n͟𖹭 𝐁𖹭t͟𑁯ᰍ" },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "❀⃘⃛͜ ۪۪۪݃𓉘᳟ี ⃞̸͢𑁃 ̚𓉝᳟ี𝐌𝐄𝐍𝐔 𝐁𝐎𝐓❀⃘⃛͜ ۪۪۪݃",
              sections: sections
            })
          }
        ],
        messageParamsJson: ""
      }
    };

    let msgi = generateWAMessageFromContent(
      m.chat, 
      { viewOnceMessage: { message: { interactiveMessage } } }, 
      { userJid: conn.user.jid, quoted: m }
    );

    await conn.relayMessage(m.chat, msgi.message, { messageId: msgi.key.id });
    m.react('💞');
  } catch (e) {
    conn.reply(m.chat, `❀⃘⃛͜ ۪۪۪݃ Mis disculpas, el menú no se pudo cargar.\n\n✐ *Razón:* ${e}`, m);
    throw e;
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.register = true;
handler.command = ['menulist', 'listmenu'];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  return [d, ' D ', h, ' H ', m, ' M '].map(v => v.toString().padStart(2, '0')).join('');
}

function ucapan() {
  const time = moment.tz('America/Lima').format('HH');
  let res = "Buenas Noches🌙";
  if (time >= 5 && time < 12) res = "Buenos Días☀️";
  else if (time >= 12 && time < 18) res = "Buenas Tardes🌤️";
  else if (time >= 18) res = "Buenas Noches🌙";
  return res;
}

export default handler;
