import moment from 'moment-timezone';
import fs from 'fs';
import { xpRange } from '../lib/levelling.js';
import path from 'path';

const cwd = process.cwd();

let handler = async (m, { conn, args }) => {
  // Get user ID
  let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

  // Get username
  let name = await conn.getName(userId);

  let user = global.db.data.users[userId];
  let exp = user.exp || 0;
  let level = user.level || 0;
  let role = user.role || 'Novato';
  let coins = user.coin || 0;

  // Get general data
  let _uptime = process.uptime() * 1000;
  let uptime = clockString(_uptime);
  let totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = Object.values(global.plugins).filter(v => v.help && v.tags).length;

  // Search for random GIFs
  const gifVideosDir = path.join(cwd, 'src', 'menu');
  if (!fs.existsSync(gifVideosDir)) {
    console.error('El directorio no existe:', gifVideosDir);
    return;
  }

  const gifVideos = fs.readdirSync(gifVideosDir)
    .filter(file => file.endsWith('.mp4'))
    .map(file => path.join(gifVideosDir, file));

  const randomGif = gifVideos[Math.floor(Math.random() * gifVideos.length)];

  // Luffy-themed text with info
  let txt = `
🏴‍☠️🍖----------------------------------🍖🏴‍☠️
        Capitán ${name}, ¡Bienvenido a mi tripulación!
        ¡Soy Monkey D. Luffy, el futuro Rey de los Piratas!
🍖🏴‍☠️----------------------------------🏴‍☠️🍖

Aquí está mi lista de comandos para ayudarte en tu aventura:

╔═════════<ONE PIECE>═════════╗
       「 INFORMACIÓN DEL BARCO 」
╚═════════<ONE PIECE>═════════╝
║  🌊 *TIPO DE BOT*: *PIRATA*
║  ⚓ *MODO*: *LIBRE*
║  🗺️ *NAVEGACIÓN*: *MULTI DISPOSITIVO*
║  📜 *COMANDOS TOTALES*: ${totalCommands}
║  ⏳ *TIEMPO ACTIVO*: ${uptime}
║  👥 *TRIPULANTES REGISTRADOS*: ${totalreg}
║  👑 *CAPITÁN CREADOR*: [WhatsApp](https://Wa.me/18294868853)
╚════════════════════════╝


╔═════════<ONE PIECE>═════════╗
     「 DATOS DEL TRIPULANTE 」
╚═════════<ONE PIECE>═════════╝
║  👤 *TRIPULANTE*: ${name}
║  💥 *EXPERIENCIA EN BATALLA*: ${exp}
║  💰 *BERRIES*: ${coins}
║  📈 *NIVEL DE COMBATE*: ${level}
║  🎖️ *RANGO*: ${role}
╚═══════════════════════╝
> ¡Crea tu propio *Sub-Barco* con tu número usando *#qr* o *#code*!


╔═════<ONE PIECE>═════╗
   「 ${(conn.user.jid == global.conn.user.jid ? 'BARCO PRINCIPAL' : 'SUB-BARCO')} 」
╚═════<ONE PIECE>═════╝

*⚔️ L I S T A - D E - HABILIDADES - PIRATAS ⚔️*


   ╔═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╗
╭╼.  🌊⚓[INFORMACIÓN DEL BOT]⚓🌊
┃ ╚═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╝
┃
┃✨⊹ Comandos para ver el estado e información del Bot ✨⊹
. 🏴‍☠️   *#ayuda • #menuPirata*
> ✦ Ver la lista de comandos del Bot.
. 🏴‍☠️   *#tiempoActivo • #tiempoNavegacion*
> ✦ Ver tiempo activo o en línea del Bot.
. 🏴‍☠️   *#codigoFuente • #guion*
> ✦ Enlace del repositorio oficial del Bot.
. 🏴‍☠️   *#equipo • #colaboradoresPirata*
> ✦ Ver la lista de desarrolladores del Bot.
. 🏴‍☠️   *#subBot • #codigoSubBot*
> ✦ Crea una sesión de Sub-Bot.
. 🏴‍☠️   *#barcos • #conexiones*
> ✦ Ver la lista de Sub-Bots activos.
. 🏴‍☠️   *#creadorLuffy*
> ✦ Contacto del creador del Bot.
. 🏴‍☠️   *#estadoLuffy • #situacion*
> ✦ Ver el estado actual del Bot.
. 🏴‍☠️   *#enlacesOficiales • #gruposOficiales*
> ✦ Ver los enlaces oficiales del Bot.
. 🏴‍☠️   *#infoBotLuffy • #informacionBot*
> ✦ Ver la información completa del Bot.
. 🏴‍☠️   *#sugerencia • #nuevoComando*
> ✦ Sugiere un nuevo comando.
. 🏴‍☠️   *#pingLuffy • #reaccion*
> ✦ Ver la velocidad de respuesta del Bot.
. 🏴‍☠️   *#reporteFalla • #reportarProblema*
> ✦ Reporta alguna falla o problema del Bot.
. 🏴‍☠️   *#sistemaLuffy • #statusSistema*
> ✦ Ver estado del sistema de alojamiento.
. 🏴‍☠️   *#velocidadLuffy • #pruebaVelocidad*
> ✦ Ver las estadísticas de velocidad del Bot.
. 🏴‍☠️   *#tripulantes • #usuariosRegistrados*
> ✦ Ver la cantidad de usuarios registrados en el sistema.
. 🏴‍☠️   *#funcionesTotales • #totalHabilidades*
> ✦ Ver todas las funciones del Bot.
. 🏴‍☠️   *#limpiarSesion • #borrarEsperas*
> ✦ Eliminar archivos de sesión innecesarios.
. 🏴‍☠️   *#configurarAutorespuesta*
> ✦ Configurar un mensaje personalizado del Bot.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╗
╭╼ 🌊⚓[BUSCADORES]⚓🌊
┃ ╚═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╝
┃
┃🔍⊹ Comandos para realizar búsquedas en distintas plataformas 🔎⊹
. 🏴‍☠️   *#buscarTikTok • #tiktoksPirata*
> ✦ Buscador de videos de TikTok.
. 🏴‍☠️   *#buscarTweets*
> ✦ Buscador de publicaciones de Twitter/X.
. 🏴‍☠️   *#buscarYouTube • #ytsPirata*
> ✦ Realiza búsquedas en YouTube.
. 🏴‍☠️   *#buscarGitHub*
> ✦ Buscador de usuarios de GitHub.
. 🏴‍☠️   *#buscarCuevana • #cuevanaPeliculas*
> ✦ Buscador de películas/series por Cuevana.
. 🏴‍☠️   *#buscarGoogle*
> ✦ Realiza búsquedas en Google.
. 🏴‍☠️   *#buscarPinterest • #imagenesPinterest*
> ✦ Buscador de imágenes de Pinterest.
. 🏴‍☠️   *#infoAnimeLuffy*
> ✦ Buscador de información de un animé.
. 🏴‍☠️   *#imagenGoogle • #obtenerImagen*
> ✦ Buscador de imágenes en Google.
. 🏴‍☠️   *#buscarAnimes • #animesPirata*
> ✦ Buscador de animes en TioAnime.
. 🏴‍☠️   *#infoCapituloAnime • #animeCapitulos*
> ✦ Buscador de capítulos de #buscarAnimes.
. 🏴‍☠️   *#datosAnime • #infoManga*
> ✦ Buscador de información de anime/manga.
. 🏴‍☠️   *#buscarHentai • #hentaiPirata*
> ✦ Buscador de capítulos hentai.
. 🏴‍☠️   *#buscarXNXX • #videosXNXX*
> ✦ Buscador de videos de XNXX.
. 🏴‍☠️   *#buscarXVideos • #videosXV*
> ✦ Buscador de videos de Xvideos.
. 🏴‍☠️   *#buscarPornhub • #phVideos*
> ✦ Buscador de videos de Pornhub.
. 🏴‍☠️   *#buscarNPM*
> ✦ Buscador de paquetes en npmjs.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╗
╭╼. 🌊⚓[DESCARGAS PIRATA]⚓🌊
┃ ╚═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╝
┃
┃📥⊹ Comandos de descargas para varios archivos 📂⊹
. 🏴‍☠️   *#descargarTikTok • #ttDescarga*
> ✦ Descarga videos de TikTok.
. 🏴‍☠️   *#descargarMediafire • #mfDescarga*
> ✦ Descargar un archivo de MediaFire.
. 🏴‍☠️   *#descargarTikTok2 • #ttDescarga2*
> ✦ Descarga videos de TikTok.
. 🏴‍☠️   *#descargarPin • #pinterestDescarga*
> ✦ Descarga videos de Pinterest con un enlace.
. 🏴‍☠️   *#descargarMediafire2 • #mfDescarga2*
> ✦ Descargar archivos de MediaFire.
. 🏴‍☠️   *#descargarVideoPin • #videoPinterest* + [enlace]
> ✦ Descargar videos de Pinterest.
. 🏴‍☠️   *#descargarMega • #mgDescarga* + [enlace]
> ✦ Descargar archivos de MEGA.
. 🏴‍☠️   *#descargarYouTubeAudio • #descargarYouTubeVideo*
> ✦ Descargar música/video de YouTube.
. 🏴‍☠️   *#ytMp3 • #ytMp4*
> ✦ Descarga directa por url de YouTube.
. 🏴‍☠️   *#descargarFacebook • #fbDescarga*
> ✦ Descargar videos de Facebook.
. 🏴‍☠️   *#descargarTwitter • #xDescarga* + [enlace]
> ✦ Descargar videos de Twitter/X.
. 🏴‍☠️   *#descargarInstagram • #igDescarga*
> ✦ Descargar contenido de Instagram.
. 🏴‍☠️   *#tiktokBuscar • #tiktoksBuscar* + [búsqueda]
> ✦ Buscar videos de TikTok.
. 🏴‍☠️   *#descargarTerabox • #tbDescarga* + [enlace]
> ✦ Descargar archivos de Terabox.
. 🏴‍☠️   *#descargarDrive • #driveDescarga* + [enlace]
> ✦ Descargar archivos desde Google Drive.
. 🏴‍☠️   *#tiktokImagen • #tiktokAudio* + <url>
> ✦ Descargar fotos/audios de TikTok.
. 🏴‍☠️   *#clonarGit* + <url>
> ✦ Descargar repositorios desde GitHub.
. 🏴‍☠️   *#descargarXVideos*
> ✦ Descargar videos de Xvideos.
. 🏴‍☠️   *#descargarXNXX*
> ✦ Descargar videos de XNXX.
. 🏴‍☠️   *#descargarApk • #apkMod*
> ✦ Descargar APKs (Aptoide).
. 🏴‍☠️   *#tiktokAleatorio • #ttAleatorio*
> ✦ Descargar video aleatorio de TikTok.
. 🏴‍☠️   *#descargarNPM • #npmDescargador*
> ✦ Descargar paquetes desde NPMJs.
. 🏴‍☠️   *#enlacesAnime • #descargarAnime*
> ✦ Descargar enlaces disponibles de anime.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╗
╭╼. 🌊⚓[ECONOMÍA PIRATA]⚓🌊
┃ ╚═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╝
┃
┃💰🎮⊹ Comandos de economía y RPG para ganar Berries y otros recursos 🏆💎⊹
┃
. 🏴‍☠️   *#trabajar • #faena*
> ✦ Trabaja para ganar Berries.
. 🏴‍☠️   *#prostituirse • #trabajoNocturno*
> ✦ Trabaja como prostituta y gana Berries.
. 🏴‍☠️   *#caraYCruz • #suertePirata*
> ✦ Apuesta tus Berries a cara o cruz.
. 🏴‍☠️   *#crimenOrganizado • #actoIlegal*
> ✦ Trabaja como ladrón para ganar Berries.
. 🏴‍☠️   *#ruletaPirata • #apostarRuleta*
> ✦ Apuesta Berries al color rojo o negro.
. 🏴‍☠️   *#casinoPirata • #apuestas*
> ✦ Apuesta tus Berries en el casino.
. 🏴‍☠️   *#tragaperras*
> ✦ Apuesta tus Berries en la ruleta y prueba tu suerte.
. 🏴‍☠️   *#miCartera • #bolsaBerries*
> ✦ Ver tus Berries en la cartera.
. 🏴‍☠️   *#miBanco • #cofreBerries*
> ✦ Ver tus Berries en el banco.
. 🏴‍☠️   *#depositarBerries • #guardarBerries*
> ✦ Deposita tus Berries al banco.
. 🏴‍☠️   *#retirarBerries • #sacarBerries*
> ✦ Retira tus Berries del banco.
. 🏴‍☠️   *#transferir • #pagar*
> ✦ Transfiere Berries o XP a otros usuarios.
. 🏴‍☠️   *#minar • #mineria*
> ✦ Trabaja como minero y recolecta recursos.
. 🏴‍☠️   *#comprarTodo • #comprar*
> ✦ Compra Berries con tu XP.
. 🏴‍☠️   *#recompensaDiaria • #diarioPirata*
> ✦ Reclama tu recompensa diaria.
. 🏴‍☠️   *#cofreDiario*
> ✦ Reclama un cofre diario lleno de recursos.
. 🏴‍☠️   *#recompensaSemanal • #semanalPirata*
> ✦ Reclama tu regalo semanal.
. 🏴‍☠️   *#recompensaMensual • #mensualPirata*
> ✦ Reclama tu recompensa mensual.
. 🏴‍☠️   *#robarBerries • #atraco*
> ✦ Intenta robarle Berries a alguien.
. 🏴‍☠️   *#robarXP • #atracoXP*
> ✦ Intenta robar XP a un usuario.
. 🏴‍☠️   *#rankingBerries • #topBerries*
> ✦ Ver el ranking de usuarios con más Berries.
. 🏴‍☠️   *#aventuraPirata • #expedicion*
> ✦ Aventúrate en un nuevo reino y recolecta recursos.
. 🏴‍☠️   *#curarHeridas • #recuperarSalud*
> ✦ Cura tu salud para volverte aventurero.
. 🏴‍☠️   *#cazarPresas • #caza*
> ✦ Aventúrate en una caza de animales.
. 🏴‍☠️   *#miInventario • #bolsaArticulos*
> ✦ Ver tu inventario con todos tus ítems.
. 🏴‍☠️   *#explorarMazmorra • #profundidades*
> ✦ Explorar mazmorras para ganar Berries.
. 🏴‍☠️   *#dulceOTruco*
> ✦ Reclama tu dulce o truco (Solo en Halloween).
. 🏴‍☠️   *#regaloNavidad • #navidadPirata*
> ✦ Reclama tu regalo navideño (Solo en Navidad).
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╗
╭╼.  🌊⚓[TESOROS PIRATAS]⚓🌊
┃ ╚═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╝
┃
┃✨⊹ Comandos para reclamar y coleccionar personajes de tu tripulación 🎭🌟⊹
┃
. 🏴‍☠️   *#rollTripulante • #rwPirata • #rollPirata*
> ✦ Waifu o husbando aleatorio.
. 🏴‍☠️   *#reclamarPersonaje • #cPirata*
> ✦ Reclamar un personaje.
. 🏴‍☠️   *#comprarPersonaje • #comprarTripulante*
> ✦ Comprar un personaje en venta.
. 🏴‍☠️   *#miHarem • #misTripulantes • #misReclamos*
> ✦ Ver tus personajes reclamados.
. 🏴‍☠️   *#removerTripulante • #removerVenta*
> ✦ Eliminar un personaje en venta.
. 🏴‍☠️   *#vender • #venderTripulante* + [nombre] [precio]*
> ✦ Poner un personaje a la venta.
. 🏴‍☠️   *#imagenPersonaje • #imagenWaifu • #wimagePirata*
> ✦ Ver una imagen aleatoria de un personaje.
. 🏴‍☠️   *#infoPersonaje • #infoWaifu*
> ✦ Ver información de un personaje.
. 🏴‍☠️   *#topFavoritos • #favtopPirata*
> ✦ Ver el top de personajes favoritos del roll.
. 🏴‍☠️   *#regalarTodoHarem • #darHarem*
> ✦ Regalar todos tus personajes a otro usuario.
. 🏴‍☠️   *#regalarPersonaje • #regalarTripulante*
> ✦ Regalar un personaje a otro usuario.
. 🏴‍☠️   *#establecerFavorito • #favoritoPirata*
> ✦ Poner de favorito a un personaje.
. 🏴‍☠️   *#votarPersonaje • #votarLuffy*
> ✦ Votar por un personaje para subir su valor.
. 🏴‍☠️   *#tablaTripulantes • #topWaifusPirata*
> ✦ Ver el top de personajes con mayor valor.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╗
╭╼.  🌊⚓[PEGATINAS PIRATAS]⚓🌊
┃ ╚═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╝
┃
┃🖼️✨⊹ Comandos para creaciones de pegatinas, etc. 🎨🔖
┃
. 🏴‍☠️   *#crearPegatina • #sPegatina*
> ✦ Crea pegatinas de (imagen/video).
. 🏴‍☠️   *#establecerMetadata*
> ✦ Establece un paquete y autor para las pegatinas.
. 🏴‍☠️   *#eliminarMetadata*
> ✦ Elimina tu paquete de pegatinas.
. 🏴‍☠️   *#fotoPerfil • #obtenerFoto*
> ✦ Obtén la foto de perfil de un usuario.
. 🏴‍☠️   *#generarPegatinaIA*
> ✦ Te genera una pegatina con IA con un prompt.
. 🏴‍☠️   *#citarPegatina*
> ✦ Crea pegatinas con texto o de un usuario.
. 🏴‍☠️   *#aImagen • #convertirImagen*
> ✦ Convierte pegatinas en imagen.
. 🏴‍☠️   *#textoPegatina • #ttpPegatina • #attpPegatina*
> ✦ Crea pegatinas con texto.
. 🏴‍☠️   *#mezclarEmoji*
> ✦ Fusiona 2 emojis para crear una pegatina.
. 🏴‍☠️   *#pegatinasVariadas*
> ✦ Envía 5 pegatinas.
. 🏴‍☠️   *#cambiarNombrePegatina*
> ✦ Cambia el nombre de las pegatinas.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╗
╭╼🌊⚓[HERRAMIENTAS PIRATAS]⚓🌊
┃ ╚═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╝
┃
┃🛠️✨⊹ Comandos de herramientas con muchas funciones ⚙️
┃
. 🏴‍☠️   *#calcular • #operacionMatematica*
> ✦ Calcular todo tipo de ecuaciones.
. 🏴‍☠️   *#climaPirata • #pronostico*
> ✦ Ver el clima de un país.
. 🏴‍☠️   *#horarioGlobal*
> ✦ Ver el horario global de los países.
. 🏴‍☠️   *#mensajeFalso • #respuestaFalsa*
> ✦ Crea un mensaje falso de un usuario.
. 🏴‍☠️   *#crearQR*
> ✦ Crea un QR al enlace o texto que escribas.
. 🏴‍☠️   *#comprimirImagen • #reducirPeso*
> ✦ Comprime una imagen reduciendo su peso.
. 🏴‍☠️   *#mejorarCalidad • #reminiImagen • #hdImagen*
> ✦ Mejora la calidad de una imagen.
. 🏴‍☠️   *#cambiarLetra*
> ✦ Cambia la fuente de las letras.
. 🏴‍☠️   *#verUnaVez • #leerUnaVez*
> ✦ Ver imágenes de una sola vista.
. 🏴‍☠️   *#queMusicaEs • #shazamMusica*
> ✦ Descubre el nombre de canciones o vídeos.
. 🏴‍☠️   *#enviarSpam • #spamMensajes*
> ✦ Envía spam a un usuario.
. 🏴‍☠️   *#estadoWeb • #capturaWeb*
> ✦ Ver el estado de una página web.
. 🏴‍☠️   *#ajustarTamaño • #redimensionar*
> ✦ Cambia el tamaño de imágenes y vídeos.
. 🏴‍☠️   *#decir • #repetirMensaje* + [texto]
> ✦ Repetir un mensaje.
. 🏴‍☠️   *#aDocumento • #convertirDocumento*
> ✦ Crea documentos de (audio, imágenes y vídeos).
. 🏴‍☠️   *#traducir • #traductor*
> ✦ Traduce palabras en otros idiomas.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╗
╭╼.  🌊⚓[PERFIL PIRATA]⚓🌊
┃ ╚═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╝
┃
┃🆔✨⊹ Comandos de perfil para ver, configurar y comprobar estados de tu perfil 📇🔍
. 🏴‍☠️   *#registrar • #verificarRegistro*
> ✦ Registra tu nombre y edad en el bot.
. 🏴‍☠️   *#desregistrar*
> ✦ Elimina tu registro del bot.
. 🏴‍☠️   *#miPerfil*
> ✦ Muestra tu perfil de usuario.
. 🏴‍☠️   *#casarse* [mención / etiquetar]
> ✦ Propón matrimonio a otro usuario.
. 🏴‍☠️   *#divorciarse*
> ✦ Divorciarte de tu pareja.
. 🏴‍☠️   *#establecerGenero • #miGenero*
> ✦ Establece tu género en el perfil del bot.
. 🏴‍☠️   *#eliminarGenero • #quitarGenero*
> ✦ Elimina tu género del perfil del bot.
. 🏴‍☠️   *#establecerNacimiento • #miCumpleaños*
> ✦ Establece tu fecha de nacimiento en el perfil del bot.
. 🏴‍☠️   *#eliminarNacimiento • #quitarNacimiento*
> ✦ Elimina tu fecha de nacimiento del perfil del bot.
. 🏴‍☠️   *#establecerDescripcion • #miDescripcion*
> ✦ Establece una descripción en tu perfil del bot.
. 🏴‍☠️   *#eliminarDescripcion • #quitarDescripcion*
> ✦ Elimina la descripción de tu perfil del bot.
. 🏴‍☠️   *#tablaClasificacion • #topUsuarios* + <Página>
> ✦ Top de usuarios con más (experiencia y nivel).
. 🏴‍☠️   *#miNivel • #nivelUsuario* + <@Mencion>
> ✦ Ver tu nivel y experiencia actual.
. 🏴‍☠️   *#comprarPremium • #pasePremium*
> ✦ Compra un pase premium para usar el bot sin límites.
. 🏴‍☠️   *#confesionesAnonimas • #confesarSecretos*
> ✦ Confiesa tus sentimientos a alguien de manera anónima.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╗
╭╼.  🌊⚓[COMANDOS DE GRUPO PIRATA]⚓🌊
┃ ╚═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╝
┃
┃👥✨⊹ Comandos de grupos para una mejor gestión de ellos 🔧📢⊹
┃
. 🏴‍☠️   *#configuracionGrupo • #activarOpciones*
> ✦ Ver opciones de configuración de grupos.
. 🏴‍☠️   *#mencionarTodosOculto*
> ✦ Envía un mensaje mencionando a todos los usuarios.
. 🏴‍☠️   *#infoGrupo • #datosGrupo*
> ✦ Ver la información del grupo.
. 🏴‍☠️   *#listaEnLinea • #quienesEstan*
> ✦ Ver la lista de los usuarios en línea.
. 🏴‍☠️   *#establecerBienvenida*
> ✦ Establecer un mensaje de bienvenida personalizado.
. 🏴‍☠️   *#establecerDespedida*
> ✦ Establecer un mensaje de despedida personalizado.
. 🏴‍☠️   *#enlaceGrupo*
> ✦ El Bot envía el link del grupo.
. 🏴‍☠️   *#mencionarAdmins • #adminsGrupo*
> ✦ Mencionar a los admins para solicitar ayuda.
. 🏴‍☠️   *#restablecerEnlace • #revocarEnlace*
> ✦ Restablecer el enlace del grupo.
. 🏴‍☠️   *#abrirGrupo • #grupoAbierto* [abrir]
> ✦ Cambia ajustes del grupo para que todos los usuarios envíen mensaje.
. 🏴‍☠️   *#cerrarGrupo • #grupoCerrado* [cerrar]
> ✦ Cambia ajustes del grupo para que solo los administradores envíen mensaje.
. 🏴‍☠️   *#expulsar • #eliminarUsuario* [número / mención]
> ✦ Elimina un usuario de un grupo.
. 🏴‍☠️   *#agregar • #invitarUsuario* [número]
> ✦ Invita a un usuario a tu grupo.
. 🏴‍☠️   *#promoverAdmin • #darAdmin* [mención / etiquetar]
> ✦ El Bot dará administrador al usuario mencionado.
. 🏴‍☠️   *#degradarAdmin • #quitarAdmin* [mención / etiquetar]
> ✦ El Bot quitará el rol de administrador al usuario mencionado.
. 🏴‍☠️   *#cambiarImagenGrupo • #bannerGrupo*
> ✦ Cambiar la imagen del grupo.
. 🏴‍☠️   *#cambiarNombreGrupo • #nombreGrupo*
> ✦ Cambiar el nombre del grupo.
. 🏴‍☠️   *#cambiarDescripcionGrupo • #descGrupo*
> ✦ Cambiar la descripción del grupo.
. 🏴‍☠️   *#advertirUsuario • #warningLuffy*
> ✦ Dar una advertencia a un usuario.
. 🏴‍☠️   *#quitarAdvertencia • #eliminarWarn*
> ✦ Quitar advertencias.
. 🏴‍☠️   *#listaAdvertencias • #usuariosAdvertidos*
> ✦ Ver lista de usuarios advertidos.
. 🏴‍☠️   *#banearChat*
> ✦ Banear al Bot en un chat o grupo.
. 🏴‍☠️   *#desbanearChat*
> ✦ Desbanear al Bot del chat o grupo.
. 🏴‍☠️   *#silenciar • #muteUsuario* [mención / etiquetar]
> ✦ El Bot elimina los mensajes del usuario.
. 🏴‍☠️   *#desilenciar • #unmuteUsuario* [mención / etiquetar]
> ✦ El Bot deja de eliminar los mensajes del usuario.
. 🏴‍☠️   *#crearEncuesta • #votacion*
> ✦ Crea una encuesta.
. 🏴‍☠️   *#eliminarMensaje • #borrarMensaje*
> ✦ Elimina mensajes de otros usuarios.
. 🏴‍☠️   *#tripulantesInactivos • #fantasmasGrupo*
> ✦ Ver lista de inactivos del grupo.
. 🏴‍☠️   *#expulsarInactivos • #limpiarFantasmas*
> ✦ Elimina a los inactivos del grupo.
. 🏴‍☠️   *#invocarTodos • #mencionarATodos*
> ✦ Invoca a todos los usuarios del grupo.
. 🏴‍☠️   *#establecerEmojiInvitacion • #emojiGrupo*
> ✦ Cambia el emoji que se usa en la invitación de usuarios.
. 🏴‍☠️   *#listarNumeros • #expulsarPorNumero*
> ✦ Elimina a usuarios por el prefijo de país.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

   ╔═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╗
╭╼.  🌊⚓[REACCIONES PIRATAS]⚓🌊
┃ ╚═════════ • ° 🍖🏴‍☠️🍖 ° • ═════════╝
┃
┃🎌✨⊹ Comandos de reacciones de anime 💢🎭⊹
┃
. 🏴‍☠️   *#enfadarse • #enojadoLuffy* + <mencion>
> ✦ Estar enojado.
. 🏴‍☠️   *#morder • #mordisco* + <mencion>
> ✦ Muerde a alguien.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝
`; 

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


  // Function to format uptime
  function clockString(ms) {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [d, 'Días', h, 'Horas', m, 'Minutos', s, 'Segundos'].map(v => v.toString().padStart(2, 0)).join(' ');
  }

  // Send the message with the GIF
  await conn.sendFile(m.chat, randomGif, 'luffy.mp4', txt, m);
};

handler.help = ['menuLuffy'];
handler.tags = ['main'];
handler.command = ['menuLuffy', 'luffy', 'ayudaLuffy'];

export default handler;