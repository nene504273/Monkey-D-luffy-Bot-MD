import { WAMessageStubType, WASocket } from '@whiskeysockets/baileys';

// ==========================================================================
// |                             Monkey D. Luffy Bot MD                     |
// |                Desarrollado por nene                                    |
// |                                                                        |
// |  No está permitido copiar, modificar o distribuir este código sin       |
// |  permiso explícito del autor.                                          |
// ==========================================================================

export async function before(m, { conn, participants, groupMetadata }) {
  if (m.action === 'add') {
    let bienvenida = `
    ʚ🍖ɞ *¡Yoshaaa! Bienvenido al barco, nakama!*
    🏴‍☠️ ¡Yo soy *Monkey D. Luffy*, y seré el Rey de los Piratas!
    📍 Has llegado a *${groupMetadata.subject}*, un lugar para grandes aventuras.
    ✨ Usa `#menu` para ver los comandos del bot.
    *¡Prepárate para zarpar, que esto apenas comienza!* 👒
    `;
    let pp = await conn.profilePictureUrl(m.participants[0], 'image');
    await conn.sendMessage(m.chat, { image: { url: pp }, caption: bienvenida, mentions: [m.participants[0]] });
  } else if (m.action === 'remove' && m.participant !== conn.user.jid) {
    let despedida = `
    😢 *Ohh… otro nakama se fue del barco.*
    ✋ ¡Adiós, @${m.participant.split('@')[0]}! Siempre serás parte de esta tripulación.
    ⚓ ¡Sigue navegando tu propia ruta, algún día nos reencontraremos en Grand Line!
    - *Monkey D. Luffy* 👒
    `;
    await conn.sendMessage(m.chat, { text: despedida, mentions: [m.participant] });
  } else if (m.action === 'remove' && m.participant === conn.user.jid) {
    let mensajeEliminacion = `
    😤 *¡¡¿Me acaban de echar del barco?!!*
    ❌ ¡Esto no se hace a un futuro Rey de los Piratas!
    🍖 *Volveré más fuerte... ¡y con carne!*
    - *Monkey D. Luffy fuera del grupo... pero no del mar.* 🌊👒
    `;
    await conn.sendMessage(m.chat, { text: mensajeEliminacion });
  }
}
