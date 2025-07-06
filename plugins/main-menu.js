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


   ֪╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.  ☁️✿⃟⃢᭄͜═✩═[𝐈𝐍𝐅𝐎-𝐁𝐎𝐓]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐩𝐚𝐫𝐚 𝐯𝐞𝐫 𝐞𝐬𝐭𝐚𝐝𝐨 𝐞 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐜𝐢𝐨́𝐧 𝐝𝐞 𝐥𝐚 𝐁𝐨𝐭 ✨⊹
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#help • #menu*  
> ✦ Ver la lista de comandos de la Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#uptime • #runtime*  
> ✦ Ver tiempo activo o en línea de la Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#sc • #script*  
> ✦ Link del repositorio oficial de la Bot.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#staff • #colaboradores*  
> ✦ Ver la lista de desarrolladores de la Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#serbot • #serbot code*  
> ✦ Crea una sesión de Sub-Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#bots • #sockets*  
> ✦ Ver la lista de Sub-Bots activos.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#creador*  
> ✦ Contacto del creador de la Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#status • #estado*  
> ✦ Ver el estado actual de la Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#links • #grupos*  
> ✦ Ver los enlaces oficiales de la Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#infobot • #infobot*  
> ✦ Ver la información completa de la Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#sug • #newcommand*  
> ✦ Sugiere un nuevo comando.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#p • #ping*  
> ✦ Ver la velocidad de respuesta del Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#reporte • #reportar*  
> ✦ Reporta alguna falla o problema de la Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#sistema • #system*  
> ✦ Ver estado del sistema de alojamiento.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#speed • #speedtest*  
> ✦ Ver las estadísticas de velocidad de la Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#views • #usuarios*  
> ✦ Ver la cantidad de usuarios registrados en el sistema.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#funciones • #totalfunciones*  
> ✦ Ver todas las funciones de la Bot.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#ds • #fixmsgespera*  
> ✦ Eliminar archivos de sesión innecesarios.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#editautoresponder*  
> ✦ Configurar un Prompt personalizado de la Bot.  
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ֪╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼ ☁️✿⃟⃢᭄͜═✩═[𝐁𝐔𝐒𝐂𝐀𝐃𝐎𝐑𝐄𝐒]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃࣪
┃֪࣪🔍⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐩𝐚𝐫𝐚 𝐫𝐞𝐚𝐥𝐢𝐳𝐚𝐫 𝐛𝐮́𝐬𝐪𝐮𝐞𝐝𝐚𝐬 𝐞𝐧 𝐝𝐢𝐬𝐭𝐢𝐧𝐭𝐚𝐬 𝐩𝐥𝐚𝐭𝐚𝐟𝐨𝐫𝐦𝐚𝐬 🔎⊹࣪
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#tiktoksearch • #tiktoks*  
> ✦ Buscador de videos de TikTok.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#tweetposts*  
> ✦ Buscador de posts de Twitter/X.    
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#ytsearch • #yts*  
> ✦ Realiza búsquedas en YouTube.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#githubsearch*  
> ✦ Buscador de usuarios de GitHub.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#cuevana • #cuevanasearch*  
> ✦ Buscador de películas/series por Cuevana.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#google*  
> ✦ Realiza búsquedas en Google.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#pin • #pinterest*  
> ✦ Buscador de imágenes de Pinterest.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ ׄ.*animeinfo*  
ׁ> ✦ Buscador de información de un animé
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#imagen • #image*  
> ✦ Buscador de imágenes en Google.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#animesearch • #animess*  
> ✦ Buscador de animes en TioAnime.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#animei • #animeinfo*  
> ✦ Buscador de capítulos de #animesearch.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#infoanime*  
> ✦ Buscador de información de anime/manga.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#hentaisearch • #searchhentai*  
> ✦ Buscador de capítulos hentai.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#xnxxsearch • #xnxxs*  
ׁ> ✦ Buscador de videos de XNXX.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#xvsearch • #xvideossearch*  
ׁ> ✦ Buscador de videos de Xvideos.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#pornhubsearch • #phsearch*  
> ✦ Buscador de videos de Pornhub.  
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#npmjs*  
> ✦ Buscador de paquetes en npmjs.  
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ֪╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼. ☁️✿⃟⃢᭄͜═✩═[𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃࣪
┃࣪📥⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐝𝐞𝐬𝐜𝐚𝐫𝐠𝐚𝐬 𝐩𝐚𝐫𝐚 𝐯𝐚𝐫𝐢𝐨𝐬 𝐚𝐫𝐜𝐡𝐢𝐯𝐨𝐬  📂⊹࣪
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#tiktok • #tt*
> ✦ Descarga videos de TikTok.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#mediafire • #mf*
> ✦ Descargar un archivo de MediaFire.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#tiktok • #tt*
> ✦ Descarga videos de TikTok.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#pindl • #pinterestdl*
> ✦ Descarga videos de Pinterest con un enlace.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#mediafire • #mf*
> ✦ Descargar archivos de MediaFire.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#pinvid • #pinvideo* + [enlace]
ׁ> ✦ Descargar videos de Pinterest.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#mega • #mg* + [enlace]
> ✦ Descargar archivos de MEGA.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#play • #play2*
> ✦ Descargar música/video de YouTube.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#ytmp3 • #ytmp4*
> ✦ Descarga directa por url de YouTube.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#fb • #facebook*
> ✦ Descargar videos de Facebook.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#twitter • #x* + [link]
ׁ> ✦ Descargar videos de Twitter/X.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#ig • #instagram*
> ✦ Descargar contenido de Instagram.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#tts • #tiktoks* + [búsqueda]
> ✦ Buscar videos de TikTok.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#terabox • #tb* + [enlace]
> ✦ Descargar archivos de Terabox.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#gdrive • #drive* + [enlace]
> ✦ Descargar archivos desde Google Drive.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#ttimg • #ttmp3* + <url>
> ✦ Descargar fotos/audios de TikTok.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#gitclone* + <url>
ׁ> ✦ Descargar repositorios desde GitHub.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#xvideosdl*
> ✦ Descargar videos de Xvideos.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#xnxxdl*
ׁ> ✦ Descargar videos de XNXX.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#apk • #modapk*
> ✦ Descargar APKs (Aptoide).
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#tiktokrandom • #ttrandom*
> ✦ Descargar video aleatorio de TikTok.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#npmdl • #npmdownloader*
> ✦ Descargar paquetes desde NPMJs.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#animelinks • #animedl*
ׁ> ✦ Descargar enlaces disponibles de anime.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ֪╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼. ☁️✿⃟⃢᭄͜═✩═[𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪💰🎮⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐞𝐜𝐨𝐧𝐨𝐦𝐢́𝐚 𝐲 𝐑𝐏𝐆 𝐩𝐚𝐫𝐚 𝐠𝐚𝐧𝐚𝐫 𝐝𝐢𝐧𝐞𝐫𝐨 𝐲 𝐨𝐭𝐫𝐨𝐬 𝐫𝐞𝐜𝐮𝐫𝐬𝐨𝐬 🏆💎⊹
┃֪࣪
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#w • #work • #trabajar*
> ✦ Trabaja para ganar ${moneda}.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#slut • #protituirse*
> ✦ Trabaja como prostituta y gana ${moneda}.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#cf • #suerte*
> ✦ Apuesta tus ${moneda} a cara o cruz.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#crime • #crimen*
> ✦ Trabaja como ladrón para ganar ${moneda}.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#ruleta • #roulette • #rt*
> ✦ Apuesta ${moneda} al color rojo o negro.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#casino • #apostar*
ׁ> ✦ Apuesta tus ${moneda} en el casino.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#slot*
> ✦ Apuesta tus ${moneda} en la ruleta y prueba tu suerte.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#cartera • #wallet*
> ✦ Ver tus ${moneda} en la cartera.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#banco • #bank*
> ✦ Ver tus ${moneda} en el banco.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#deposit • #depositar • #d*
> ✦ Deposita tus ${moneda} al banco.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#with • #retirar • #withdraw*
> ✦ Retira tus ${moneda} del banco.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#transfer • #pay*
> ✦ Transfiere ${moneda} o XP a otros usuarios.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#miming • #minar • #mine*
> ✦ Trabaja como minero y recolecta recursos.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#buyall • #buy*
> ✦ Compra ${moneda} con tu XP.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#daily • #diario*
> ✦ Reclama tu recompensa diaria.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១  *#cofre*
> ✦ Reclama un cofre diario lleno de recursos.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#weekly • #semanal*
> ✦ Reclama tu regalo semanal.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#monthly • #mensual*
> ✦ Reclama tu recompensa mensual.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#steal • #robar • #rob*
> ✦ Intenta robarle ${moneda} a alguien.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#robarxp • #robxp*
> ✦ Intenta robar XP a un usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#eboard • #baltop*
> ✦ Ver el ranking de usuarios con más ${moneda}.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#aventura • #adventure*
> ✦ Aventúrate en un nuevo reino y recolecta recursos.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#curar • #heal*
> ✦ Cura tu salud para volverte aventurero.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#cazar • #hunt • #berburu*
> ✦ Aventúrate en una caza de animales.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#inv • #inventario*
> ✦ Ver tu inventario con todos tus ítems.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#mazmorra • #explorar*
> ✦ Explorar mazmorras para ganar ${moneda}.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#halloween*
> ✦ Reclama tu dulce o truco (Solo en Halloween).
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#christmas • #navidad*
> ✦ Reclama tu regalo navideño (Solo en Navidad).
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.   ☁️✿⃟⃢᭄͜═✩═[𝐆𝐀𝐂𝐇𝐀]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐠𝐚𝐜𝐡𝐚 𝐩𝐚𝐫𝐚 𝐫𝐞𝐜𝐥𝐚𝐦𝐚𝐫 𝐲 𝐜𝐨𝐥𝐞𝐜𝐜𝐢𝐨𝐧𝐚𝐫 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐣𝐞𝐬 🎭🌟⊹
┃֪࣪
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#rollwaifu • #rw • #roll*
> ✦ Waifu o husbando aleatorio.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#claim • #c • #reclamar*
> ✦ Reclamar un personaje.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#buycharacter • #buychar • #comprarwaifu*
> ✦ comprar un personaje en venta.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#harem • #waifus • #claims*
> ✦ Ver tus personajes reclamados.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#removerwaifu • #removersale*
> ✦ Eliminar un personaje en venta.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#sell • #vender + [nombre] [precio]*
> ✦ poner un personaje a la venta.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#charimage • #waifuimage • #wimage*
> ✦ Ver una imagen aleatoria de un personaje.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#charinfo • #winfo • #waifuinfo*
> ✦ Ver información de un personaje.
₊· ͟͟͞͞➳❥ *#favoritetop • favtop*
> ✦ Ver el top de personajes del rollwaifu favoritos.
₊· ͟͟͞͞➳❥ *#giveallharem • regalarharem*
> ✦ regalar todos tus personajes a otro usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#givechar • #givewaifu • #regalar*
> ✦ Regalar un personaje a otro usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#setfav • #setfavorito*
> ✦ poner de favorito a un personaje.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#vote • #votar*
> ✦ Votar por un personaje para subir su valor.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#waifusboard • #waifustop • #topwaifus*
> ✦ Ver el top de personajes con mayor valor.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.  ☁️✿⃟⃢᭄͜═✩═[𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪🖼️✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐩𝐚𝐫𝐚 𝐜𝐫𝐞𝐚𝐜𝐢𝐨𝐧𝐞𝐬 𝐝𝐞 𝐬𝐭𝐢𝐜𝐤𝐞𝐫𝐬, 𝐞𝐭𝐜. 🎨🔖
┃֪࣪
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#sticker • #s*
> ✦ Crea stickers de (imagen/video).
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#setmeta*
> ✦ Establece un pack y autor para los stickers.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#delmeta*
> ✦ Elimina tu pack de stickers.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#pfp • #getpic*
> ✦ Obtén la foto de perfil de un usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#stickergen#*
> ✦ te genera un sticker con ia con un promt.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#qc*
> ✦ Crea stickers con texto o de un usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#toimg • #img*
> ✦ Convierte stickers en imagen.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#brat • #ttp • #attp*︎
> ✦ Crea stickers con texto.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#emojimix*
> ✦ Funciona 2 emojis para crear un sticker.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#stickerly*
> ✦ Envía 5 stickers.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#wm*
> ✦ Cambia el nombre de los stickers.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼☁️✿⃟⃢᭄͜═✩═[𝐇𝐄𝐑𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀𝐒]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪🛠️✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐡𝐞𝐫𝐫𝐚𝐦𝐢𝐞𝐧𝐭𝐚𝐬 𝐜𝐨𝐧 𝐦𝐮𝐜𝐡𝐚𝐬 𝐟𝐮𝐧𝐜𝐢𝐨𝐧𝐞𝐬 ⚙️
┃֪࣪
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#calcular • #calcular • #cal*  
> ✦ Calcular todo tipo de ecuaciones.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#tiempo • #clima*  
> ✦ Ver el clima de un país.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#horario*  
> ✦ Ver el horario global de los países.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#fake • #fakereply*  
> ✦ Crea un mensaje falso de un usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#qrcode*  
> ✦ crea un QR al enlace o texto que escribas.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#compress • comprimir*  
> ✦ comprime una imagen reduciendo su peso.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#enhance • #remini • #hd*  
> ✦ Mejora la calidad de una imagen.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#letra*  
> ✦ Cambia la fuente de las letras.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#read • #readviewonce • #ver*  
> ✦ Ver imágenes de una sola vista.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#whatmusic • #shazam*  
> ✦ Descubre el nombre de canciones o vídeos.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#spamwa • #spam*  
> ✦ Envía spam a un usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#ss • #ssweb*  
> ✦ Ver el estado de una página web.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#length • #tamaño*  
> ✦ Cambia el tamaño de imágenes y vídeos.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#say • #decir* + [texto]  
>  ✦ Repetir un mensaje.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#todoc • #toducument*  
> ✦ Crea documentos de (audio, imágenes y vídeos).
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#translate • #traducir • #trad*  
> ✦ Traduce palabras en otros idiomas.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.   ☁️✿⃟⃢᭄͜═✩═[𝐏𝐄𝐑𝐅𝐈𝐋]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪🆔✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐩𝐞𝐫𝐟𝐢𝐥 𝐩𝐚𝐫𝐚 𝐯𝐞𝐫, 𝐜𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐫 𝐲 𝐜𝐨𝐦𝐩𝐫𝐨𝐛𝐚𝐫 𝐞𝐬𝐭𝐚𝐝𝐨𝐬 𝐝𝐞 𝐭𝐮 𝐩𝐞𝐫𝐟𝐢𝐥 📇🔍
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#reg • #verificar • #register*
> ✦ Registra tu nombre y edad en el bot.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#unreg*
> ✦ Elimina tu registro del bot.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#profile*
> ✦ Muestra tu perfil de usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#marry* [mension / etiquetar]
> ✦ Propón matrimonio a otro usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#divorce*
> ✦ Divorciarte de tu pareja.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#setgenre • #setgenero*
> ✦ Establece tu género en el perfil del bot.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#delgenre • #delgenero*
> ✦ Elimina tu género del perfil del bot.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#setbirth • #setnacimiento*
> ✦ Establece tu fecha de nacimiento en el perfil del bot.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#delbirth • #delnacimiento*
> ✦ Elimina tu fecha de nacimiento del perfil del bot.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#setdescription • #setdesc*
> ✦ Establece una descripción en tu perfil del bot.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#deldescription • #deldesc*
> ✦ Elimina la descripción de tu perfil del bot.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#lb • #lboard* + <Paginá>
> ✦ Top de usuarios con más (experiencia y nivel).
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#level • #lvl* + <@Mencion>
ׁ> ✦ Ver tu nivel y experiencia actual.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#comprarpremium • #premium*
> ✦ Compra un pase premium para usar el bot sin límites.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#confesiones • #confesar*
> ✦ Confiesa tus sentimientos a alguien de manera anonima.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.   ☁️✿⃟⃢᭄͜═✩═[𝐆𝐑𝐔𝐏𝐎𝐒]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪👥✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐠𝐫𝐮𝐩𝐨𝐬 𝐩𝐚𝐫𝐚 𝐮𝐧𝐚 𝐦𝐞𝐣𝐨𝐫 𝐠𝐞𝐬𝐭𝐢𝐨́𝐧 𝐝𝐞 𝐞𝐥𝐥𝐨𝐬 🔧📢⊹
┃֪࣪
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#config • #on*
> ✦ Ver opciones de configuración de grupos.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#hidetag*
> ✦ Envía un mensaje mencionando a todos los usuarios.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#gp • #infogrupo*
> ✦ Ver la información del grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#linea • #listonline*
> ✦ Ver la lista de los usuarios en línea.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#setwelcome*
> ✦ Establecer un mensaje de bienvenida personalizado.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#setbye*
> ✦ Establecer un mensaje de despedida personalizado.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#link*
> ✦ El Bot envía el link del grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#admins • #admin*
> ✦ Mencionar a los admins para solicitar ayuda.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#restablecer • #revoke*
> ✦ Restablecer el enlace del grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#grupo • #group* [open / abrir]
> ✦ Cambia ajustes del grupo para que todos los usuarios envíen mensaje.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#grupo • #gruop* [close / cerrar]
> ✦ Cambia ajustes del grupo para que solo los administradores envíen mensaje.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#kick* [número / mención]
> ✦ Elimina un usuario de un grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#add • #añadir • #agregar* [número]
> ✦ Invita a un usuario a tu grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#promote* [mención / etiquetar]
> ✦ El Bot dará administrador al usuario mencionado.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#demote* [mención / etiquetar]
> ✦ El Bot quitará el rol de administrador al usuario mencionado.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#gpbanner • #groupimg*
> ✦ Cambiar la imagen del grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#gpname • #groupname*
> ✦ Cambiar el nombre del grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#gpdesc • #groupdesc*
> ✦ Cambiar la descripción del grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#advertir • #warn • #warning*
> ✦ Dar una advertencia a un usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#unwarn • #delwarn*
> ✦ Quitar advertencias.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#advlist • #listadv*
> ✦ Ver lista de usuarios advertidos.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#banchat*
> ✦ Banear al Bot en un chat o grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#unbanchat*
> ✦ Desbanear al Bot del chat o grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#mute* [mención / etiquetar]
> ✦ El Bot elimina los mensajes del usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#unmute* [mención / etiquetar]
> ✦ El Bot deja de eliminar los mensajes del usuario.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#encuesta • #poll*
> ✦ Crea una encuesta.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#delete • #del*
> ✦ Elimina mensajes de otros usuarios.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#fantasmas*
> ✦ Ver lista de inactivos del grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#kickfantasmas*
> ✦ Elimina a los inactivos del grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#invocar • #tagall • #todos*
> ✦ Invoca a todos los usuarios del grupo.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#setemoji • #setemo*
> ✦ Cambia el emoji que se usa en la invitación de usuarios.
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#listnum • #kicknum*
> ✦ Elimina a usuarios por el prefijo de país.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.   ☁️✿⃟⃢᭄͜═✩═[𝐀𝐍𝐈𝐌𝐄]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪🎌✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐫𝐞𝐚𝐜𝐜𝐢𝐨𝐧𝐞𝐬 𝐝𝐞 𝐚𝐧𝐢𝐦𝐞 💢🎭⊹
┃֪࣪
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#angry • #enojado* + <mencion>
> ✦ Estar enojado
. 바˓   ⃚̫🌷ܷ̯̌ ֙ ꜥ ១ *#bite* + <mencion>
> ✦ Muerde a alguien
. 바˓   ⃚̫