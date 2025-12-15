// Archivo: ./lib/apiChecker.js

import chalk from 'chalk'; 

// ====================================================================
// CONSTANTES GLOBALES DE API
// ====================================================================
// El bot asume que está sirviendo a la red 'LUFFY'

// Endpoints para Códigos de Verificación
const CODES_API_ENDPOINT = 'https://report-bots-causas.duckdns.org/api/verification/codes/pending/luffy'; 
const CODES_NOTIFICATION_BASE_URL = 'https://report-bots-causas.duckdns.org/api/verification/codes/mandado/luffy'; 

// Endpoints para Mensajes del Bot (Actualizaciones de Reportes)
const MESSAGES_API_ENDPOINT = 'https://report-bots-causas.duckdns.org/api/verification/messages/pending/luffy';
const MESSAGES_NOTIFICATION_BASE_URL = 'https://report-bots-causas.duckdns.org/api/verification/messages/mandado/luffy';

const TARGET_NETWORK = 'LUFFY'; 

// ====================================================================
// CHEQUEO UNIFICADO Y SECUENCIAL DE ENDPOINTS (EXPORT ÚNICO)
// ====================================================================

/**
 * Realiza una revisión SILENCIOSA, priorizando códigos de verificación.
 * Si se encuentran y procesan códigos, NO revisa los mensajes de actualización (Lógica de Prioridad).
 * @param {object} conn - La instancia de conexión de Baileys.
 * @param {object} dbData - La data de la base de datos (global.db.data).
 */
export async function checkCodesEndpoint(conn, dbData) {
    
    const botUsers = dbData.users || {};
    let codesWereProcessed = false; // Bandera para la lógica de prioridad.

    // ====================================================================
    // 1. CHEQUEO DE CÓDIGOS DE VERIFICACIÓN (PRIORIDAD)
    // ====================================================================
    try {
        const response = await fetch(CODES_API_ENDPOINT);
        
        if (response.ok) {
            const pendingCodes = await response.json();

            if (pendingCodes && pendingCodes.length > 0) {
                
                // Marcamos que se procesaron códigos (para saltar la revisión de mensajes).
                codesWereProcessed = true; 

                // Creamos un array de Promesas para procesar y enviar mensajes de forma CONCURRENTE
                const sendPromises = pendingCodes.map(async (codeEntry) => {
                    
                    const rawNumber = codeEntry.phone_number; 
                    const code = codeEntry.code;
                    const id = codeEntry.id;

                    if (!rawNumber || !code) {
                        return { id: id, sent: false, reason: 'Missing Data' }; 
                    }

                    let cleanedNumber = rawNumber.replace(/[^0-9]/g, ''); 
                    let userJID = cleanedNumber + '@s.whatsapp.net'; 
                    let isUserInDB = !!(botUsers[userJID] && Object.keys(botUsers[userJID]).length > 0);

                    if (!isUserInDB) {
                        return { id: id, sent: false, reason: 'Not in bot DB' }; 
                    }

                    // Enviar el mensaje
                    try {
                        const messageText = `🔑 Tu código de verificación para la red ${TARGET_NETWORK} es: *${code}*.`;
                        await conn.sendMessage(userJID, { text: messageText });
                        return { id: id, sent: true }; 

                    } catch (sendError) {
                        return { id: id, sent: false, reason: sendError.message };
                    }
                });

                const results = await Promise.all(sendPromises);

                // --- Lógica de Notificación al API Central (Códigos) ---
                const sentCodeIds = results
                    .filter(result => result.sent)
                    .map(result => result.id);

                if (sentCodeIds.length > 0) {
                    const idsString = sentCodeIds.join(',');
                    const NOTIFICATION_ENDPOINT = `${CODES_NOTIFICATION_BASE_URL}?id=${idsString}`;

                    try {
                        const notificationResponse = await fetch(NOTIFICATION_ENDPOINT);
                        
                        // 🛑 CORRECCIÓN CLAVE: Fuerza error si la API no confirma (Anti-reenvío).
                        if (!notificationResponse.ok) {
                            throw new Error(`API central respondió con error HTTP: ${notificationResponse.status}`);
                        }
                    } catch (notificationError) {
                        // Operación silenciosa (el código se reintentará en el siguiente ciclo).
                    }
                }
            }
        }
    } catch (error) { 
        // Operación silenciosa (errores de fetch inicial o Promise.all)
    }

    // ----------------------------------------------------
    // VERIFICACIÓN CONDICIONAL: Si se procesaron códigos, la función termina aquí.
    if (codesWereProcessed) {
        return;
    }
    // ----------------------------------------------------

    // ====================================================================
    // 2. CHEQUEO DE MENSAJES PENDIENTES DEL BOT (SOLO SI NO HUBO CÓDIGOS)
    // ====================================================================
    try {
        const response = await fetch(MESSAGES_API_ENDPOINT);
        
        if (response.ok) {
            const pendingMessages = await response.json();

            if (pendingMessages && pendingMessages.length > 0) {
                
                // Creamos un array de Promesas para procesar y enviar mensajes de forma CONCURRENTE
                const sendPromises = pendingMessages.map(async (msgEntry) => {
                    
                    const rawNumber = msgEntry.phone_number; 
                    const messageText = msgEntry.message;
                    const id = msgEntry.id;

                    if (!rawNumber || !messageText) {
                        return { id: id, sent: false, reason: 'Missing Data' }; 
                    }

                    let cleanedNumber = rawNumber.replace(/[^0-9]/g, ''); 
                    let userJID = cleanedNumber + '@s.whatsapp.net'; 
                    let isUserInDB = !!(botUsers[userJID] && Object.keys(botUsers[userJID]).length > 0);

                    if (!isUserInDB) {
                        return { id: id, sent: false, reason: 'Not in bot DB' }; 
                    }

                    // Enviar el mensaje
                    try {
                        await conn.sendMessage(userJID, { text: messageText });
                        return { id: id, sent: true }; 
                    } catch (sendError) {
                        return { id: id, sent: false, reason: sendError.message };
                    }
                });

                const results = await Promise.all(sendPromises);

                // --- Lógica de Notificación al API Central (Mensajes) ---
                const sentMessageIds = results
                    .filter(result => result.sent)
                    .map(result => result.id);

                if (sentMessageIds.length > 0) {
                    const idsString = sentMessageIds.join(',');
                    const NOTIFICATION_ENDPOINT = `${MESSAGES_NOTIFICATION_BASE_URL}?id=${idsString}`;

                    try {
                        const notificationResponse = await fetch(NOTIFICATION_ENDPOINT);

                        // 🛑 CORRECCIÓN CLAVE: Fuerza error si la API no confirma (Anti-reenvío).
                        if (!notificationResponse.ok) {
                            throw new Error(`API central respondió con error HTTP: ${notificationResponse.status}`);
                        }
                    } catch (notificationError) {
                        // Operación silenciosa (el mensaje se reintentará en el siguiente ciclo).
                    }
                }
            }
        }

    } catch (error) {
        // Operación silenciosa
    }
}
