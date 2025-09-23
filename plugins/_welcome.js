// Este archivo solo maneja los eventos de bienvenida y despedida.
// Se conecta al sistema de activación/desactivación que ya tienes.

import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

/**
 * Esta función maneja los eventos de unión y salida de un grupo,
 * verificando si la función está activada en la base de datos.
 */
export async function before(m, { conn, groupMetadata, isBotAdmin, participants }) {
    // Salir si no es un evento de grupo.
    if (!m.isGroup) return;

    const chatId = m.chat;
    const chatConfig = global.db.data.chats[chatId] || {};
    const groupName = groupMetadata?.subject || 'este grupo';
    const memberCount = participants.length;
    
    // Salir si no es un evento de unión/salida o el bot no es administrador.
    if (!m.messageStubType || !isBotAdmin) return;

    let who = m.messageStubParameters[0];
    let taguser = `@${who.split('@')[0]}`;
    const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg');
    const img = await (await fetch(pp)).buffer();

    // Reemplazar los placeholders en el mensaje
    const formatMessage = (message, userTag) => {
        return message
            .replace(/@user/g, userTag)
            .replace(/@group/g, groupName)
            .replace(/@count/g, memberCount);
    };

    // Evento de 'adición' (unirse al grupo)
    // Se activa si la propiedad 'welcome' es verdadera
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD && chatConfig.welcome) {
        const welcomeMessage = chatConfig.customWelcome || `
ʚ🍖ɞ *¡Yoshaaa! Bienvenido al barco, nakama!*
🏴‍☠️ ¡Yo soy *Monkey D. Luffy*, y seré el Rey de los Piratas!
📍 Has llegado a *@group*, un lugar para grandes aventuras. Ahora somos *@count* nakamas.
✨ Usa \`#menu\` para ver los comandos del bot.
*¡Prepárate para zarpar, que esto apenas comienza!* 👒
        `;

        await conn.sendMessage(m.chat, { image: img, caption: formatMessage(welcomeMessage, taguser), mentions: [who] });
    }

    // Evento de 'salida' (el usuario se fue o fue removido)
    // Se activa si la propiedad 'bye' es verdadera
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE && chatConfig.bye) {
        if (who === conn.user.jid) return;

        const byeMessage = chatConfig.customBye || `
😢 *Ohh… otro nakama se fue del barco.*
✋ ¡Adiós, @user! Siempre serás parte de esta tripulación.
⚓ ¡Sigue navegando tu propia ruta, algún día nos reencontraremos en Grand Line!
- *Monkey D. Luffy* 👒
        `;

        await conn.sendMessage(m.chat, { image: img, caption: formatMessage(byeMessage, taguser), mentions: [who] });
    }
}
