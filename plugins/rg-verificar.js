import axios from 'axios';
import { createHash } from 'crypto';
import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment-timezone';

// Constantes
const ramdos = [
  'https:                    
  '//qu.ax/kCFBu.jpeg',
  'https://qu.ax/oywhU.jpeg',
  'https:                    
  '//qu.ax/OqruN.jpeg',
  'https://qu.ax/EQNsz.jpeg',
  'https:                    
];
const newsletterJid = '//qu.ax/zKJLa.jpeg',
];
const newsletterJid = '120363397177582655@newsletter';
const packname = '🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️';

                       
const getRandomRamdos = () => ramdos[Math.floor(Math.random() * ramdos.length)];
const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

                    
let handler = async function (m, { conn, text, args, usedPrefix, command }) {
  let user = global.db.data.users[m.sender];
  let name2 = conn.getName(m.sender);
  let whe = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;

                                                                     
  let perfil = await conn.profilePictureUrl(whe, '// Funciones auxiliares
const getRandomRamdos = () => ramdos[Math.floor(Math.random() * ramdos.length)];
const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

// Handler principal
let handler = async function (m, { conn, text, args, usedPrefix, command }) {
  let user = global.db.data.users[m.sender];
  let name2 = conn.getName(m.sender);
  let whe = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;

  // Intentar obtener foto de perfil; si falla, usar imagen aleatoria
  let perfil = await conn.profilePictureUrl(whe, 'image').catch(_ => getRandomRamdos());

                             
  if (user.registered === true) {
    return m.reply(`*『✦』Ya estás registrado, para volver a registrarte, usa el comando: #unreg*`);
  }
  if (!Reg.test(text)) {
    return m.reply(`*『✦』El comando ingresado es incorrecto, uselo de la siguiente manera:*\n\n#reg *Nombre.edad*\n\n\`\`\`Ejemplo:\`\`\`\n#reg *${name2}.18*`);
  }

                          
  let [_, name, splitter, age] = text.match(Reg);
  if (!name) return m.reply('// Verificaciones iniciales
  if (user.registered === true) {
    return m.reply(`*『✦』Ya estás registrado, para volver a registrarte, usa el comando: #unreg*`);
  }
  if (!Reg.test(text)) {
    return m.reply(`*『✦』El comando ingresado es incorrecto, uselo de la siguiente manera:*\n\n#reg *Nombre.edad*\n\n\`\`\`Ejemplo:\`\`\`\n#reg *${name2}.18*`);
  }

  // Extraer nombre y edad
  let [_, name, splitter, age] = text.match(Reg);
  if (!name) return m.reply('*『✦』No puedes registrarte sin nombre, el nombre es obligatorio.*');
  if (!age) return m.reply('*『✦』No puedes registrarte sin la edad.*');
  if (name.length >= 100) return m.reply('*『✦』El nombre no debe tener más de 30 caracteres.*');
  age = parseInt(age);
  if (age > 1000 || age < 5) return m.reply('⏤͟͟͞͞𝑳𝒂 𝑬𝒅𝒂𝒅 𝒊𝒏𝒈𝒓𝒆𝒔𝒂𝒅𝒂 𝑬𝒔 𝒊𝒏𝒄𝒐𝒓𝒓𝒆𝒄𝒕𝒂⏤͟͟͞͞');

                      
  user.name = name.trim();
  user.age = age;
  user.regTime = +new Date;
  user.registered = true;

                
  global.db.data.users[m.sender].money += 600;
  global.db.data.users[m.sender].estrellas += 10;
  global.db.data.users[m.sender].exp += 245;
  global.db.data.users[m.sender].joincount += 5;

                        
  let sn = createHash('// Registrar usuario
  user.name = name.trim();
  user.age = age;
  user.regTime = +new Date;
  user.registered = true;

  // Recompensas
  global.db.data.users[m.sender].money += 600;
  global.db.data.users[m.sender].estrellas += 10;
  global.db.data.users[m.sender].exp += 245;
  global.db.data.users[m.sender].joincount += 5;

  // Mensaje de registro
  let sn = createHash('md5').update(m.sender).digest('hex');
  let regbot = `╭══• ೋ•✧๑♡๑✧•ೋ •══╮\n*¡𝙷𝙾𝙾𝙾! 𝚃𝙾𝙳𝙾 𝙴𝚇𝙸𝚃𝙾𝚂𝙾! 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙾!*\n╰══• ೋ•✧๑♡๑✧•ೋ •══╯\n║\n║ ⛓️ 𝐍𝐨𝐦𝐛𝐫𝐞: ${name}\n║ 🌫️ 𝐄𝐝𝐚𝐝: ${age} años\n║\n║ 𝙶𝚛𝚊𝚌𝚒𝚊𝚜 𝚙𝚘𝚛 𝚛𝚎𝚐𝚒𝚜𝚝𝚛𝚊𝚛𝚝𝚎\n║ 📝 Usa *.menu*\n║\n║ ✨ 𝗥𝗲𝗰𝗼𝗺𝗲𝗻𝘀𝗮𝘀:\n║ • 💸 600\n║ • 🪙 245\n║ • 💸 10 Tokens\n╚═════════════════`;

                            
  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: '// Enviar mensaje con foto
  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: '⊱『✅ 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗔𝗗𝗢(𝗔) ✅』⊰',
        thumbnailUrl: perfil,
        mediaType: 1,
        body: '𝙼𝚎𝚗𝚞 𝚍𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎 𝚌𝚘𝚗 *.menu*',
      }
    }
  }, { quoted: m });

                                                
  let chtxt = `🩰 ɴᥱ𝒘 𝙐𝙎𝙀𝙍 ꜜ\n💎 *𝗨𝘀𝘂𝗮𝗿𝗶𝗼:* ${m.pushName || '// Enviar notificación al canal (si es admin)
  let chtxt = `🩰 ɴᥱ𝒘 𝙐𝙎𝙀𝙍 ꜜ\n💎 *𝗨𝘀𝘂𝗮𝗿𝗶𝗼:* ${m.pushName || 'Anónimo'}\n📂 *𝗩𝗲𝗿𝗶𝗳𝗶𝗰𝗮𝗰𝗶𝗽𝗼́𝗻:* ${user.name}\n🍰 *𝗘𝗱𝗮𝗱:* ${user.age} años\n⌨️ *𝗥𝗲𝗴𝗶𝘀𝘁𝗿𝗼 𝗜𝗗:* ⤷ ${sn}`;
  try {
    let metadata = await conn.groupMetadata(newsletterJid);
    let botID = conn.user.jid;
    let isBotAdmin = metadata.participants?.some(p => p.id === botID && (p.admin === 'admin' || p.admin === 'superadmin'));
    if (isBotAdmin) {
      await conn.sendMessage(newsletterJid, {
        text: chtxt,
        contextInfo: { externalAdReply: {
          title: "꒰🎀꒱ ʀᴇɢɪsᴛʀᴏ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ ꒰🌸꒱",
          thumbnailUrl: perfil,
          body: '✦ 𝑬𝒏𝒄𝒐𝒏𝒕𝒓𝒂𝒅𝒐… 𝒕𝒆 𝒕𝒆𝒏𝒈𝒐 𝒆𝒏 𝒎𝒊 𝒗𝒊𝒔𝒕𝒂 🌸',
          sourceUrl: 'https://github.com/nene504273/Monkey-D-luffy-Bot-MD',
          mediaType: 1,
        }}
      }, { quoted: null });
    }
  } catch (e) {
    console.log('⚠️ Error:', e.message);
  }
};

handler.help = ['reg'];
handler.tags = ['rg'];
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar'];
export default handler;