// Monkey D. Luffy Bot MD - Welcome plugin
// Desarrollado por nene
// Repositorio: https://github.com/nene504273
// ⚠️ No copiar, modificar o distribuir sin permiso explícito del autor
// nevi-dev chambeo aqui

import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, groupMetadata, command, text, isAdmin, isBotAdmin }) {
    // Si no es un evento de grupo, sal del proceso.
    if (!m.isGroup) return;

    // --- Comandos de Configuración ---
    
    const isOwner = m.isGroup && (m.sender === conn.user.jid.replace(/:/g, '') || conn.owners.includes(m.sender));
    const chatId = m.chat;
    const db = conn.plugins[this.pluginName].db || (conn.plugins[this.pluginName].db = {});

    // Inicializar la configuración del grupo si no existe
    if (!db[chatId]) {
        db[chatId] = {
            welcomeEnabled: true,
            byeEnabled: true,
            customWelcome: null,
            customBye: null
        };
    }
    
    // Comando para establecer el mensaje de bienvenida
    if (command === 'setwelcome') {
        if (!isAdmin && !isOwner) return m.reply('❌ ¡Solo los administradores del grupo pueden usar este comando!');
        if (!text) return m.reply('❌ ¡Por favor, proporciona el mensaje de bienvenida que quieres establecer! Usa `!setwelcome <mensaje>`');
        
        db[chatId].customWelcome = text;
        m.reply('✅ ¡Mensaje de bienvenida establecido con éxito!');
        return;
    }
    
    // Comando para establecer el mensaje de despedida
    if (command === 'setbye') {
        if (!isAdmin && !isOwner) return m.reply('❌ ¡Solo los administradores del grupo pueden usar este comando!');
        if (!text) return m.reply('❌ ¡Por favor, proporciona el mensaje de despedida que quieres establecer! Usa `!setbye <mensaje>`');
        
        db[chatId].customBye = text;
        m.reply('✅ ¡Mensaje de despedida establecido con éxito!');
        return;
    }

    // Comando para activar/desactivar el mensaje de bienvenida
    if (command === 'welcome' && (text === 'on' || text === 'off')) {
        if (!isAdmin && !isOwner) return m.reply('❌ ¡Solo los administradores del grupo pueden usar este comando!');
        db[chatId].welcomeEnabled = text === 'on';
        m.reply(`✅ Mensaje de bienvenida ${db[chatId].welcomeEnabled ? 'activado' : 'desactivado'}.`);
        return;
    }

    // Comando para activar/desactivar el mensaje de despedida
    if (command === 'bye' && (text === 'on' || text === 'off')) {
        if (!isAdmin && !isOwner) return m.reply('❌ ¡Solo los administradores del grupo pueden usar este comando!');
        db[chatId].byeEnabled = text === 'on';
        m.reply(`✅ Mensaje de despedida ${db[chatId].byeEnabled ? 'activado' : 'desactivado'}.`);
        return;
    }

    // Si no hay acción o participante en el evento, sal del proceso.
    if (!m.messageStubType || !isBotAdmin) return;
    
    // Obtiene el ID del usuario que se unió o salió.
    let who = m.messageStubParameters[0];
    let taguser = `@${who.split('@')[0]}`;
    const group = groupMetadata?.subject || 'este grupo';
    const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg');
    const img = await (await fetch(pp)).buffer();

    // Evento de 'adición' (unirse al grupo)
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD && db[chatId].welcomeEnabled) {
        // Usa el mensaje personalizado si existe, de lo contrario usa el predeterminado
        const bienvenida = db[chatId].customWelcome || `
ʚ🍖ɞ *¡Yoshaaa! Bienvenido al barco, nakama!*
🏴‍☠️ ¡Yo soy *Monkey D. Luffy*, y seré el Rey de los Piratas!
📍 Has llegado a *${group}*, un lugar para grandes aventuras.
✨ Usa \`#menu\` para ver los comandos del bot.
*¡Prepárate para zarpar, que esto apenas comienza!* 👒
        `;

        await conn.sendMessage(m.chat, { image: img, caption: bienvenida.replace(/@user/g, taguser), mentions: [who] });
    }

    // Evento de 'salida' (el usuario se fue o fue removido)
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE && db[chatId].byeEnabled) {
        // Verifica si el participante que se va no es el bot.
        if (who === conn.user.jid) return;

        // Usa el mensaje personalizado si existe, de lo contrario usa el predeterminado
        const despedida = db[chatId].customBye || `
😢 *Ohh… otro nakama se fue del barco.*
✋ ¡Adiós, ${taguser}! Siempre serás parte de esta tripulación.
⚓ ¡Sigue navegando tu propia ruta, algún día nos reencontraremos en Grand Line!
- *Monkey D. Luffy* 👒
        `;
        
        await conn.sendMessage(m.chat, { image: img, caption: despedida.replace(/@user/g, taguser), mentions: [who] });
    }
}