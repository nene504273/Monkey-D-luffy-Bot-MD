// Este es un código hecho por nevi-dev para el bot Monkey D. Luffy de nene.
// ⚠️ Este código no puede ser modificado, copiado o usado sin el permiso explícito de su creador.

// Corregimos la importación de MessageMedia usando la convención moderna
import * as baileys from '@whiskeysockets/baileys';
import fetch from 'node-fetch'; // Necesario para la llamada a la API

const { WAMessageStubType } = baileys; 

// --- CONFIGURACIÓN DE API Y CONSTANTES ---
const API_URL = 'http://neviapi.ddns.net:5000/welcome'; // Endpoint de la API
const API_KEY = 'luffy'; // Clave de la API
const DEFAULT_AVATAR_URL = 'https://files.catbox.moe/xr2m6u.jpg'; 
const BACKGROUND_IMAGE_URL = 'https://files.catbox.moe/1rou90.jpg'; // URL de fondo que se enviará a la API

// --- FUNCIONES CENTRALES ---

/**
 * Genera la imagen de bienvenida/despedida haciendo una petición a la API externa.
 * Devuelve el Buffer de la imagen.
 */
async function generateImageFromAPI(type, userName, groupName, memberCount, avatarUrl) {
    const action = type === 'welcome' ? 'welcome' : 'bye';

    const payload = {
        username: userName.replace('@', ''), // La API probablemente prefiere el nombre sin el '@'
        action: action,
        group_name: groupName,
        member_count: memberCount,
        background_url: BACKGROUND_IMAGE_URL, // Usamos la constante de fondo
        profile_url: avatarUrl
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY
            },
            body: JSON.stringify(payload)
        });

        // 1. Revisamos si la respuesta es exitosa (código 200-299)
        if (!response.ok) {
            console.error(`Error en la respuesta de la API (Status: ${response.status}).`);
            return null;
        }

        // 2. Usamos .buffer() para obtener los datos binarios de la imagen directamente.
        // Esto es correcto cuando la API responde solo con la imagen.
        return await response.buffer(); 

    } catch (e) {
        console.error('Error al llamar a la API de generación de imagen:', e);
        return null;
    }
}


/**
 * Esta función maneja los eventos de unión y salida de un grupo.
 */
export async function before(m, { conn, groupMetadata, isBotAdmin, participants }) {
    // Salir si no es un evento de grupo o no hay un StubType.
    if (!m.isGroup || !m.messageStubType) return;

    const chatId = m.chat;
    const chatConfig = global.db.data.chats[chatId] || {};
    const groupName = groupMetadata?.subject || 'este grupo';
    const memberCount = participants.length;

    // Salir si la función de bienvenida no está habilitada.
    if (!chatConfig.welcome) return;

    // Obtener los datos del usuario afectado
    let who = m.messageStubParameters[0];
    let taguser = `@${who.split('@')[0]}`;
    const ppUrl = await conn.profilePictureUrl(who, 'image').catch(() => DEFAULT_AVATAR_URL); 

    // Función auxiliar para formatear el mensaje de texto
    const formatMessage = (message, userTag) => {
        return message
            .replace(/@user/g, userTag)
            .replace(/@group/g, groupName)
            .replace(/@count/g, memberCount);
    };

    // ---------------------------------------------
    // --- Lógica de Bienvenida (GROUP_PARTICIPANT_ADD) ---
    // ---------------------------------------------
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD && isBotAdmin) {

        const mediaBuffer = await generateImageFromAPI('welcome', taguser, groupName, memberCount, ppUrl);

        const welcomeMessage = chatConfig.customWelcome || `
ʚ🍖ɞ *¡Yoshaaa! Bienvenido al barco, nakama!*
🏴‍☠️ ¡Yo soy *Monkey D. Luffy*, y seré el Rey de los Piratas!
📍 Has llegado a *@group*, un lugar para grandes aventuras. Ahora somos *@count* nakamas.
✨ Usa \`#menu\` para ver los comandos del bot.
*¡Prepárate para zarpar, que esto apenas comienza!* 👒
        `;

        const messageOptions = { 
            caption: formatMessage(welcomeMessage, taguser), 
            mentions: [who] 
        };

        if (mediaBuffer) {
            await conn.sendMessage(m.chat, { image: mediaBuffer, ...messageOptions });
        } else {
            await conn.sendMessage(m.chat, { text: messageOptions.caption, mentions: messageOptions.mentions });
            console.warn(`[WARNING] Fallo la generación de imagen para ${taguser} usando la API. Enviando solo texto.`);
        }
    }

    // ----------------------------------------------------------------------
    // --- Lógica de Despedida (GROUP_PARTICIPANT_LEAVE / GROUP_PARTICIPANT_REMOVE) ---
    // ----------------------------------------------------------------------
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {

        // Ignorar si el bot es quien se fue/fue removido
        if (who === conn.user.jid) return;

        // Si es REMOVE, el bot debe ser admin para enviar el mensaje. Si es LEAVE, no hace falta.
        // Simplificaremos y solo enviamos si el bot es admin, ya que el mensaje de la imagen requiere serlo.
        if (!isBotAdmin) return;

        const mediaBuffer = await generateImageFromAPI('goodbye', taguser, groupName, memberCount, ppUrl);

        const byeMessage = chatConfig.customBye || `
😢 *Ohh… otro nakama se fue del barco.*
✋ ¡Adiós, @user! Siempre serás parte de esta tripulación.
⚓ ¡Sigue navegando tu propia ruta, algún día nos reencontraremos en Grand Line!
- *Monkey D. Luffy* 👒
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

export default before;
