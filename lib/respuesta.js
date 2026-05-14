// --- VALORES NECESARIOS PARA LA NUEVA FUNCIONALIDAD ---

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ m᥆ᥒkᥱᥡ ძ ᥣᥙ𝖿𝖿ᥡ';
const packname = '🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️';
// URL de la imagen (se descargará y convertirá a buffer)
const imagenError = 'https://raw.githubusercontent.com/danielalejandrobasado-glitch/Yotsuba-MD-Premium/main/uploads/d7f6d69503facf47.jpg';

/**
 * Plugin centralizado para manejar todos los mensajes de error de permisos.
 * Ahora usa canales (newsletter) y es compatible con WhatsApp normal.
 */
const handler = async (type, conn, m, comando) => {

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
        try {
            // 1. Descargar la imagen y obtener el buffer
            const response = await fetch(imagenError);
            const imageBuffer = await response.buffer();

            // 2. Generar un serverMessageId válido (string de dígitos, no negativo)
            const serverMessageId = String(Date.now()); // ID único simulado

            // 3. Construir el contextInfo con los campos de canal y la tarjeta externa
            const contextInfo = {
                mentionedJid: [m.sender],
                isForwarded: true,               // Marca como reenviado
                forwardingScore: 999,            // Alta probabilidad de ser reenviado
                forwardedNewsletterMessageInfo: {
                    newsletterJid,
                    newsletterName,
                    serverMessageId              // ID válido (ahora funciona en WhatsApp normal)
                },
                externalAdReply: {
                    title: packname,
                    body: '🚨 ¡ACCESO DENEGADO!',
                    thumbnail: imageBuffer,       // Buffer de la imagen (obligatorio)
                    mediaType: 1,                 // 1 = imagen
                    sourceUrl: global.redes || 'https://whatsapp.com',
                    renderLargerThumbnail: false  // Miniatura pequeña, como pediste
                }
            };

            // 4. Enviar el mensaje
            await conn.reply(m.chat, msg, m, { contextInfo });
            await m.react('✖️');
        } catch (err) {
            console.error('Error al obtener la imagen de error:', err);
            // Fallback sin imagen si falla la descarga
            await conn.reply(m.chat, msg, m);
            await m.react('✖️');
        }
        return;
    }
    return true;
};

export default handler;