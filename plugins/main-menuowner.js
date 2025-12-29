import moment from 'moment-timezone';

let handler = async (m, { conn, args }) => {
let owner = `
🏴‍☠️ ¡Kaizoku ou ni ore wa naru!
һ᥆ᥣᥲ! s᥆ᥡ *${botname}* y seré el Rey de los piratas 🍖

» ⚓ \`PANEL DE COMANDOS (MODS)\` ⚓

🍖 *#addowner • #delowner*
> 🏴‍☠️ ¡Recluta o expulsa nakamas de la lista de owners!
🍖 *#codigo*
> 🗝️ Crea un token o código de canjeo de tesoros.
🍖 *#backup • #copia*
> 🗺️ Crea un respaldo de seguridad de la *db* del Sunny.
🍖 *#bcgc*
> 📢 ¡Grita a toda la flota! (Mensaje a todos los grupos).
🍖 *#cleanfiles*
> 🧹 Limpia los archivos temporales de la cubierta.
🍖 *#addcoins • #añadircoin*
> 💰 ¡Reparte Berries a un usuario!
🍖 *#userpremium • #addprem*
> 👑 Otorga pase de Noble Mundial (Premium) a un nakama.
🍖 *#delprem • #remove*
> ⛓️ Quita el pase de Noble Mundial.
🍖 *#addexp • #añadirxp*
> ✨ ¡Aumenta el nivel de pelea (XP) de un usuario!
🍖 *#autoadmin*
> 🚩 El Bot se proclama capitán (Auto-admin) si tiene poder.
🍖 *#listban • #banlist*
> ⛓️ Lista de piratas encerrados en Impel Down.
🍖 *#banuser*
> 🚫 Envía a un usuario a la prisión de Impel Down.
🍖 *#unbanuser*
> 🔓 Libera a un usuario de la prisión.
🍖 *#dsowner • #delai*
> 🗑️ Elimina archivos innecesarios de la sesión del capitán.
🍖 *#cleartmp • #vaciartmp*
> 🧹 Limpia los desperdicios de la carpeta tmp.
🍖 *#block • #unblock*
> ⛔ Bloquea o desbloquea el paso a un usuario.
🍖 *#listblock • #blocklist*
> 📖 Ver el libro negro de usuarios bloqueados.
🍖 *#removecoin • #quitarcoin*
> 💸 Quita Berries a un usuario.
🍖 *#deletedatauser • #resetuser*
> 🔄 Borra la recompensa y datos de un usuario.
🍖 *#removexp • #quitarxp*
> ✨ Baja el nivel de pelea (XP) de un usuario.
🍖 *#newgc • #creargc*
> 🚩 ¡Fundar una nueva flota! (Crea un grupo).
🍖 *#deletefile*
> 🗑️ Elimina archivos internos del Bot.
🍖 *#get • #fetch*
> 🔭 Observa el estado de una isla (página web).
🍖 *#plugin • #getplugin*
> 📜 Extrae un pergamino (plugin) de los archivos.
🍖 *#grouplist • #listgroup*
> ⛵ Ver listado de todos los barcos donde navegamos.
🍖 *#join • #invite*
> ⚓ Únete a un grupo mediante enlace de invitación.
🍖 *#leave • #salir*
> 👋 ¡Abandona el barco actual!
🍖 *#let*
> ⏳ Envía un mensaje con duración de 1 hora.
🍖 *#prefix*
> 🚩 Cambia la bandera (prefijo) del Bot.
🍖 *#resetprefix*
> 🔄 Restablece la bandera original del Bot.
🍖 *#reiniciar • #restart*
> ⚙️ Repara el Going Merry (Reinicia el servidor).
🍖 *#reunion • #meeting*
> 🔔 Llama a junta de capitanes (Aviso a owners).
🍖 *#savejs • #savefile*
> 📁 Guarda un archivo en las rutas del Bot.
🍖 *#saveplugin*
> 📜 Guarda un nuevo pergamino en la carpeta de comandos.
🍖 *#setbanner*
> 🖼️ Cambia el cartel de recompensa (Menú principal).
🍖 *#setavatar*
> 🖼️ Cambia la imagen del catálogo.
🍖 *#addcmd • #setcmd*
> 🏷️ Guarda un sticker/imagen como comando.
🍖 *#delcmd*
> 🗑️ Elimina un comando de sticker.
🍖 *#cmdlist • #listcmd*
> 📖 Ver listado de comandos guardados.
🍖 *#setimage • #setpfp*
> 📸 Cambia la foto de perfil del Bot.
🍖 *#setmoneda*
> 🪙 Cambia el tipo de moneda del Bot.
🍖 *#setname*
> 🏷️ Cambia el nombre de este pirata.
🍖 *#setbio • #setstatus*
> 📝 Cambia la descripción del Bot.
🍖 *#update*
> 🆙 ¡Entrenamiento de 2 años! (Actualiza a la última versión).

_¡La aventura nos espera!_ 🌊`.trim();

await conn.sendMessage(m.chat, {
text: owner,
contextInfo: {
externalAdReply: {
title: '🏴‍☠️ Panel de Control del Rey de los Piratas 🏴‍☠️',
body: 'Gomu Gomu no... ¡Owner!',
thumbnailUrl: 'https://files.catbox.moe/k3x0v6.jpg', // URL de la imagen que enviaste
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true
}
}
}, { quoted: m });
};

handler.help = ['mods'];
handler.tags = ['main'];
handler.command = ['dev', 'owners'];
handler.rowner = true;

export default handler;