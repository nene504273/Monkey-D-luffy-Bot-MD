// --- VALORES NECESARIOS PARA LA NUEVA FUNCIONALIDAD ---

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ m᥆ᥒkᥱᥡ ძ ᥣᥙ𝖿𝖿ᥡ';
const packname = '🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️';
// Definimos la URL de la imagen que proporcionaste
const imagenError = 'https://raw.githubusercontent.com/danielalejandrobasado-glitch/Yotsuba-MD-Premium/main/uploads/d7f6d69503facf47.jpg';

/**
 * Plugin centralizado para manejar todos los mensajes de error de permisos.
 */
const handler = (type, conn, m, comando) => {

    const msg = {
        rowner: `🔥 *¡GOMU GOMU NO... ALTO!* 🔥 Solo el *CREADOR DEL BOT* puede usar *${comando}*. ¡No eres el Rey Pirata! 👑✋️`,
        owner: `😠 *¡HEYY!* Solo los *Capitanes de la Tripulación* (Owners) pueden ejecutar *${comando}*. ¡Tú no tienes esa recompensa! 💰👊`,
        mods: `📢 ¡Alto ahí, pirata! *${comando}* es solo para los *Oficiales de la Tripulación* (Mods). ¡Sigue entrenando para subir de rango! ⚔️😒`,
        premium: `💎 *¡SHISHISHI!* ¿Quieres **${comando}**? ¡Ese comando es *oro puro*! Solo para los *VIP Premium* de la tripulación. ¡Consigue tu membresía, baka! 💸😂`,
        group: `🏝️ ¡Este comando es para la **Isla del Tesoro**! (Grupos). ¡No uses *${comando}* en privado, baka! ¡Necesito a toda la tripulación! 👫👀`,
        private: `🤫 *¡OYE!* ¿Qué haces? Este comando es para misiones *secretas* y *privadas*. ¡No puedes usar *${comando}* aquí, se lo diré a Zoro! 🤐👀`,
        admin: `🛡️ *¡Escudo de Goma!* *${comando}* es solo para los *Administradores* que cuidan la nave. ¡Pide que te hagan Admin, o no podrás usarlo! 😏👊`,
        botAdmin: `🤖 *¡Necesito ser ADMIN!* ¡No puedo ejecutar *${comando}* si me atas las manos! ¡Hazme administrador primero, o este barco se hundirá! ⛵️😂`,
        unreg: `📚 *¡QUÉ DESCARO!* ¿Usar *${comando}* sin registrarte? ¡Eres un pirata sin nombre! ¡Regístrate ya para zarpar! Usa: *#reg ${m.name || 'TuNombre'}.${Math.floor(Math.random() * 31 + 10)}* ¡O vete a buscar un tesoro en otra parte! 🧭👀`,
        restrict: `🚫 *¡DETENIDO POR LA MARINA!* Ooops~! Esta función está *desactivada* temporalmente. ¡No puedes usar *${comando}* ahora mismo! 😔⚓️`
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
                body: '🚨 ¡ACCESO DENEGADO!',
                // Aquí es donde agregamos tu foto de Catbox
                thumbnailUrl: imagenError, 
                sourceUrl: global.redes || 'https://whatsapp.com', 
                mediaType: 1,
                renderLargerThumbnail: false // Mantiene la foto pequeña como pediste
            }
        };
        return conn.reply(m.chat, msg, m, { contextInfo }).then(_ => m.react('✖️'));
    }
    return true;
};

export default handler;