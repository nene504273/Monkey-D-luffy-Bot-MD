// Este es un código hecho por nevi-dev para el bot Monkey D. Luffy de nene.
// ⚠️ Este código no puede ser modificado, copiado o usado sin el permiso explícito de su creador.

// Corregimos la importación de MessageMedia usando la convención moderna
import * as baileys from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import nodeHtmlToImage from 'node-html-to-image'; // Librería clave para renderizar HTML/CSS a imagen

const { WAMessageStubType } = baileys; 

// --- CONFIGURACIÓN DE IMÁGENES ---
const DEFAULT_AVATAR_URL = 'https://files.catbox.moe/xr2m6u.jpg'; 
const BACKGROUND_IMAGE_URL = 'https://files.catbox.moe/1rou90.jpg'; // ⬅️ REEMPLAZA ESTA URL CON TU PROPIO DISEÑO DE FONDO

// --- FUNCIONES CENTRALES ---

/**
 * Genera la imagen de bienvenida/despedida usando una plantilla HTML/CSS interna.
 * Devuelve el Buffer de la imagen.
 */
async function generateImageFromHTML(type, userName, groupName, memberCount, avatarUrl) {
    // Define el color y texto principal según el tipo de evento
    const color = type === 'welcome' ? '#FFD700' : '#8B0000'; // Dorado para bienvenida, Rojo para adiós
    const title = type === 'welcome' ? '¡BIENVENIDO NAKAMA!' : '¡ADIÓS AMIGO!';
    const messageLine = type === 'welcome' 
        ? `Se une al barco: ${groupName}` 
        : `Nos deja: ${groupName}`;

    // Plantilla HTML y CSS para el diseño (sin cambios en la plantilla)
    const htmlTemplate = `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
                .card {
                    width: 700px; 
                    height: 400px;
                    background: url('${BACKGROUND_IMAGE_URL}') no-repeat center center / cover; 
                    color: white;
                    position: relative;
                }
                .avatar-container {
                    position: absolute;
                    top: 150px;
                    left: 50px; 
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 6px solid ${color}; 
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
                }
                .avatar-img { width: 100%; height: 100%; object-fit: cover; }
                .text-area {
                    position: absolute;
                    top: 100px;
                    left: 250px;
                    width: 400px;
                    text-align: left;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); 
                }
                .title { font-size: 38px; font-weight: 900; color: ${color}; margin-bottom: 5px; }
                .name { font-size: 30px; font-weight: bold; margin-bottom: 5px; }
                .group { font-size: 22px; }
                .count { font-size: 20px; color: lightgray; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="avatar-container">
                    <img class="avatar-img" src="${avatarUrl}" />
                </div>
                <div class="text-area">
                    <div class="title">${title}</div>
                    <div class="name">${userName}</div>
                    <div class="group">${messageLine}</div>
                    <div class="count">${type === 'welcome' ? `¡Ahora somos ${memberCount} nakamas!` : `Nos quedan ${memberCount} nakamas.`}</div>
                </div>
            </div>
        </body>
        </html>
    `;

    // Generar la imagen (devuelve un Buffer)
    try {
        const imageBuffer = await nodeHtmlToImage({
            html: htmlTemplate,
            puppeteerArgs: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
            encoding: 'binary', 
            type: 'png' 
        });

        // Devolvemos el Buffer de la imagen
        return imageBuffer; 

    } catch (e) {
        console.error('Error al generar la imagen con node-html-to-image:', e);
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

        const mediaBuffer = await generateImageFromHTML('welcome', taguser, groupName, memberCount, ppUrl);

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
            console.warn(`[WARNING] Fallo la generación de imagen para ${taguser}. Enviando solo texto.`);
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
        
        const mediaBuffer = await generateImageFromHTML('goodbye', taguser, groupName, memberCount, ppUrl);

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
            console.warn(`[WARNING] Fallo la generación de imagen para ${taguser}. Enviando solo texto.`);
        }
    }
}

export default before;
