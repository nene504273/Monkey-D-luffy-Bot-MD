// --- VALORES NECESARIOS ---
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ m᥆ᥒkᥱᥡ ძ ᥣᥙ𝖿𝖿ᥡ';
const packname = '🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️';

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

    if (!msg) return true;

    try {
        // Contexto de reenvío desde newsletter (funciona 100% en WhatsApp oficial)
        const contextInfo = {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid,
                newsletterName: newsletterName,
                serverMessageId: String(Date.now())
            }
        };

        // Enviar mensaje de texto con formato de reenvío
        await conn.reply(m.chat, msg, m, { contextInfo });
        await m.react('✖️');
    } catch (err) {
        console.error('Error en handler de permisos:', err);
        // Fallback ultra simple (sin formato)
        await conn.reply(m.chat, msg, m);
        await m.react('✖️');
    }
};

export default handler;