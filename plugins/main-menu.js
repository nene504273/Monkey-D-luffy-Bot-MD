import moment from 'moment-timezone';
import fs from 'fs';
import { xpRange } from '../lib/levelling.js';
import path from 'path';

const cwd = process.cwd();

let handler = async (m, { conn, args }) => {
  // Obtener ID del usuario
  let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;


  // Obtener nombre del usuario
  let name = await conn.getName(userId);

  let user = global.db.data.users[userId];
  let exp = user.exp || 0;
  let level = user.level || 0;
  let role = user.role || 'Sin Rango';
  let coins = user.coin || 0;

  // Obtener datos generales
  let _uptime = process.uptime() * 1000;
  let uptime = clockString(_uptime);
  let totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = Object.values(global.plugins).filter(v => v.help && v.tags).length;

  // Buscar GIFs aleatorios
  const gifVideosDir = path.join(cwd, 'src', 'menu');
  if (!fs.existsSync(gifVideosDir)) {
    console.error('El directorio no existe:', gifVideosDir);
    return;
  }

  const gifVideos = fs.readdirSync(gifVideosDir)
    .filter(file => file.endsWith('.mp4'))
    .map(file => path.join(gifVideosDir, file));

  const randomGif = gifVideos[Math.floor(Math.random() * gifVideos.length)];

  // Texto con info
  let txt = `
☆✼★━━━━━━━━━━━━━━━━━★✼☆｡
        ┎┈┈┈┈┈┈┈୨♡୧┈┈┈┈┈┈┈┒
    𓏲꯭֟፝੭ ꯭⌑(꯭𝐑).꯭𝐔.꯭𝐁.꯭𝐘.꯭ ⭑𝐇.꯭𝐎.꯭𝐒.꯭𝐇.꯭𝐈.꯭𝐍.꯭𝐎.꯭𓏲꯭֟፝੭ 
        ┖┈┈┈┈┈┈┈୨♡୧┈┈┈┈┈┈┈┚
｡☆✼★━━━━━━━━━━━━━━━━━★✼☆｡

¡Hola, ${name}! Mi nombre es *Ruby Hoshino* (≧◡≦) 💖

Aquí tienes mi lista de comandos
╔═══════⩽✦✰✦⩾═══════╗
       「 𝙄𝙉𝙁𝙊 𝘿𝙀 𝙇𝘼 𝘽𝙊𝙏 」
╚═══════⩽✦✰✦⩾═══════╝
║ ☆ 🌟 *𝖳𝖨𝖯𝖮 𝖣𝖤 𝖡𝖮𝖳*: *𝖶𝖠𝖨𝖥𝖴*
║ ☆ 🚩 *𝖬𝖮𝖣𝖮*: *𝖯𝖴𝖡𝖫𝖨𝖢𝖠*
║ ☆ 📚 *B𝖠𝖨𝖫𝖤𝖸𝖲*: *𝖬𝖴𝖫𝖳𝖨 𝖣𝖤𝖵𝖨𝖢𝖤*
║ ☆ 🌐 *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲 𝖤𝖭 𝖳𝖮𝖳𝖠𝖫*: ${totalCommands}
║ ☆ ⏱️ *𝖳𝖨𝖤𝖬𝖯𝖮 𝖠𝖢𝖳𝖨𝖵𝖠*: ${uptime}
║ ☆ 👤 *𝖴𝖲𝖴𝖠𝖱𝖨𝖮𝖲 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮𝖲*: ${totalreg}
║ ☆ 👩‍💻 *𝖢𝖱𝖤𝖠𝖣𝖮𝖱*: [𝑾𝒉𝒂𝒕𝒔𝑨𝒑𝒑](https://Wa.me/18294868853)
╚════════════════════════╝


╔═══════⩽✦✰✦⩾═══════╗
     「 𝙄𝙉𝙁𝙊 𝘿𝙀𝙇 𝙐𝙎𝙐𝘼𝙍𝙄𝙊 」
╚═══════⩽✦✰✦⩾═══════╝
║ ☆ 🌐 *𝖢𝖫𝖨𝖤𝖭𝖳𝖤*: ${name}
║ ☆ 🚀 *𝖤𝖷𝖯𝖤𝖱𝖨𝖤𝖭𝖢𝖨𝖠*: ${exp}
║ ☆ 💴 *𝖸𝖤𝖭𝖤𝖲*: ${coins}
║ ☆ 📊 *𝖭𝖨𝖵𝖤𝖫*: ${level}
║ ☆ 🏅 *𝖱𝖠𝖭𝖦𝖮*: ${role}
╚═══════════════════════╝
> Crea un *Sub-Bot* con tu número utilizando *#qr* o *#code*


╔══⩽✦✰✦⩾══╗
   「 ${(conn.user.jid == global.conn.user.jid ? '𝘽𝙤𝙩 𝙊𝙛𝙞𝙘𝙞𝙖𝙡' : '𝙎𝙪𝙗𝘽𝙤𝙩')} 」
╚══⩽✦✰✦⩾══╝

*➩ L I S T A  -  D E  -  C O M A N D O S*


✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷   ɪɴғᴏ
├• ✐; ₊˚✦୧︰ Bᴏᴛ .
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#help • #menu*  
> ✦ Ver la lista de comandos de la Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#uptime • #runtime*  
> ✦ Ver tiempo activo o en línea de la Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#sc • #script*  
> ✦ Link del repositorio oficial de la Bot.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#staff • #colaboradores*  
> ✦ Ver la lista de desarrolladores de la Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#serbot • #serbot code*  
> ✦ Crea una sesión de Sub-Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#bots • #sockets*  
> ✦ Ver la lista de Sub-Bots activos.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#creador*  
> ✦ Contacto del creador de la Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#status • #estado*  
> ✦ Ver el estado actual de la Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#links • #grupos*  
> ✦ Ver los enlaces oficiales de la Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#infobot • #infobot*  
> ✦ Ver la información completa de la Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#sug • #newcommand*  
> ✦ Sugiere un nuevo comando.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#p • #ping*  
> ✦ Ver la velocidad de respuesta del Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#reporte • #reportar*  
> ✦ Reporta alguna falla o problema de la Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#sistema • #system*  
> ✦ Ver estado del sistema de alojamiento.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#speed • #speedtest*  
> ✦ Ver las estadísticas de velocidad de la Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#views • #usuarios*  
> ✦ Ver la cantidad de usuarios registrados en el sistema.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#funciones • #totalfunciones*  
> ✦ Ver todas las funciones de la Bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ds • #fixmsgespera*  
> ✦ Eliminar archivos de sesión innecesarios.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#editautoresponder*  
> ✦ Configurar un Prompt personalizado de la Bot.  
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷  ʙᴜsǫᴜᴇᴅᴀs
├• ✐; ₊˚✦୧︰  .
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#tiktoksearch • #tiktoks*  
> ✦ Buscador de videos de TikTok.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#tweetposts*  
> ✦ Buscador de posts de Twitter/X.    
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ytsearch • #yts*  
> ✦ Realiza búsquedas en YouTube.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#githubsearch*  
> ✦ Buscador de usuarios de GitHub.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#cuevana • #cuevanasearch*  
> ✦ Buscador de películas/series por Cuevana.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#google*  
> ✦ Realiza búsquedas en Google.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#pin • #pinterest*  
> ✦ Buscador de imágenes de Pinterest.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 ׄ.*animeinfo*  
ׁ> ✦ Buscador de información de un animé
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#imagen • #image*  
> ✦ Buscador de imágenes en Google.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#animesearch • #animess*  
> ✦ Buscador de animes en TioAnime.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#animei • #animeinfo*  
> ✦ Buscador de capítulos de #animesearch.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#infoanime*  
> ✦ Buscador de información de anime/manga.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#hentaisearch • #searchhentai*  
> ✦ Buscador de capítulos hentai.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#xnxxsearch • #xnxxs*  
ׁ> ✦ Buscador de videos de XNXX.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#xvsearch • #xvideossearch*  
ׁ> ✦ Buscador de videos de Xvideos.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#pornhubsearch • #phsearch*  
> ✦ Buscador de videos de Pornhub.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#npmjs*  
> ✦ Buscador de paquetes en npmjs.  
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷ᴅᴇsᴄᴀʀɢᴀs
├• ✐; ₊˚✦୧︰  .
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#tiktok • #tt*
> ✦ Descarga videos de TikTok.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#mediafire • #mf*
> ✦ Descargar un archivo de MediaFire.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#tiktok • #tt*
> ✦ Descarga videos de TikTok.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#pindl • #pinterestdl*
> ✦ Descarga videos de Pinterest con un enlace.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#mediafire • #mf*
> ✦ Descargar archivos de MediaFire.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#pinvid • #pinvideo* + [enlace]
ׁ> ✦ Descargar videos de Pinterest.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#mega • #mg* + [enlace]
> ✦ Descargar archivos de MEGA.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#play • #play2*
> ✦ Descargar música/video de YouTube.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ytmp3 • #ytmp4*
> ✦ Descarga directa por url de YouTube.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#fb • #facebook*
> ✦ Descargar videos de Facebook.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#twitter • #x* + [link]
ׁ> ✦ Descargar videos de Twitter/X.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ig • #instagram*
> ✦ Descargar contenido de Instagram.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#tts • #tiktoks* + [búsqueda]
> ✦ Buscar videos de TikTok.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#terabox • #tb* + [enlace]
> ✦ Descargar archivos de Terabox.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#gdrive • #drive* + [enlace]
> ✦ Descargar archivos desde Google Drive.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ttimg • #ttmp3* + <url>
> ✦ Descargar fotos/audios de TikTok.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#gitclone* + <url>
ׁ> ✦ Descargar repositorios desde GitHub.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#xvideosdl*
> ✦ Descargar videos de Xvideos.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#xnxxdl*
ׁ> ✦ Descargar videos de XNXX.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#apk • #modapk*
> ✦ Descargar APKs (Aptoide).
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#tiktokrandom • #ttrandom*
> ✦ Descargar video aleatorio de TikTok.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#npmdl • #npmdownloader*
> ✦ Descargar paquetes desde NPMJs.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#animelinks • #animedl*
ׁ> ✦ Descargar enlaces disponibles de anime.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷ᴇᴄᴏɴᴏᴍɪᴀ
├• ✐; ₊˚✦୧︰  .
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#w • #work • #trabajar*
> ✦ Trabaja para ganar ${moneda}.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#slut • #protituirse*
> ✦ Trabaja como prostituta y gana ${moneda}.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#cf • #suerte*
> ✦ Apuesta tus ${moneda} a cara o cruz.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#crime • #crimen*
> ✦ Trabaja como ladrón para ganar ${moneda}.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ruleta • #roulette • #rt*
> ✦ Apuesta ${moneda} al color rojo o negro.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#casino • #apostar*
ׁ> ✦ Apuesta tus ${moneda} en el casino.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#slot*
> ✦ Apuesta tus ${moneda} en la ruleta y prueba tu suerte.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#cartera • #wallet*
> ✦ Ver tus ${moneda} en la cartera.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#banco • #bank*
> ✦ Ver tus ${moneda} en el banco.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#deposit • #depositar • #d*
> ✦ Deposita tus ${moneda} al banco.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#with • #retirar • #withdraw*
> ✦ Retira tus ${moneda} del banco.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#transfer • #pay*
> ✦ Transfiere ${moneda} o XP a otros usuarios.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#miming • #minar • #mine*
> ✦ Trabaja como minero y recolecta recursos.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#buyall • #buy*
> ✦ Compra ${moneda} con tu XP.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#daily • #diario*
> ✦ Reclama tu recompensa diaria.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺  *#cofre*
> ✦ Reclama un cofre diario lleno de recursos.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#weekly • #semanal*
> ✦ Reclama tu regalo semanal.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#monthly • #mensual*
> ✦ Reclama tu recompensa mensual.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#steal • #robar • #rob*
> ✦ Intenta robarle ${moneda} a alguien.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#robarxp • #robxp*
> ✦ Intenta robar XP a un usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#eboard • #baltop*
> ✦ Ver el ranking de usuarios con más ${moneda}.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#aventura • #adventure*
> ✦ Aventúrate en un nuevo reino y recolecta recursos.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#curar • #heal*
> ✦ Cura tu salud para volverte aventurero.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#cazar • #hunt • #berburu*
> ✦ Aventúrate en una caza de animales.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#inv • #inventario*
> ✦ Ver tu inventario con todos tus ítems.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#mazmorra • #explorar*
> ✦ Explorar mazmorras para ganar ${moneda}.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#halloween*
> ✦ Reclama tu dulce o truco (Solo en Halloween).
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#christmas • #navidad*
> ✦ Reclama tu regalo navideño (Solo en Navidad).
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷ɢᴀᴄʜᴀ
├• ✐; ₊˚✦୧︰  .
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#rollwaifu • #rw • #roll*
> ✦ Waifu o husbando aleatorio.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#claim • #c • #reclamar*
> ✦ Reclamar un personaje.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#buycharacter • #buychar • #comprarwaifu*
> ✦ comprar un personaje en venta.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#harem • #waifus • #claims*
> ✦ Ver tus personajes reclamados.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#removerwaifu • #removersale*
> ✦ Eliminar un personaje en venta.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#sell • #vender + [nombre] [precio]*
> ✦ poner un personaje a la venta.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#charimage • #waifuimage • #wimage*
> ✦ Ver una imagen aleatoria de un personaje.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#charinfo • #winfo • #waifuinfo*
> ✦ Ver información de un personaje.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#favoritetop • favtop*
> ✦ Ver el top de personajes del rollwaifu favoritos.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#giveallharem • regalarharem*
> ✦ regalar todos tus personajes a otro usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#givechar • #givewaifu • #regalar*
> ✦ Regalar un personaje a otro usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#setfav • #setfavorito*
> ✦ poner de favorito a un personaje.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#vote • #votar*
> ✦ Votar por un personaje para subir su valor.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#waifusboard • #waifustop • #topwaifus*
> ✦ Ver el top de personajes con mayor valor.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷  Sᴛɪᴄᴋᴇʀs
├• ✐; ₊˚✦୧︰  .
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#sticker • #s*
> ✦ Crea stickers de (imagen/video).
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#setmeta*
> ✦ Establece un pack y autor para los stickers.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#delmeta*
> ✦ Elimina tu pack de stickers.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#pfp • #getpic*
> ✦ Obtén la foto de perfil de un usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#stickergen#*
> ✦ te genera un sticker con ia con un promt.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#qc*
> ✦ Crea stickers con texto o de un usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#toimg • #img*
> ✦ Convierte stickers en imagen.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#brat • #ttp • #attp*︎
> ✦ Crea stickers con texto.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#emojimix*
> ✦ Funciona 2 emojis para crear un sticker.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#stickerly*
> ✦ Envía 5 stickers.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#wm*
> ✦ Cambia el nombre de los stickers.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷ ʜᴇʀʀᴀᴍɪᴇɴᴛᴀs
├• ✐; ₊˚✦୧︰  .
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#calcular • #calcular • #cal*  
> ✦ Calcular todo tipo de ecuaciones.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#tiempo • #clima*  
> ✦ Ver el clima de un país.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#horario*  
> ✦ Ver el horario global de los países.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#fake • #fakereply*  
> ✦ Crea un mensaje falso de un usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#qrcode*  
> ✦ crea un QR al enlace o texto que escribas.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#compress • comprimir*  
> ✦ comprime una imagen reduciendo su peso.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#enhance • #remini • #hd*  
> ✦ Mejora la calidad de una imagen.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#letra*  
> ✦ Cambia la fuente de las letras.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#read • #readviewonce • #ver*  
> ✦ Ver imágenes de una sola vista.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#whatmusic • #shazam*  
> ✦ Descubre el nombre de canciones o vídeos.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#spamwa • #spam*  
> ✦ Envía spam a un usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ss • #ssweb*  
> ✦ Ver el estado de una página web.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#length • #tamaño*  
> ✦ Cambia el tamaño de imágenes y vídeos.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#say • #decir* + [texto]  
>  ✦ Repetir un mensaje.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#todoc • #toducument*  
> ✦ Crea documentos de (audio, imágenes y vídeos).
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#translate • #traducir • #trad*  
> ✦ Traduce palabras en otros idiomas.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷ᴘᴀʀᴀ ᴍᴏᴅɪᴅɪᴄᴀʀ ᴛᴜ ᴘᴇʀғɪʟ
├• ✐; ₊˚✦୧︰  .
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#reg • #verificar • #register*
> ✦ Registra tu nombre y edad en el bot.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#unreg*
> ✦ Elimina tu registro del bot.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#profile*
> ✦ Muestra tu perfil de usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#marry* [mension / etiquetar]
> ✦ Propón matrimonio a otro usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#divorce*
> ✦ Divorciarte de tu pareja.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#setgenre • #setgenero*
> ✦ Establece tu género en el perfil del bot.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#delgenre • #delgenero*
> ✦ Elimina tu género del perfil del bot.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#setbirth • #setnacimiento*
> ✦ Establece tu fecha de nacimiento en el perfil del bot.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#delbirth • #delnacimiento*
> ✦ Elimina tu fecha de nacimiento del perfil del bot.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#setdescription • #setdesc*
> ✦ Establece una descripción en tu perfil del bot.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#deldescription • #deldesc*
> ✦ Elimina la descripción de tu perfil del bot.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#lb • #lboard* + <Paginá>
> ✦ Top de usuarios con más (experiencia y nivel).
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#level • #lvl* + <@Mencion>
ׁ> ✦ Ver tu nivel y experiencia actual.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#comprarpremium • #premium*
> ✦ Compra un pase premium para usar el bot sin límites.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#confesiones • #confesar*
> ✦ Confiesa tus sentimientos a alguien de manera anonima.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷ᴄᴏɴғɪɢᴜʀᴀᴄɪᴏɴ ᴇɴ ɢʀᴜᴘᴏs
├• ✐; ₊˚✦୧︰  .
├┈・──・──・﹕₊˚ ✦・୨୧
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#config • #on*
> ✦ Ver opciones de configuración de grupos.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#hidetag*
> ✦ Envía un mensaje mencionando a todos los usuarios.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#gp • #infogrupo*
> ✦ Ver la información del grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#linea • #listonline*
> ✦ Ver la lista de los usuarios en línea.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#setwelcome*
> ✦ Establecer un mensaje de bienvenida personalizado.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#setbye*
> ✦ Establecer un mensaje de despedida personalizado.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#link*
> ✦ El Bot envía el link del grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#admins • #admin*
> ✦ Mencionar a los admins para solicitar ayuda.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#restablecer • #revoke*
> ✦ Restablecer el enlace del grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#grupo • #group* [open / abrir]
> ✦ Cambia ajustes del grupo para que todos los usuarios envíen mensaje.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#grupo • #gruop* [close / cerrar]
> ✦ Cambia ajustes del grupo para que solo los administradores envíen mensaje.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#kick* [número / mención]
> ✦ Elimina un usuario de un grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#add • #añadir • #agregar* [número]
> ✦ Invita a un usuario a tu grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#promote* [mención / etiquetar]
> ✦ El Bot dará administrador al usuario mencionado.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#demote* [mención / etiquetar]
> ✦ El Bot quitará el rol de administrador al usuario mencionado.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#gpbanner • #groupimg*
> ✦ Cambiar la imagen del grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#gpname • #groupname*
> ✦ Cambiar el nombre del grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#gpdesc • #groupdesc*
> ✦ Cambiar la descripción del grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#advertir • #warn • #warning*
> ✦ Dar una advertencia a un usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#unwarn • #delwarn*
> ✦ Quitar advertencias.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#advlist • #listadv*
> ✦ Ver lista de usuarios advertidos.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#banchat*
> ✦ Banear al Bot en un chat o grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#unbanchat*
> ✦ Desbanear al Bot del chat o grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#mute* [mención / etiquetar]
> ✦ El Bot elimina los mensajes del usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#unmute* [mención / etiquetar]
> ✦ El Bot deja de eliminar los mensajes del usuario.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#encuesta • #poll*
> ✦ Crea una encuesta.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#delete • #del*
> ✦ Elimina mensajes de otros usuarios.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#fantasmas*
> ✦ Ver lista de inactivos del grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#kickfantasmas*
> ✦ Elimina a los inactivos del grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#invocar • #tagall • #todos*
> ✦ Invoca a todos los usuarios del grupo.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#setemoji • #setemo*
> ✦ Cambia el emoji que se usa en la invitación de usuarios.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#listnum • #kicknum*
> ✦ Elimina a usuarios por el prefijo de país.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷ʀᴇᴀᴄᴄɪᴏɴᴇs ᴀɴɪᴍᴇ
├• ✐; ₊˚✦୧︰  .
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#angry • #enojado* + <mencion>
> ✦ Estar enojado
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#bite* + <mencion>
> ✦ Muerde a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#bleh* + <mencion>
> ✦ Sacar la lengua
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#blush* + <mencion>
> ✦ Sonrojarte
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#bored • #aburrido* + <mencion>
ׁ> ✦ Estar aburrido
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#cry* + <mencion>
> ✦ Llorar por algo o alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#cuddle* + <mencion>
ׁ> ✦ Acurrucarse
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#dance* + <mencion>
> ✦ Sacate los pasitos prohibidos
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#drunk* + <mencion>
> ✦ Estar borracho
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#eat • #comer* + <mencion>
> ✦ Comer algo delicioso
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#facepalm* + <mencion>
ׁ> ✦ Darte una palmada en la cara
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#happy • #feliz* + <mencion>
> ✦ Salta de felicidad
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#hug* + <mencion>
> ✦ Dar un abrazo
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#impregnate • #preg* + <mencion>
ׁ> ✦ Embarazar a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#kill* + <mencion>
> ✦ Toma tu arma y mata a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#kiss • #besar* • #kiss2 + <mencion>
> ✦ Dar un beso
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#laugh* + <mencion>
ׁ> ✦ Reírte de algo o alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#lick* + <mencion>
ׁ> ✦ Lamer a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#love • #amor* + <mencion>
ׁ> ✦ Sentirse enamorado
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#pat* + <mencion>
> ✦ Acaricia a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#poke* + <mencion>
> ✦ Picar a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#pout* + <mencion>
> ✦ Hacer pucheros
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#punch* + <mencion>
> ✦ Dar un puñetazo
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#run* + <mencion>
> ✦ Correr
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#sad • #triste* + <mencion>
> ✦ Expresar tristeza
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#scared* + <mencion>
ׁ> ✦ Estar asustado
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#seduce* + <mencion>
ׁ> ✦ Seducir a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#shy • #timido* + <mencion>
> ✦ Sentir timidez
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#slap* + <mencion>
> ✦ Dar una bofetada
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#dias • #days*
> ✦ Darle los buenos días a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#fraseanime • #phraseanime*
> ✦ envía una frase aleatorio de un anime
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#noches • #nights*
> ✦ Darle las buenas noches a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#sleep* + <mencion>
ׁ> ✦ Tumbarte a dormir
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#smoke* + <mencion>
ׁ> ✦ Fumar
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#think* + <mencion>
ׁ> ✦ Pensar en algo
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷ᴊᴜᴇɢᴏs, ᴇsᴘᴇʀᴏ 
├• ✐; ₊˚✦୧︰ᴛᴇ ᴅɪᴠɪᴇʀᴛᴀs.
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#amistad • #amigorandom* 
> ✦ Hacer amigos con un juego.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#chaqueta • #jalamela*  
> ✦ Hacerte una chaqueta.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#chiste*  
> ✦ La bot te cuenta un chiste.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#consejo*  
> ✦ La bot te da un consejo.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#doxeo • #doxear* + <mención>  
> ✦ Simular un doxeo falso.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#facto*  
> ✦ La bot te lanza un facto.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#formarpareja*  
> ✦ Forma una pareja.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#formarpareja5*  
> ✦ Forma 5 parejas diferentes.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#frase*  
> ✦ La bot te da una frase.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#huevo*  
> ✦ Agárrale el huevo a alguien.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#chupalo* + <mención>  
> ✦ Hacer que un usuario te la chupe.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#aplauso* + <mención>  
> ✦ Aplaudirle a alguien.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#marron* + <mención>  
> ✦ Burlarte del color de piel de un usuario.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#suicidar*  
> ✦ Suicídate.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#iq • #iqtest* + <mención>  
> ✦ Calcular el IQ de alguna persona.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#meme*  
> ✦ La bot te envía un meme aleatorio.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#morse*  
> ✦ Convierte un texto a código morse.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#nombreninja*  
> ✦ Busca un nombre ninja aleatorio.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#paja • #pajeame*  
> ✦ La bot te hace una paja.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#personalidad* + <mención>  
> ✦ La bot busca tu personalidad.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#piropo*  
> ✦ Lanza un piropo.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#pregunta*  
> ✦ Hazle una pregunta a la bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ship • #pareja*  
> ✦ La bot te da la probabilidad de enamorarte de una persona.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#sorteo*  
> ✦ Empieza un sorteo.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#top*  
> ✦ Empieza un top de personas.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#formartrio* + <mención>  
> ✦ Forma un trío.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ahorcado*  
> ✦ Diviértete jugando al ahorcado con la bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#genio*  
> ✦ Comienza una ronda de preguntas con el genio.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#mates • #matematicas*  
> ✦ Responde preguntas de matemáticas para ganar recompensas.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ppt*  
> ✦ Juega piedra, papel o tijeras con la bot.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#sopa • #buscarpalabra*  
> ✦ Juega al famoso juego de sopa de letras.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#pvp • #suit* + <mención>  
> ✦ Juega un PVP contra otro usuario.  
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ttt*  
> ✦ Crea una sala de juego.  
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✞͙͙͙͙͙͙͙͙͙͙⏜❟︵ֹ̩̥̩̥̩̥̩̩̥⏜੭🏮୧ֹ⏜︵ֹ̩̥̩̥̩̥̩̥̩̥̩̥̩̥❟⏜፞✞͙͙͙͙͙͙͙͙͙͙.
├┈ ↷ᴄᴏɴᴛᴇɴɪᴅᴏ +18
├• ✐; ₊˚✦୧︰  .
├┈・──・──・﹕₊˚ ✦・୨୧・
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#anal* + <mencion>
> ✦ Hacer un anal
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#waifu*
> ✦ Buscá una waifu aleatorio.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#bath* + <mencion>
> ✦ Bañarse
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#blowjob • #mamada • #bj* + <mencion>
> ✦ Dar una mamada
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#boobjob* + <mencion>
> ✦ Hacer una rusa
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#cum* + <mencion>
> ✦ Venirse en alguien.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#fap* + <mencion>
> ✦ Hacerse una paja
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#ppcouple • #ppcp*
> ✦ Genera imágenes para amistades o parejas.
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#footjob* + <mencion>
> ✦ Hacer una paja con los pies
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#fuck • #coger • #fuck2* + <mencion>
> ✦ Follarte a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#hentaivideo • #hentaivid*
> ✦ envía un vídeo hentai aleatorio
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#cafe • #coffe*
> ✦ Tomate un cafecito con alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#violar • #perra* + <mencion>
> ✦ Viola a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#grabboobs* + <mencion>
> ✦ Agarrar tetas
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#grop* + <mencion>
> ✦ Manosear a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#lickpussy* + <mencion>
> ✦ Lamer un coño
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#rule34 • #r34* + [Tags]
> ✦ Buscar imágenes en Rule34
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#sixnine • #69* + <mencion>
> ✦ Haz un 69 con alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#spank • #nalgada* + <mencion>
> ✦ Dar una nalgada
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#suckboobs* + <mencion>
> ✦ Chupar tetas
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#undress • #encuerar* + <mencion>
> ✦ Desnudar a alguien
╠ ☬⃝ᩎ⋟᷊᷂᷊᷊᷊᷊᷊᷊᷊᷊᷊᷊᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷂᷊᷊᷂᷂᷂᷂ 🌺 *#yuri • #tijeras* + <mencion>
> ✦ Hacer tijeras.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝
  `.trim();

    // Mensaje de inicio de envío del menú
    await conn.reply(m.chat, '*ꪹ͜𓂃⌛͡𝗘𝗻𝘃𝗶𝗮𝗻𝗱𝗼 𝗠𝗲𝗻𝘂 𝗱𝗲𝗹 𝗕𝗼𝘁....𓏲੭*', fkontak, { 
        contextInfo: { 
            forwardingScore: 2022, 
            isForwarded: true, 
            externalAdReply: {
                title: packname,
                body: '¡explora la gran variedad de comandos!',
                sourceUrl: redes,
                thumbnail: icons 
            }
        }
    });

    await m.react('💖');

    // Enviar el video GIF con el texto en un solo mensaje
    await conn.sendMessage(m.chat, { 
        video: { url: randomGif },
        caption: txt,
        gifPlayback: true, // Hace que el video se vea como GIF
        contextInfo: {
            mentionedJid: [m.sender, userId],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363335626706839@newsletter',
                newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡',
                serverMessageId: -1,
            },
            externalAdReply: {
                title: 'ׄ❀ׅᮢ໋۬۟   ׁ ᮫᩠𝗥ᥙ᜔᪲𝖻ֹ𝘺 𝐇֢ᩚᨵ̷̸ׁׅׅ𝗌𝗁𝗂ᮬ𝗇֟፝͡𝗈̷̸  ꫶֡ᰵ࡙🌸̵໋ׄᮬ͜✿֪',
                body: dev,
                thumbnail: icons,
                sourceUrl: redes,
                mediaType: 1,
                renderLargerThumbnail: false,
            }
        }
    }, { quoted: m });

};

handler.help = ['menu'];
handler.register = true;
handler.tags = ['main'];
handler.command = ['menu', 'menú', 'help'];

export default handler;

function clockString(ms) {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${hours}h ${minutes}m ${seconds}s`;
}