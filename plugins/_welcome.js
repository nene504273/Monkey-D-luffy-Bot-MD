// Este es un código hecho por nevi-dev para el bot Monkey D. Luffy de nene.
// ⚠️ Este código no puede ser modificado, copiado o usado sin el permiso explícito de su creador.

// Corregimos la importación de MessageMedia usando la convención moderna
import * as baileys from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import nodeHtmlToImage from 'node-html-to-image'; // Librería clave para renderizar HTML/CSS a imagen

const { WAMessageStubType } = baileys; // Ahora accedemos a WAMessageStubType desde el objeto 'baileys'

// --- CONFIGURACIÓN DE IMÁGENES ---
const DEFAULT_AVATAR_URL = 'https://files.catbox.moe/xr2m6u.jpg'; 
const BACKGROUND_IMAGE_URL = 'https://files.catbox.moe/1rou90.jpg'; // ⬅️ REEMPLAZA ESTA URL CON TU PROPIO DISEÑO DE FONDO

// --- FUNCIONES CENTRALES ---

/**
 * Genera la imagen de bienvenida/despedida usando una plantilla HTML/CSS interna.
 * * ⚠️ IMPORTANTE: Esta función ha sido modificada para DEVOLVER el Buffer de la imagen.
 * No devuelve MessageMedia, ya que conn.sendMessage acepta el Buffer directamente.
 */
async function generateImageFromHTML(type, userName, groupName, memberCount, avatarUrl) {
    // Definimos el color y texto principal según el tipo de evento
    // Esta parte asegura que la imagen de despedida se vea diferente (rojo)
    const color = type === 'welcome' ? '#FFD700' : '#8B0000'; // Dorado para bienvenida, Rojo para adiós
    const title = type === 'welcome' ? '¡BIENVENIDO NAKAMA!' : '¡ADIÓS AMIGO!';
    const messageLine = type === 'welcome' 
        ? `Se une al barco: ${groupName}` 
        : `Nos deja: ${groupName}`;

    // 1. Plantilla HTML y CSS para el diseño
    const htmlTemplate = `
        <html>
        <head>
            <style>
                body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
                .card {
                    width: 700px; 
                    height: 400px;
                    /* Usar la URL de tu imagen de fondo */
                    background: url('${BACKGROUND_IMAGE_URL}') no-repeat center center / cover; 
                    color: white;
                    position: relative;
                }
                .avatar-container {
                    position: absolute;
                    top: 150px;
                    left: 50px; /* Posiciona el avatar a la izquierda */
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
                    /* Contorno de texto para mejorar la visibilidad */
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

    // 2. Generar la imagen (devuelve un Buffer)
    try {
        const imageBuffer = await nodeHtmlToImage({
            html: htmlTemplate,
            puppeteerArgs: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
            encoding: 'binary', // Para que devuelva un Buffer
            type: 'png' // Aseguramos el formato
        });

        // 3. Devolver el Buffer de la imagen (¡CORREGIDO!)
        // En lugar de devolver MessageMedia, devolvemos el Buffer directamente
        return imageBuffer; 

    } catch (e) {
        console.error('Error al generar la imagen con node-html-to-image:', e);
        return null;
    }
}


/**
 * Esta función maneja los eventos de unión y salida de un grupo.
 * Se activa si la función 'welcome' está habilitada en la base de datos.
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
    // Usamos el ppUrl para pasarlo al generador de HTML
    const ppUrl = await conn.profilePictureUrl(who, 'image').catch(() => DEFAULT_AVATAR_URL); 

    // Reemplazar los placeholders en el mensaje (solo para el caption de texto)
    const formatMessage = (message, userTag) => {
        return message
            .replace(/@user/g, userTag)
            .replace(/@group/g, groupName)
            .replace(/@count/g, memberCount);
    };

    // --- Evento de 'adición' (unirse al grupo) ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD && chatConfig.welcome) {

        // 1. Generar la imagen usando la plantilla HTML/CSS para BIENVENIDA
        const mediaBuffer = await generateImageFromHTML('welcome', taguser, groupName, memberCount, ppUrl);

        const welcomeMessage = chatConfig.customWelcome || `
ʚ🍖ɞ *¡Yoshaaa! Bienvenido al barco, nakama!*
🏴‍☠️ ¡Yo soy *Monkey D. Luffy*, y seré el Rey de los Piratas!
📍 Has llegado a *@group*, un lugar para grandes aventuras. Ahora somos *@count* nakamas.
✨ Usa \`#menu\` para ver los comandos del bot.
*¡Prepárate para zarpar, que esto apenas comienza!* 👒
        `;

        if (mediaBuffer) {
            // Enviar la imagen generada dinámicamente (CORREGIDO: usamos mediaBuffer)
            await conn.sendMessage(m.chat, { 
                image: mediaBuffer, 
                caption: formatMessage(welcomeMessage, taguser), 
                mentions: [who] 
            });
        } else {
            // Respaldo en caso de que falle la generación de la imagen
            await conn.sendMessage(m.chat, { 
                text: `${formatMessage(welcomeMessage, taguser)}`, 
                mentions: [who] 
            });
            console.warn(`[WARNING] Fallo la generación de imagen para ${taguser}. Enviando solo texto.`);
        }
    }

    // --- Evento de 'salida' (el usuario se fue o fue removido) ---
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE && chatConfig.welcome) {
        if (who === conn.user.jid) return;

        // 1. Generar la imagen usando la plantilla HTML/CSS para DESPEDIDA
        const mediaBuffer = await generateImageFromHTML('goodbye', taguser, groupName, memberCount, ppUrl);

        const byeMessage = chatConfig.customBye || `
😢 *Ohh… otro nakama se fue del barco.*
✋ ¡Adiós, @user! Siempre serás parte de esta tripulación.
⚓ ¡Sigue navegando tu propia ruta, algún día nos reencontraremos en Grand Line!
- *Monkey D. Luffy* 👒
        `;

        if (mediaBuffer) {
            // Enviar la imagen generada dinámicamente (CORREGIDO: usamos mediaBuffer)
            await conn.sendMessage(m.chat, { 
                image: mediaBuffer, 
                caption: formatMessage(byeMessage, taguser), 
                mentions: [who] 
            });
        } else {
            // Respaldo en caso de que falle la generación de la imagen
            await conn.sendMessage(m.chat, { 
                text: `${formatMessage(byeMessage, taguser)}`, 
                mentions: [who] 
            });
            console.warn(`[WARNING] Fallo la generación de imagen para ${taguser}. Enviando solo texto.`);
        }
    }
}

export default before;
