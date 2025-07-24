// --- VALORES NECESARIOS PARA LA NUEVA FUNCIONALIDAD ---
// Estos valores se han añadido para recrear la funcionalidad que pediste.
// Asegúrate de que las variables como 'redes' y 'miniaturaRandom' se adapten a tu bot.
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ m᥆ᥒkᥱᥡ ძ ᥣᥙ𝖿𝖿ᥡ';
const packname = '🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️';

/**
 * Plugin centralizado para manejar todos los mensajes de error de permisos.
 * @param {string} type - El tipo de error (ej. 'admin', 'owner', 'unreg').
 * @param {object} conn - La conexión del bot.
 * @param {object} m - El objeto del mensaje.
 * @param {string} comando - El nombre del comando que se intentó usar.
 */
const handler = (type, conn, m, comando) => {
    // Objeto con todos los posibles mensajes de error.
    const msg = {
  rowner: `¡¿Crees que puedes usar *${comando}* sin ser mi capitán?! ¡No way, chico! ¡Yo soy el rey de los piratas! 👑✋️`,
  owner: `¡Oh no~! ¿Creíste que podías usar *${comando}*? ¡Solo los capitanes de la tripulación pueden hacer eso! 😡👊`,
  mods: `*${comando}* es solo para los oficiales de la tripulación, ¡y tú no eres uno de ellos! 😒👺`,
  premium: `¡¿Premium?! ¡Ja! *${comando}* es solo para los VIP de la tripulación, ¡y tú no eres uno de ellos! 💸😂`,
  group: `¡Este comando es solo para los grupos de piratas! ¡No puedes usar *${comando}* en privado, baka! 👫👀`,
  private: `¡Este comando es solo para mi ojo privado! ¡No puedes usar *${comando}* aquí! 🤐👀`,
  admin: `*${comando}* es solo para los admins de la tripulación. ¡Tú solo eres un pirata más! 😏👊`,
  botAdmin: `¡Necesito ser admin para ejecutar *${comando}*! ¡Hazme admin primero, o te dejaré en la isla de los peces! 🐟😂`,
  unreg: `¡¿Usar *${comando}* sin registrarte?! ¡Qué descaro! Regístrate ya con: #reg MonkeyDLuffy o vete a buscar un tesoro en otra parte 📚👀`,
  restrict: `¡Ooops~! Esta función está *desactivada*. ¡No puedes usar *${comando}* ahora mismo! 🚫😔`
}[type];

    // Si se encontró un mensaje para el 'type' dado, se envía.
    if (msg) {
        // --- CONSTRUCCIÓN DEL CONTEXTINFO ---
        // Aquí se crea el objeto con la apariencia de reenviado de canal y el anuncio externo.
        const contextInfo = {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid,
                newsletterName,
                serverMessageId: -1
            },
            externalAdReply: {
  title: packname,
  body: '¡Acceso Denegado! ¡No eres digno de usar este comando, pirata!',
  thumbnailUrl: icons,
  sourceUrl: redes,
  mediaType: 1,
  renderLargerThumbnail: false
}
        };

        // Se envía el mensaje de error utilizando el contextInfo creado.
        return conn.reply(m.chat, msg, m, { contextInfo }).then(_ => m.react('✖️'));
    }
    return true; // Devuelve true si no hay mensaje, para seguir el flujo si es necesario.
};

// Exportamos la función para poder importarla desde handler.js
export default handler;