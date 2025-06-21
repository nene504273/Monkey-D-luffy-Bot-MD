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
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#help • #menu*  
> ✦ Ver la lista de comandos de la Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#uptime • #runtime*  
> ✦ Ver tiempo activo o en línea de la Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#sc • #script*  
> ✦ Link del repositorio oficial de la Bot.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#staff • #colaboradores*  
> ✦ Ver la lista de desarrolladores de la Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#serbot • #serbot code*  
> ✦ Crea una sesión de Sub-Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#bots • #sockets*  
> ✦ Ver la lista de Sub-Bots activos.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#creador*  
> ✦ Contacto del creador de la Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#status • #estado*  
> ✦ Ver el estado actual de la Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#links • #grupos*  
> ✦ Ver los enlaces oficiales de la Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#infobot • #infobot*  
> ✦ Ver la información completa de la Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#sug • #newcommand*  
> ✦ Sugiere un nuevo comando.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#p • #ping*  
> ✦ Ver la velocidad de respuesta del Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#reporte • #reportar*  
> ✦ Reporta alguna falla o problema de la Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#sistema • #system*  
> ✦ Ver estado del sistema de alojamiento.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#speed • #speedtest*  
> ✦ Ver las estadísticas de velocidad de la Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#views • #usuarios*  
> ✦ Ver la cantidad de usuarios registrados en el sistema.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#funciones • #totalfunciones*  
> ✦ Ver todas las funciones de la Bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ds • #fixmsgespera*  
> ✦ Eliminar archivos de sesión innecesarios.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#editautoresponder*  
> ✦ Configurar un Prompt personalizado de la Bot.  
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ֪╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼ ☁️✿⃟⃢᭄͜═✩═[𝐁𝐔𝐒𝐂𝐀𝐃𝐎𝐑𝐄𝐒]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃࣪
┃֪࣪🔍⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐩𝐚𝐫𝐚 𝐫𝐞𝐚𝐥𝐢𝐳𝐚𝐫 𝐛𝐮́𝐬𝐪𝐮𝐞𝐝𝐚𝐬 𝐞𝐧 𝐝𝐢𝐬𝐭𝐢𝐧𝐭𝐚𝐬 𝐩𝐥𝐚𝐭𝐚𝐟𝐨𝐫𝐦𝐚𝐬 🔎⊹࣪
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#tiktoksearch • #tiktoks*  
> ✦ Buscador de videos de TikTok.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#tweetposts*  
> ✦ Buscador de posts de Twitter/X.    
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ytsearch • #yts*  
> ✦ Realiza búsquedas en YouTube.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#githubsearch*  
> ✦ Buscador de usuarios de GitHub.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#cuevana • #cuevanasearch*  
> ✦ Buscador de películas/series por Cuevana.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#google*  
> ✦ Realiza búsquedas en Google.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#pin • #pinterest*  
> ✦ Buscador de imágenes de Pinterest.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ ׄ.*animeinfo*  
ׁ> ✦ Buscador de información de un animé
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#imagen • #image*  
> ✦ Buscador de imágenes en Google.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#animesearch • #animess*  
> ✦ Buscador de animes en TioAnime.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#animei • #animeinfo*  
> ✦ Buscador de capítulos de #animesearch.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#infoanime*  
> ✦ Buscador de información de anime/manga.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#hentaisearch • #searchhentai*  
> ✦ Buscador de capítulos hentai.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#xnxxsearch • #xnxxs*  
ׁ> ✦ Buscador de videos de XNXX.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#xvsearch • #xvideossearch*  
ׁ> ✦ Buscador de videos de Xvideos.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#pornhubsearch • #phsearch*  
> ✦ Buscador de videos de Pornhub.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#npmjs*  
> ✦ Buscador de paquetes en npmjs.  
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ֪╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼. ☁️✿⃟⃢᭄͜═✩═[𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃࣪
┃࣪📥⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐝𝐞𝐬𝐜𝐚𝐫𝐠𝐚𝐬 𝐩𝐚𝐫𝐚 𝐯𝐚𝐫𝐢𝐨𝐬 𝐚𝐫𝐜𝐡𝐢𝐯𝐨𝐬  📂⊹࣪
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#tiktok • #tt*
> ✦ Descarga videos de TikTok.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#mediafire • #mf*
> ✦ Descargar un archivo de MediaFire.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#tiktok • #tt*
> ✦ Descarga videos de TikTok.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#pindl • #pinterestdl*
> ✦ Descarga videos de Pinterest con un enlace.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#mediafire • #mf*
> ✦ Descargar archivos de MediaFire.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#pinvid • #pinvideo* + [enlace]
ׁ> ✦ Descargar videos de Pinterest.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#mega • #mg* + [enlace]
> ✦ Descargar archivos de MEGA.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#play • #play2*
> ✦ Descargar música/video de YouTube.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ytmp3 • #ytmp4*
> ✦ Descarga directa por url de YouTube.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#fb • #facebook*
> ✦ Descargar videos de Facebook.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#twitter • #x* + [link]
ׁ> ✦ Descargar videos de Twitter/X.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ig • #instagram*
> ✦ Descargar contenido de Instagram.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#tts • #tiktoks* + [búsqueda]
> ✦ Buscar videos de TikTok.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#terabox • #tb* + [enlace]
> ✦ Descargar archivos de Terabox.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#gdrive • #drive* + [enlace]
> ✦ Descargar archivos desde Google Drive.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ttimg • #ttmp3* + <url>
> ✦ Descargar fotos/audios de TikTok.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#gitclone* + <url>
ׁ> ✦ Descargar repositorios desde GitHub.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#xvideosdl*
> ✦ Descargar videos de Xvideos.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#xnxxdl*
ׁ> ✦ Descargar videos de XNXX.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#apk • #modapk*
> ✦ Descargar APKs (Aptoide).
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#tiktokrandom • #ttrandom*
> ✦ Descargar video aleatorio de TikTok.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#npmdl • #npmdownloader*
> ✦ Descargar paquetes desde NPMJs.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#animelinks • #animedl*
ׁ> ✦ Descargar enlaces disponibles de anime.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ֪╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼. ☁️✿⃟⃢᭄͜═✩═[𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪💰🎮⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐞𝐜𝐨𝐧𝐨𝐦𝐢́𝐚 𝐲 𝐑𝐏𝐆 𝐩𝐚𝐫𝐚 𝐠𝐚𝐧𝐚𝐫 𝐝𝐢𝐧𝐞𝐫𝐨 𝐲 𝐨𝐭𝐫𝐨𝐬 𝐫𝐞𝐜𝐮𝐫𝐬𝐨𝐬 🏆💎⊹
┃֪࣪
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#w • #work • #trabajar*
> ✦ Trabaja para ganar ${moneda}.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#slut • #protituirse*
> ✦ Trabaja como prostituta y gana ${moneda}.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#cf • #suerte*
> ✦ Apuesta tus ${moneda} a cara o cruz.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#crime • #crimen*
> ✦ Trabaja como ladrón para ganar ${moneda}.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ruleta • #roulette • #rt*
> ✦ Apuesta ${moneda} al color rojo o negro.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#casino • #apostar*
ׁ> ✦ Apuesta tus ${moneda} en el casino.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#slot*
> ✦ Apuesta tus ${moneda} en la ruleta y prueba tu suerte.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#cartera • #wallet*
> ✦ Ver tus ${moneda} en la cartera.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#banco • #bank*
> ✦ Ver tus ${moneda} en el banco.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#deposit • #depositar • #d*
> ✦ Deposita tus ${moneda} al banco.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#with • #retirar • #withdraw*
> ✦ Retira tus ${moneda} del banco.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#transfer • #pay*
> ✦ Transfiere ${moneda} o XP a otros usuarios.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#miming • #minar • #mine*
> ✦ Trabaja como minero y recolecta recursos.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#buyall • #buy*
> ✦ Compra ${moneda} con tu XP.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#daily • #diario*
> ✦ Reclama tu recompensa diaria.
├ׁ̟̇˚₊· ͟͟͞͞➳❥  *#cofre*
> ✦ Reclama un cofre diario lleno de recursos.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#weekly • #semanal*
> ✦ Reclama tu regalo semanal.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#monthly • #mensual*
> ✦ Reclama tu recompensa mensual.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#steal • #robar • #rob*
> ✦ Intenta robarle ${moneda} a alguien.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#robarxp • #robxp*
> ✦ Intenta robar XP a un usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#eboard • #baltop*
> ✦ Ver el ranking de usuarios con más ${moneda}.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#aventura • #adventure*
> ✦ Aventúrate en un nuevo reino y recolecta recursos.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#curar • #heal*
> ✦ Cura tu salud para volverte aventurero.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#cazar • #hunt • #berburu*
> ✦ Aventúrate en una caza de animales.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#inv • #inventario*
> ✦ Ver tu inventario con todos tus ítems.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#mazmorra • #explorar*
> ✦ Explorar mazmorras para ganar ${moneda}.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#halloween*
> ✦ Reclama tu dulce o truco (Solo en Halloween).
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#christmas • #navidad*
> ✦ Reclama tu regalo navideño (Solo en Navidad).
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.   ☁️✿⃟⃢᭄͜═✩═[𝐆𝐀𝐂𝐇𝐀]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐠𝐚𝐜𝐡𝐚 𝐩𝐚𝐫𝐚 𝐫𝐞𝐜𝐥𝐚𝐦𝐚𝐫 𝐲 𝐜𝐨𝐥𝐞𝐜𝐜𝐢𝐨𝐧𝐚𝐫 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐣𝐞𝐬 🎭🌟⊹
┃֪࣪
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#rollwaifu • #rw • #roll*
> ✦ Waifu o husbando aleatorio.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#claim • #c • #reclamar*
> ✦ Reclamar un personaje.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#harem • #waifus • #claims*
> ✦ Ver tus personajes reclamados.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#charimage • #waifuimage • #wimage*
> ✦ Ver una imagen aleatoria de un personaje.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#charinfo • #winfo • #waifuinfo*
> ✦ Ver información de un personaje.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#givechar • #givewaifu • #regalar*
> ✦ Regalar un personaje a otro usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥  ੈ₊˚༅༴│.ᰔᩚ *#vote • #votar*
> ✦ Votar por un personaje para subir su valor.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#waifusboard • #waifustop • #topwaifus*
> ✦ Ver el top de personajes con mayor valor.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.  ☁️✿⃟⃢᭄͜═✩═[𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪🖼️✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐩𝐚𝐫𝐚 𝐜𝐫𝐞𝐚𝐜𝐢𝐨𝐧𝐞𝐬 𝐝𝐞 𝐬𝐭𝐢𝐜𝐤𝐞𝐫𝐬, 𝐞𝐭𝐜. 🎨🔖
┃֪࣪
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#sticker • #s*
> ✦ Crea stickers de (imagen/video).
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#setmeta*
> ✦ Establece un pack y autor para los stickers.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#delmeta*
> ✦ Elimina tu pack de stickers.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#pfp • #getpic*
> ✦ Obtén la foto de perfil de un usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#stickergen#*
> ✦ te genera un sticker con ia con un promt.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#qc*
> ✦ Crea stickers con texto o de un usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#toimg • #img*
> ✦ Convierte stickers en imagen.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#brat • #ttp • #attp*︎
> ✦ Crea stickers con texto.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#emojimix*
> ✦ Funciona 2 emojis para crear un sticker.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#wm*
> ✦ Cambia el nombre de los stickers.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼☁️✿⃟⃢᭄͜═✩═[𝐇𝐄𝐑𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀𝐒]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪🛠️✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐡𝐞𝐫𝐫𝐚𝐦𝐢𝐞𝐧𝐭𝐚𝐬 𝐜𝐨𝐧 𝐦𝐮𝐜𝐡𝐚𝐬 𝐟𝐮𝐧𝐜𝐢𝐨𝐧𝐞𝐬 ⚙️
┃֪࣪
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#calcular • #calcular • #cal*  
> ✦ Calcular todo tipo de ecuaciones.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#tiempo • #clima*  
> ✦ Ver el clima de un país.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#horario*  
> ✦ Ver el horario global de los países.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#fake • #fakereply*  
> ✦ Crea un mensaje falso de un usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#qrcode*  
> ✦ crea un QR al enlace o texto que escribas.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#compress • comprimir*  
> ✦ comprime una imagen reduciendo su peso.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#enhance • #remini • #hd*  
> ✦ Mejora la calidad de una imagen.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#letra*  
> ✦ Cambia la fuente de las letras.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#read • #readviewonce • #ver*  
> ✦ Ver imágenes de una sola vista.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#whatmusic • #shazam*  
> ✦ Descubre el nombre de canciones o vídeos.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#spamwa • #spam*  
> ✦ Envía spam a un usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ss • #ssweb*  
> ✦ Ver el estado de una página web.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#length • #tamaño*  
> ✦ Cambia el tamaño de imágenes y vídeos.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#say • #decir* + [texto]  
>  ✦ Repetir un mensaje.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#todoc • #toducument*  
> ✦ Crea documentos de (audio, imágenes y vídeos).
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#translate • #traducir • #trad*  
> ✦ Traduce palabras en otros idiomas.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.   ☁️✿⃟⃢᭄͜═✩═[𝐏𝐄𝐑𝐅𝐈𝐋]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪🆔✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐩𝐞𝐫𝐟𝐢𝐥 𝐩𝐚𝐫𝐚 𝐯𝐞𝐫, 𝐜𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐫 𝐲 𝐜𝐨𝐦𝐩𝐫𝐨𝐛𝐚𝐫 𝐞𝐬𝐭𝐚𝐝𝐨𝐬 𝐝𝐞 𝐭𝐮 𝐩𝐞𝐫𝐟𝐢𝐥 📇🔍
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#reg • #verificar • #register*
> ✦ Registra tu nombre y edad en el bot.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#unreg*
> ✦ Elimina tu registro del bot.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#profile*
> ✦ Muestra tu perfil de usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#marry* [mension / etiquetar]
> ✦ Propón matrimonio a otro usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#divorce*
> ✦ Divorciarte de tu pareja.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#setgenre • #setgenero*
> ✦ Establece tu género en el perfil del bot.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#delgenre • #delgenero*
> ✦ Elimina tu género del perfil del bot.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#setbirth • #setnacimiento*
> ✦ Establece tu fecha de nacimiento en el perfil del bot.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#delbirth • #delnacimiento*
> ✦ Elimina tu fecha de nacimiento del perfil del bot.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#setdescription • #setdesc*
> ✦ Establece una descripción en tu perfil del bot.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#deldescription • #deldesc*
> ✦ Elimina la descripción de tu perfil del bot.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#lb • #lboard* + <Paginá>
> ✦ Top de usuarios con más (experiencia y nivel).
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#level • #lvl* + <@Mencion>
ׁ> ✦ Ver tu nivel y experiencia actual.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#comprarpremium • #premium*
> ✦ Compra un pase premium para usar el bot sin límites.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#confesiones • #confesar*
> ✦ Confiesa tus sentimientos a alguien de manera anonima.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.   ☁️✿⃟⃢᭄͜═✩═[𝐆𝐑𝐔𝐏𝐎𝐒]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪👥✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐠𝐫𝐮𝐩𝐨𝐬 𝐩𝐚𝐫𝐚 𝐮𝐧𝐚 𝐦𝐞𝐣𝐨𝐫 𝐠𝐞𝐬𝐭𝐢𝐨́𝐧 𝐝𝐞 𝐞𝐥𝐥𝐨𝐬 🔧📢⊹
┃֪࣪
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#config • #on*
> ✦ Ver opciones de configuración de grupos.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#hidetag*
> ✦ Envía un mensaje mencionando a todos los usuarios.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#gp • #infogrupo*
> ✦ Ver la información del grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#linea • #listonline*
> ✦ Ver la lista de los usuarios en línea.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#setwelcome*
> ✦ Establecer un mensaje de bienvenida personalizado.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#setbye*
> ✦ Establecer un mensaje de despedida personalizado.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#link*
> ✦ El Bot envía el link del grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#admins • #admin*
> ✦ Mencionar a los admins para solicitar ayuda.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#restablecer • #revoke*
> ✦ Restablecer el enlace del grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#grupo • #group* [open / abrir]
> ✦ Cambia ajustes del grupo para que todos los usuarios envíen mensaje.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#grupo • #gruop* [close / cerrar]
> ✦ Cambia ajustes del grupo para que solo los administradores envíen mensaje.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#kick* [número / mención]
> ✦ Elimina un usuario de un grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#add • #añadir • #agregar* [número]
> ✦ Invita a un usuario a tu grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#promote* [mención / etiquetar]
> ✦ El Bot dará administrador al usuario mencionado.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#demote* [mención / etiquetar]
> ✦ El Bot quitará el rol de administrador al usuario mencionado.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#gpbanner • #groupimg*
> ✦ Cambiar la imagen del grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#gpname • #groupname*
> ✦ Cambiar el nombre del grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#gpdesc • #groupdesc*
> ✦ Cambiar la descripción del grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#advertir • #warn • #warning*
> ✦ Dar una advertencia a un usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#unwarn • #delwarn*
> ✦ Quitar advertencias.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#advlist • #listadv*
> ✦ Ver lista de usuarios advertidos.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#banchat*
> ✦ Banear al Bot en un chat o grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#unbanchat*
> ✦ Desbanear al Bot del chat o grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#mute* [mención / etiquetar]
> ✦ El Bot elimina los mensajes del usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#unmute* [mención / etiquetar]
> ✦ El Bot deja de eliminar los mensajes del usuario.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#encuesta • #poll*
> ✦ Crea una encuesta.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#delete • #del*
> ✦ Elimina mensajes de otros usuarios.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#fantasmas*
> ✦ Ver lista de inactivos del grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#kickfantasmas*
> ✦ Elimina a los inactivos del grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#invocar • #tagall • #todos*
> ✦ Invoca a todos los usuarios del grupo.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#setemoji • #setemo*
> ✦ Cambia el emoji que se usa en la invitación de usuarios.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#listnum • #kicknum*
> ✦ Elimina a usuarios por el prefijo de país.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.   ☁️✿⃟⃢᭄͜═✩═[𝐀𝐍𝐈𝐌𝐄]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪🎌✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐫𝐞𝐚𝐜𝐜𝐢𝐨𝐧𝐞𝐬 𝐝𝐞 𝐚𝐧𝐢𝐦𝐞 💢🎭⊹
┃֪࣪
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#angry • #enojado* + <mencion>
> ✦ Estar enojado
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#bite* + <mencion>
> ✦ Muerde a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#bleh* + <mencion>
> ✦ Sacar la lengua
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#blush* + <mencion>
> ✦ Sonrojarte
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#bored • #aburrido* + <mencion>
ׁ> ✦ Estar aburrido
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#cry* + <mencion>
> ✦ Llorar por algo o alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#cuddle* + <mencion>
ׁ> ✦ Acurrucarse
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#dance* + <mencion>
> ✦ Sacate los pasitos prohibidos
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#drunk* + <mencion>
> ✦ Estar borracho
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#eat • #comer* + <mencion>
> ✦ Comer algo delicioso
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#facepalm* + <mencion>
ׁ> ✦ Darte una palmada en la cara
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#happy • #feliz* + <mencion>
> ✦ Salta de felicidad
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#hug* + <mencion>
> ✦ Dar un abrazo
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#impregnate • #preg* + <mencion>
ׁ> ✦ Embarazar a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#kill* + <mencion>
> ✦ Toma tu arma y mata a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#kiss • #besar* • #kiss2 + <mencion>
> ✦ Dar un beso
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#laugh* + <mencion>
ׁ> ✦ Reírte de algo o alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#lick* + <mencion>
ׁ> ✦ Lamer a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#love • #amor* + <mencion>
ׁ> ✦ Sentirse enamorado
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#pat* + <mencion>
> ✦ Acaricia a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#poke* + <mencion>
> ✦ Picar a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#pout* + <mencion>
> ✦ Hacer pucheros
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#punch* + <mencion>
> ✦ Dar un puñetazo
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#run* + <mencion>
> ✦ Correr
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#sad • #triste* + <mencion>
> ✦ Expresar tristeza
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#scared* + <mencion>
ׁ> ✦ Estar asustado
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#seduce* + <mencion>
ׁ> ✦ Seducir a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#shy • #timido* + <mencion>
> ✦ Sentir timidez
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#slap* + <mencion>
> ✦ Dar una bofetada
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#dias • #days*
> ✦ Darle los buenos días a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#fraseanime • #phraseanime*
> ✦ envía una frase aleatorio de un anime
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#noches • #nights*
> ✦ Darle las buenas noches a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#sleep* + <mencion>
ׁ> ✦ Tumbarte a dormir
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#smoke* + <mencion>
ׁ> ✦ Fumar
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#think* + <mencion>
ׁ> ✦ Pensar en algo
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.   ☁️✿⃟⃢᭄͜═✩═[𝐉𝐔𝐄𝐆𝐎]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪🎮✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐣𝐮𝐞𝐠𝐨𝐬 𝐩𝐚𝐫𝐚 𝐣𝐮𝐠𝐚𝐫 𝐜𝐨𝐧 𝐭𝐮𝐬 𝐚𝐦𝐢𝐠𝐨𝐬 🕹️🎲⊹
┃֪࣪
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#amistad • #amigorandom* 
> ✦ Hacer amigos con un juego.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#chaqueta • #jalamela*  
> ✦ Hacerte una chaqueta.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#chiste*  
> ✦ La bot te cuenta un chiste.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#consejo*  
> ✦ La bot te da un consejo.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#doxeo • #doxear* + <mención>  
> ✦ Simular un doxeo falso.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#facto*  
> ✦ La bot te lanza un facto.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#formarpareja*  
> ✦ Forma una pareja.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#formarpareja5*  
> ✦ Forma 5 parejas diferentes.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#frase*  
> ✦ La bot te da una frase.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#huevo*  
> ✦ Agárrale el huevo a alguien.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#chupalo* + <mención>  
> ✦ Hacer que un usuario te la chupe.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#aplauso* + <mención>  
> ✦ Aplaudirle a alguien.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#marron* + <mención>  
> ✦ Burlarte del color de piel de un usuario.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#suicidar*  
> ✦ Suicídate.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#iq • #iqtest* + <mención>  
> ✦ Calcular el IQ de alguna persona.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#meme*  
> ✦ La bot te envía un meme aleatorio.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#morse*  
> ✦ Convierte un texto a código morse.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#nombreninja*  
> ✦ Busca un nombre ninja aleatorio.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#paja • #pajeame*  
> ✦ La bot te hace una paja.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#personalidad* + <mención>  
> ✦ La bot busca tu personalidad.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#piropo*  
> ✦ Lanza un piropo.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#pregunta*  
> ✦ Hazle una pregunta a la bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ship • #pareja*  
> ✦ La bot te da la probabilidad de enamorarte de una persona.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#sorteo*  
> ✦ Empieza un sorteo.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#top*  
> ✦ Empieza un top de personas.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#formartrio* + <mención>  
> ✦ Forma un trío.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ahorcado*  
> ✦ Diviértete jugando al ahorcado con la bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#genio*  
> ✦ Comienza una ronda de preguntas con el genio.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#mates • #matematicas*  
> ✦ Responde preguntas de matemáticas para ganar recompensas.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ppt*  
> ✦ Juega piedra, papel o tijeras con la bot.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#sopa • #buscarpalabra*  
> ✦ Juega al famoso juego de sopa de letras.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#pvp • #suit* + <mención>  
> ✦ Juega un PVP contra otro usuario.  
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ttt*  
> ✦ Crea una sala de juego.  
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═══════ • ° ❁⊕❁ ° • ═══════╗
╭╼.    ☁️✿⃟⃢᭄͜═✩═[𝐍𝐒𝐅𝐖]═✩═⃟⃢᭄͜✿☁️
┃֪࣪ ╚═══════ • ° ❁⊕❁ ° • ═══════╝
┃֪࣪
┃֪࣪🔞✨⊹ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐍𝐒𝐅𝐖 (𝐂𝐨𝐧𝐭𝐞𝐧𝐢𝐝𝐨 𝐩𝐚𝐫𝐚 𝐚𝐝𝐮𝐥𝐭𝐨𝐬) 🍑🔥⊹
┃֪࣪
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#anal* + <mencion>
> ✦ Hacer un anal
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#waifu*
> ✦ Buscá una waifu aleatorio.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#bath* + <mencion>
> ✦ Bañarse
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#blowjob • #mamada • #bj* + <mencion>
> ✦ Dar una mamada
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#boobjob* + <mencion>
> ✦ Hacer una rusa
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#cum* + <mencion>
> ✦ Venirse en alguien.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#fap* + <mencion>
> ✦ Hacerse una paja
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#ppcouple • #ppcp*
> ✦ Genera imágenes para amistades o parejas.
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#footjob* + <mencion>
> ✦ Hacer una paja con los pies
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#fuck • #coger • #fuck2* + <mencion>
> ✦ Follarte a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#hentaivideo • #hentaivid*
> ✦ envía un vídeo hentai aleatorio
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#cafe • #coffe*
> ✦ Tomate un cafecito con alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#violar • #perra* + <mencion>
> ✦ Viola a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#grabboobs* + <mencion>
> ✦ Agarrar tetas
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#grop* + <mencion>
> ✦ Manosear a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#lickpussy* + <mencion>
> ✦ Lamer un coño
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#rule34 • #r34* + [Tags]
> ✦ Buscar imágenes en Rule34
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#sixnine • #69* + <mencion>
> ✦ Haz un 69 con alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#spank • #nalgada* + <mencion>
> ✦ Dar una nalgada
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#suckboobs* + <mencion>
> ✦ Chupar tetas
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#undress • #encuerar* + <mencion>
> ✦ Desnudar a alguien
├ׁ̟̇˚₊· ͟͟͞͞➳❥ *#yuri • #tijeras* + <mencion>
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