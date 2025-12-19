// Este es un código hecho por nevi-dev para el bot Monkey D. Luffy de nene.
// ⚠️ Este código no puede ser modificado, copiado o usado sin el permiso explícito de su creador.

import * as baileys from '@whiskeysockets/baileys';
import fetch from 'node-fetch'; 

const { WAMessageStubType } = baileys; 

// --- CONFIGURACIÓN DE API Y CONSTANTES ---
const API_URL = 'http://neviapi.ddns.net:5000/welcome'; 
const API_KEY = 'luffy'; 
const DEFAULT_AVATAR_URL = 'https://files.catbox.moe/za5lnn.jpg'; 
const BACKGROUND_IMAGE_URL = 'https://files.catbox.moe/mncbs0.jpg';

// Información del Canal
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '🎄 Jolly Roger Navideño V2 🎄';

// --- FUNCIONES CENTRALES ---

async function generateImageFromAPI(type, userName, groupName, memberCount, avatarUrl) {
    const action = type === 'welcome' ? 'welcome' : 'bye';
    const payload = {
        username: userName.replace('@', ''), 
        action: action,
        group_name: groupName,
        member_count: memberCount,
        background_url: BACKGROUND_IMAGE_URL, 
        profile_url: avatarUrl
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY },
            body: JSON.stringify(payload)
        });
        if (!response.ok) return null;
        return await response.buffer(); 
    } catch (e) {
        return null;
    }
}

export async function before(m, { conn, groupMetadata, participants }) {
    if (!m.isGroup || !m.messageStubType) return;

    const stubParams = m.messageStubParameters;
    if (!Array.isArray(stubParams) || stubParams.length === 0) return;

    const chatId = m.chat;
    const chatConfig = global.db.data.chats[chatId] || {};
    const groupName = groupMetadata?.subject || 'este grupo';
    const memberCount = participants?.length || 0;

    if (!chatConfig.welcome) return;

    let who = stubParams[0]; 
    let taguser = `@${who.split('@')[0]}`;
    const ppUrl = await conn.profilePictureUrl(who, 'image').catch(() => DEFAULT_AVATAR_URL); 

    const formatMessage = (message, userTag) => {
        return message
            .replace(/@user/g, userTag)
            .replace(/@group/g, groupName)
            .replace(/@count/g, memberCount);
    };

    // --- Lógica de Bienvenida ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_INVITE) {

        const mediaBuffer = await generateImageFromAPI('welcome', taguser, groupName, memberCount, ppUrl);

        const welcomeMessage = `
🕊️ *BIENVENIDO/DA* 🕊️
─── ˗ˏˋ 🍖 ˎˊ˗ ───

∫ ⚓ *USUARIO* : @user
∫ 🌍 *GRUPO* : @group
∫ 👥 *MIEMBROS* : @count
∫ 📅 *FECHA* : ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}

*Te damos la bienvenida, respeta las reglas.*
`.trim();

        const messageOptions = { 
            caption: formatMessage(welcomeMessage, taguser), 
            mentions: [who],
            contextInfo: {
                mentionedJid: [who],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: newsletterJid,
                    newsletterName: newsletterName,
                    serverMessageId: -1
                }
            }
        };

        if (mediaBuffer) {
            await conn.sendMessage(m.chat, { image: mediaBuffer, ...messageOptions });
        } else {
            await conn.sendMessage(m.chat, { text: messageOptions.caption, mentions: messageOptions.mentions, contextInfo: messageOptions.contextInfo });
        }
    }

    // --- Lógica de Despedida ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
        if (who === conn.user.jid) return;
        
        const mediaBuffer = await generateImageFromAPI('goodbye', taguser, groupName, memberCount, ppUrl);

        const byeMessage = `
🥀 *ADIÓS NAKAMA* 🥀
─── ˗ˏˋ 🌊 ˎˊ˗ ───

∫ 👤 *USUARIO* : @user
∫ 🚢 *GRUPO* : @group
∫ 👥 *QUEDAN* : @count

*Esperamos que vuelvas pronto.*
`.trim();

        const messageOptions = { 
            caption: formatMessage(byeMessage, taguser), 
            mentions: [who],
            contextInfo: {
                mentionedJid: [who],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: newsletterJid,
                    newsletterName: newsletterName,
                    serverMessageId: -1
                }
            }
        };

        if (mediaBuffer) {
            await conn.sendMessage(m.chat, { image: mediaBuffer, ...messageOptions });
        } else {
            await conn.sendMessage(m.chat, { text: messageOptions.caption, mentions: messageOptions.mentions, contextInfo: messageOptions.contextInfo });
        }
    }
}