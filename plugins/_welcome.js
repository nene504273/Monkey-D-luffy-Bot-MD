// Este es un código hecho por nevi-dev para el bot Monkey D. Luffy de nene.
// ⚠️ Este código no puede ser modificado, copiado o usado sin el permiso explícito de su creador.

import * as baileys from '@whiskeysockets/baileys';
import fetch from 'node-fetch'; 

const { WAMessageStubType } = baileys; 

// --- CONFIGURACIÓN DE API Y CONSTANTES ---
const API_URL = 'http://neviapi.ddns.net:5000/welcome'; // Endpoint de la API
const API_KEY = 'luffy'; // Clave de la API
// Usar una URL de fallback que esté disponible
const DEFAULT_AVATAR_URL = 'https://files.catbox.moe/za5lnn.jpg'; 
const BACKGROUND_IMAGE_URL = 'https://files.catbox.moe/mncbs0.jpg';

// --- FUNCIONES CENTRALES ---

/**
 * Genera la imagen de bienvenida/despedida haciendo una petición a la API externa.
 * Devuelve el Buffer de la imagen.
 */
async function generateImageFromAPI(type, userName, groupName, memberCount, avatarUrl) {
    const action = type === 'welcome' ? 'welcome' : 'bye';

    // Se asume que la API acepta el body JSON
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
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY // Asegúrate de que este header es el correcto para tu API
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Loguear más detalles del error para depuración
            console.error(`Error en la respuesta de la API (Status: ${response.status}). Body: ${await response.text()}`);
            return null;
        }

        return await response.buffer(); 

    } catch (e) {
        console.error('Error al llamar a la API de generación de imagen:', e);
        return null;
    }
}


/**
 * Esta función maneja los eventos de unión y salida de un grupo.
 */
export async function before(m, { conn, groupMetadata, participants }) {
    // Nota: Se ha eliminado 'isBotAdmin' de los parámetros.

    // 1. Validaciones iniciales
    if (!m.isGroup || !m.messageStubType) return;

    // **CORRECCIÓN CLAVE:** Asegurar que los parámetros del stub existen
    const stubParams = m.messageStubParameters;
    if (!Array.isArray(stubParams) || stubParams.length === 0) return;

    const chatId = m.chat;
    // Usamos el operador || para asegurar que siempre haya un objeto de chat
    const chatConfig = global.db.data.chats[chatId] || {};
    const groupName = groupMetadata?.subject || 'este grupo';
    const memberCount = participants?.length || 0;

    // Salir si la función de bienvenida no está habilitada.
    if (!chatConfig.welcome) return;

    // Obtener los datos del usuario afectado
    let who = stubParams[0]; // Extraer el JID del primer parámetro
    let taguser = `@${who.split('@')[0]}`;
    // Nuevo: Extraer el número de teléfono del usuario
    let phoneNumber = who.split('@')[0]; 
    const ppUrl = await conn.profilePictureUrl(who, 'image').catch(() => DEFAULT_AVATAR_URL); 

    // Función auxiliar para formatear el mensaje de texto
    const formatMessage = (message, userTag) => {
        return message
            .replace(/@user/g, userTag)
            .replace(/@group/g, groupName)
            .replace(/@count/g, memberCount)
            .replace(/@number/g, phoneNumber); // Nuevo placeholder para el número
    };

    // ---------------------------------------------
    // --- Lógica de Bienvenida (GROUP_PARTICIPANT_ADD / INVITE) ---
    // ---------------------------------------------
    // Se ha eliminado la verificación '&& isBotAdmin'
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_INVITE) {

        const mediaBuffer = await generateImageFromAPI('welcome', taguser, groupName, memberCount, ppUrl);

        // Mensaje de Bienvenida ACORTADO y ESTILIZADO
        const welcomeMessage = chatConfig.customWelcome || `
.·:*¨༺ 🍖 𝕎𝕖𝕝𝕔𝕠𝕞𝕖 ༻¨*:·.
  ⚓ *B I E N V E N I D O S* ⚓
.·:*¨༺ ⋆⋅☆⋅⋆ ༻¨*:·.
    *¡Yoshaaa, nakama!* 👒
    📍 *@group*
    👤 *User:* @user
    📞 *Number:* +@number
    ✨ ¡Ahora somos *@count* en el barco!
    *¡Usa #menu para zarpar!*
.·:*¨༺ ⋆⋅☆⋅⋆ ༻¨*:·.
        `;

        const messageOptions = { 
            caption: formatMessage(welcomeMessage, taguser), 
            mentions: [who] 
        };

        if (mediaBuffer) {
            await conn.sendMessage(m.chat, { image: mediaBuffer, ...messageOptions });
        } else {
            // Envía solo texto si la imagen falla.
            await conn.sendMessage(m.chat, { text: messageOptions.caption, mentions: messageOptions.mentions });
            console.warn(`[WARNING] Fallo la generación de imagen para ${taguser} usando la API. Enviando solo texto.`);
        }
    }

    // ----------------------------------------------------------------------
    // --- Lógica de Despedida (LEAVE / REMOVE) ---
    // ----------------------------------------------------------------------
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {

        // Ignorar si el bot es quien se fue/fue removido
        if (who === conn.user.jid) return;

        // Se ha eliminado la verificación '!isBotAdmin'
        
        const mediaBuffer = await generateImageFromAPI('goodbye', taguser, groupName, memberCount, ppUrl);

        // Mensaje de Despedida ESTILIZADO
        const byeMessage = chatConfig.customBye || `
.·:*¨༺ ⚓️ 𝐆𝐨𝐨𝐝𝐛𝐲𝐞 ༻¨*:·.
  😢 *O h h...* 🥀
.·:*¨༺ ⋆⋅☆⋅⋆ ༻¨*:·.
    *¡Adiós, nakama!* 🏴‍☠️
    👤 *User:* @user
    📞 *Number:* +@number
    ✨ Quedan *@count* en el barco.
    *¡Nos vemos en Grand Line!* 🌊
.·:*¨༺ ⋆⋅☆⋅⋆ ༻¨*:·.
        `;

        const messageOptions = { 
            caption: formatMessage(byeMessage, taguser), 
            mentions: [who] 
        };

        if (mediaBuffer) {
            await conn.sendMessage(m.chat, { image: mediaBuffer, ...messageOptions });
        } else {
            await conn.sendMessage(m.chat, { text: messageOptions.caption, mentions: messageOptions.mentions });
            console.warn(`[WARNING] Fallo la generación de imagen para ${taguser} usando la API. Enviando solo texto.`);
        }
    }
}