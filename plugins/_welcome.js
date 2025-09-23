// Monkey D. Luffy Bot MD - Welcome plugin
// Desarrollado por nene
// Repositorio: https://github.com/nene504273
// ⚠️ No copiar, modificar o distribuir sin permiso explícito del autor

export async function before(m, { conn, participants, groupMetadata }) {
    // Declara 'group' al inicio para que pueda usarse en ambos eventos.
    const group = groupMetadata?.subject || 'este grupo';

    if (m.action === 'add') {
        // Usa una lógica consistente para obtener el nombre de usuario.
        const user = participants[0]?.split('@')[0] || 'nakama';
        const bienvenida = `
ʚ🍖ɞ *¡Yoshaaa! Bienvenido al barco, nakama!*
🏴‍☠️ ¡Yo soy *Monkey D. Luffy*, y seré el Rey de los Piratas!
📍 Has llegado a *${group}*, un lugar para grandes aventuras.
✨ Usa \`#menu\` para ver los comandos del bot.
*¡Prepárate para zarpar, que esto apenas comienza!* 👒
`;
        // Intenta obtener la foto de perfil y, si falla, usa una URL más estable o un recurso local.
        const pp = await conn.profilePictureUrl(participants[0], 'image').catch(() => 'https://static.wikia.nocookie.net/onepiece/images/a/a2/Monkey_D._Luffy_Anime_Saga_East_Blue_Frente.png');
        await conn.sendMessage(m.chat, { image: { url: pp }, caption: bienvenida, mentions: participants });
        
    } else if (m.action === 'remove') {
        const user = m.participant?.split('@')[0] || 'nakama';

        // Elimina el código para la remoción del bot, ya que es imposible de ejecutar.
        // Solo se gestiona la salida de un usuario normal.
        const despedida = `😢 *Ohh… otro nakama se fue del barco.*
✋ ¡Adiós, @${user}! Siempre serás parte de esta tripulación.
⚓ ¡Sigue navegando tu propia ruta, algún día nos reencontraremos en Grand Line!
- *Monkey D. Luffy* 👒
`;
        await conn.sendMessage(m.chat, { text: despedida, mentions: [m.participant] });
    }
}
