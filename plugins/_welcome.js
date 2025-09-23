// Monkey D. Luffy Bot MD - Welcome plugin
// Desarrollado por nene
// Repositorio: https://github.com/nene504273
// ⚠️ No copiar, modificar o distribuir sin permiso explícito del autor

import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, groupMetadata }) {
    // Si no hay acción o participante, sal del proceso.
    if (!m.messageStubType || !m.isGroup) return;

    // Obtiene el ID del usuario que se unió o salió.
    let who = m.messageStubParameters[0];
    let taguser = `@${who.split('@')[0]}`;
    const group = groupMetadata?.subject || 'este grupo';

    // Obtiene la foto de perfil del usuario o usa una imagen por defecto.
    const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg');
    const img = await (await fetch(pp)).buffer();

    // Evento de 'adición' (unirse al grupo)
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const bienvenida = `
ʚ🍖ɞ *¡Yoshaaa! Bienvenido al barco, nakama!*
🏴‍☠️ ¡Yo soy *Monkey D. Luffy*, y seré el Rey de los Piratas!
📍 Has llegado a *${group}*, un lugar para grandes aventuras.
✨ Usa \`#menu\` para ver los comandos del bot.
*¡Prepárate para zarpar, que esto apenas comienza!* 👒
`;
        await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [who] });
    }

    // Evento de 'salida' (el usuario se fue o fue removido)
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
        // Verifica si el participante que se va no es el bot.
        if (who === conn.user.jid) return; // El bot se fue. No se puede enviar un mensaje.
        
        const despedida = `😢 *Ohh… otro nakama se fue del barco.*
✋ ¡Adiós, ${taguser}! Siempre serás parte de esta tripulación.
⚓ ¡Sigue navegando tu propia ruta, algún día nos reencontraremos en Grand Line!
- *Monkey D. Luffy* 👒
`;
        await conn.sendMessage(m.chat, { image: img, caption: despedida, mentions: [who] });
    }
}
