// Monkey D. Luffy Bot MD - Welcome plugin
// Desarrollado por nene
// Repositorio: https://github.com/nene504273
// ⚠️ No copiar, modificar o distribuir sin permiso explícito del autor

export async function before(m, { conn, participants, groupMetadata }) {
    const group = groupMetadata?.subject || 'este grupo';

    if (m.action === 'add') {
        const user = participants && participants[0] ? participants[0].split('@')[0] : '';
        const bienvenida = `
ʚ🍖ɞ *¡Yoshaaa! Bienvenido al barco, nakama!*
🏴‍☠️ ¡Yo soy *Monkey D. Luffy*, y seré el Rey de los Piratas!
📍 Has llegado a *${group}*, un lugar para grandes aventuras.
✨ Usa \`#menu\` para ver los comandos del bot.
*¡Prepárate para zarpar, que esto apenas comienza!* 👒

`;
        const pp = await conn.profilePictureUrl(participants[0], 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg');
        await conn.sendMessage(m.chat, { image: { url: pp }, caption: bienvenida, mentions: [participants[0]] });
    } else if (m.action === 'remove') {
        const user = m.participant ? m.participant.split('@')[0] : '';

        // Si el que se va es el bot
        if (m.participant === conn.user.jid) {
            // Este mensaje no se puede enviar porque el bot ya no estará en el grupo.
            // Es una lógica que no se puede ejecutar.
            const mensajeEliminacion = `
😤 *¡¡¿Me acaban de echar del barco?!!*
❌ ¡Esto no se hace a un futuro Rey de los Piratas!
🍖 *Volveré más fuerte... ¡y con carne!*
- *Monkey D. Luffy fuera del grupo... pero no del mar.* 🌊👒
`;
            // Opcionalmente, puedes registrar este evento en un log, pero no puedes enviar el mensaje.
            // console.log('El bot ha sido eliminado del grupo:', group);
        } else {
            // Si se va un usuario normal
            const despedida = `😢 *Ohh… otro nakama se fue del barco.*
✋ ¡Adiós, @${user}! Siempre serás parte de esta tripulación.
⚓ ¡Sigue navegando tu propia ruta, algún día nos reencontraremos en Grand Line!
- *Monkey D. Luffy* 👒
`;
            await conn.sendMessage(m.chat, { text: despedida, mentions: [m.participant] });
        }
    }
}