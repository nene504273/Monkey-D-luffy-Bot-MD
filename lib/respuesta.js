// --- VALORES NECESARIOS PARA LA NUEVA FUNCIONALIDAD ---
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ m᥆ᥒkᥱᥡ ძ ᥣᥙ𝖿𝖿ᥡ';
const packname = '🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️';

/**
 * Plugin centralizado para manejar todos los mensajes de error de permisos.
 *
 * @param {string} type - El tipo de error (ej. 'admin', 'owner', 'unreg').
 * @param {object} conn - La conexión del bot.
 * @param {object} m - El objeto del mensaje.
 * @param {string} comando - El nombre del comando que se intentó usar.
 */

// Hacemos el handler asíncrono para poder usar await al obtener la foto de perfil.
const handler = async (type, conn, m, comando) => {
    const msg = {
        rowner: `¡¿Crees que puedes usar *${comando}* sin ser mi capitán?! ¡No way, chico! ¡Yo soy el rey de los piratas! 👑✋️`,
        owner: `¡Oh no~! ¿Creíste que podías usar *${comando}*? ¡Solo los capitanes de la tripulación pueden hacer eso! 😡👊`,
        mods: `*${comando}* es solo para los oficiales de la tripulación, ¡y tú no eres uno de ellos! 😒👺`,
        premium: `¡¿Premium?! ¡Ja! *${comando}* es solo para los VIP de la tripulación, ¡y tú no eres uno de ellos! 💸😂`,
        group: `¡Este comando es solo para los grupos de piratas! ¡No puedes usar *${comando}* en privado, baka! 👫👀`,
        private: `¡Este comando es solo para mi ojo privado! ¡No puedes usar *${comando}* aquí! 🤐👀`,
        admin: `*${comando}* es solo para los admins de la tripulación. ¡Tú solo eres un pirata más! 😏👊`,
        botAdmin: `¡Necesito ser admin para ejecutar *${comando}*! ¡Hazme admin primero, o te dejaré en la isla de los peces! 🐟😂`,
        unreg: `¡¿Usar *${comando}* sin registrarte?! ¡Qué descaro! Regístrate ya con: #reg ${m.name || 'TuNombre'}.${Math.floor(Math.random() * 31 + 10)} o vete a buscar un tesoro en otra parte 📚👀`,
        restrict: `¡Ooops~! Esta función está *desactivada*. ¡No puedes usar *${comando}* ahora mismo! 🚫😔`
    }[type];

    if (msg) {
        
        let thumbnailUrl = global.iconos; // Por defecto, usa el ícono del bot
        
        // 1. OBTENER LA FOTO DE PERFIL SOLO SI ES EL ERROR 'unreg'
        if (type === 'unreg') {
            try {
                // Intentamos obtener la foto del remitente (m.sender)
                // Asegúrate de que conn.profilePictureUrl esté disponible en tu conexión.
                const userPicUrl = await conn.profilePictureUrl(m.sender, 'image');
                thumbnailUrl = userPicUrl; // Usamos la foto del usuario
            } catch (e) {
                // Si falla (no tiene foto), mantendrá global.iconos
            }
        }
        
        // 2. CONTEXTO DE RESPUESTA
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
                // Si es unreg, el cuerpo es diferente; si no, es el predeterminado
                body: type === 'unreg' ? `¡NECESITAS REGISTRARTE, ${m.name || 'PIRATA'}!` : '¡Acceso Denegado! ¡No eres digno de usar este comando, pirata!',
                // >>> USAMOS LA URL OBTENIDA (global.iconos o la foto del usuario) <<<
                thumbnailUrl: thumbnailUrl,
                sourceUrl: global.redes,
                mediaType: 1,
                // RenderLargerThumbnail en true para que la foto se vea mejor en el error 'unreg'
                renderLargerThumbnail: type === 'unreg' ? true : false 
            }
        };
        
        // 3. ENVIAR RESPUESTA
        return conn.reply(m.chat, msg, m, { contextInfo }).then(_ => m.react('✖️'));
    }

    return true;
};

export default handler;