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
    // Obtener la fecha de creación y descripción del grupo
    const groupCreation = groupMetadata?.creation ? new Date(groupMetadata.creation * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Desconocida';
    const groupDesc = groupMetadata?.desc || 'Sin descripción.';

    // Salir si la función de bienvenida no está habilitada.
    if (!chatConfig.welcome) return;

    // Obtener los datos del usuario afectado
    let who = stubParams[0]; // Extraer el JID del primer parámetro
    let taguser = `@${who.split('@')[0]}`;
    const ppUrl = await conn.profilePictureUrl(who, 'image').catch(() => DEFAULT_AVATAR_URL); 

    // Función auxiliar para formatear el mensaje de texto
    // Usaremos esta función para reemplazar las variables.
    const formatMessage = (message, userTag) => {
        return message
            .replace(/\${username}/g, userTag) // Reemplaza ${username} por @user
            .replace(/\${groupMetadata.subject}/g, groupName) // Reemplaza ${groupMetadata.subject} por @group
            .replace(/\${groupSize}/g, memberCount) // Reemplaza ${groupSize} por @count
            .replace(/\${fechaCreacion}/g, groupCreation) // Reemplaza ${fechaCreacion}
            .replace(/\${desc}/g, groupDesc) // Reemplaza ${desc}
            .replace(/\${mensaje}/g, ''); // Deja el mensaje central vacío si no se proporciona
    };

    // ---------------------------------------------
    // --- Lógica de Bienvenida (GROUP_PARTICIPANT_ADD / INVITE) ---
    // ---------------------------------------------
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_INVITE) {

        const mediaBuffer = await generateImageFromAPI('welcome', taguser, groupName, memberCount, ppUrl);

        // *** TEXTO DE BIENVENIDA ESTILO LUFFY (SIN FLORES, CON BANDERA) ***
        const welcomeTemplate = `
╭───·˚ 🏴‍☠️ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐍𝐀𝐊𝐀𝐌𝐀 👒 ·˚───╮

  𐔌՞. .՞𐦯 ¡YOSHA! ¡Hola, \${username}  
  Te damos la bienvenida al barco: *\${groupMetadata.subject}*
  *¡Prepárate para zarpar!* ⚓

\${mensaje}

╰──·˚ 🍖 ¡A la aventura! 🏴‍☠️ ˚·──╯`;
        
        // *** INFORMACIÓN DEL GRUPO (MENSAJE ADICIONAL) ***
        const groupInfoTemplate = `
📋 *INFORMACIÓN DEL GRUPO:*
├─ 🗓️ Creado: \${fechaCreacion}
├─ 👥 Miembros: \${groupSize} navegantes
├─ 📝 Descripción:
\${desc}`;

        // Formatear ambos mensajes
        const formattedWelcome = formatMessage(chatConfig.customWelcome || welcomeTemplate, taguser);
        const formattedGroupInfo = formatMessage(groupInfoTemplate, taguser);
        
        const fullMessage = formattedWelcome + "\n\n" + formattedGroupInfo;

        const messageOptions = { 
            caption: fullMessage, 
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

        const mediaBuffer = await generateImageFromAPI('goodbye', taguser, groupName, memberCount, ppUrl);

        // *** TEXTO DE DESPEDIDA ESTILO LUFFY (SIN FLORES, CON BANDERA) ***
        const byeTemplate = `
╭───·˚ 🚢 𝐆𝐎𝐎𝐃 𝐁𝐘𝐄 𝐍𝐀𝐊𝐀𝐌𝐀 😭 ·˚───╮

  𐔌՞. .՞𐦯 – ¡Adiós, \${username}!
  Abandonó el barco: *\${groupMetadata.subject}*
  *¡Te deseamos éxito en tu viaje!* 🗺️

\${mensaje}

╰───·˚ 🏴‍☠️ ¡Hasta pronto! ⚓ ˚·───╯`;

        const formattedBye = formatMessage(chatConfig.customBye || byeTemplate, taguser);

        const messageOptions = { 
            caption: formattedBye, 
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