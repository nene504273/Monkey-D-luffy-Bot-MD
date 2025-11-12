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

    const msg = {
        // Énfasis principalmente con NEGRITAS
        
        rowner: `🔥 *¡GOMU GOMU NO... ALTO!* 🔥 Solo el **CREADOR DEL BOT** puede usar **${comando}**. ¡No eres el Rey Pirata! 👑✋️`,
        
        owner: `😠 *¡HEYY!* Solo los **Capitanes de la Tripulación** (Owners) pueden ejecutar **${comando}**. ¡Tú no tienes esa recompensa! 💰👊`,
        
        mods: `📢 ¡Alto ahí, pirata! **${comando}** es solo para los **Oficiales de la Tripulación** (Mods). ¡Sigue entrenando para subir de rango! ⚔️😒`,
        
        premium: `💎 *¡SHISHISHI!* ¿Quieres **${comando}**? ¡Ese comando es **oro puro**! Solo para los **VIP Premium** de la tripulación. ¡Consigue tu membresía, baka! 💸😂`,
        
        group: `🏝️ ¡Este comando es para la **Isla del Tesoro**! (Grupos). ¡No uses **${comando}** en privado, baka! ¡Necesito a toda la tripulación! 👫👀`,
        
        private: `🤫 *¡OYE!* ¿Qué haces? Este comando es para misiones **secretas** y **privadas**. ¡No puedes usar **${comando}** aquí, se lo diré a Zoro! 🤐👀`,
        
        admin: `🛡️ *¡Escudo de Goma!* **${comando}** es solo para los **Administradores** que cuidan la nave. ¡Pide que te hagan Admin, o no podrás usarlo! 😏👊`,
        
        botAdmin: `🤖 *¡Necesito ser ADMIN!* ¡No puedo ejecutar **${comando}** si me atas las manos! ¡Hazme administrador primero, o este barco se hundirá! ⛵️😂`,
        
        unreg: `📚 *¡QUÉ DESCARO!* ¿Usar **${comando}** sin registrarte? ¡Eres un pirata sin nombre! ¡Regístrate ya para zarpar! Usa: **#reg ${m.name || 'TuNombre'}.${Math.floor(Math.random() * 31 + 10)}** ¡O vete a buscar un tesoro en otra parte! 🧭👀`,
        
        restrict: `🚫 *¡DETENIDO POR LA MARINA!* Ooops~! Esta función está *desactivada* temporalmente. ¡No puedes usar **${comando}** ahora mismo! 😔⚓️`
        
    }[type];

    if (msg) {
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
                body: '🚨 ¡ACCESO DENEGADO! ¡No eres parte de mi tripulación para esto!',
                thumbnailUrl: global.iconos, // Asegúrate de que global.iconos exista y sea una imagen
                sourceUrl: global.redes, // Asegúrate de que global.redes exista y sea un enlace
                mediaType: 1,
                renderLargerThumbnail: false
            }
        };
        return conn.reply(m.chat, msg, m, { contextInfo }).then(_ => m.react('✖️'));
    }
    return true;
};

export default handler;