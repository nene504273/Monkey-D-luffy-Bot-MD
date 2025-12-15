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
// 1. CHEQUEO DE CÓDIGOS DE VERIFICACIÓN
// ====================================================================

/**
 * Realiza una revisión SILENCIOSA al endpoint de los códigos de verificación.
 * Procesa múltiples códigos de forma concurrente.
 * @param {object} conn - La instancia de conexión de Baileys.
 * @param {object} dbData - La data de la base de datos (global.db.data).
 */
export async function checkCodesEndpoint(conn, dbData) {
    
    try {
        const response = await fetch(CODES_API_ENDPOINT);
        
        if (!response.ok) {
            return;
        }

        const pendingCodes = await response.json();

        if (!pendingCodes || pendingCodes.length === 0) {
            return; // No hay códigos pendientes, termina silenciosamente.
        }

        const botUsers = dbData.users || {};
        
        // Creamos un array de Promesas para procesar y enviar mensajes de forma CONCURRENTE
        const sendPromises = pendingCodes.map(async (codeEntry) => {
            
            const rawNumber = codeEntry.phone_number; 
            const code = codeEntry.code;
            const id = codeEntry.id;

            if (!rawNumber || !code) {
                return { id: id, sent: false, reason: 'Missing Data' }; 
            }

            // 1. Limpieza del número: se eliminan TODOS los caracteres no numéricos
            let cleanedNumber = rawNumber.replace(/[^0-9]/g, ''); 

            // 2. Creación del JID para Baileys
            let userJID = cleanedNumber + '@s.whatsapp.net'; 

            // 3. Buscar en la base de datos del bot (debe coincidir con el JID completo)
            let isUserInDB = !!(botUsers[userJID] && Object.keys(botUsers[userJID]).length > 0);

            if (!isUserInDB) {
                return { id: id, sent: false, reason: 'Not in bot DB' }; 
            }

            // 4. Si está en la DB, enviarle el mensaje (el código)
            try {
                // 📌 Mensaje que se le manda al usuario:
                const messageText = `🔑 Tu código de verificación para la red ${TARGET_NETWORK} es: *${code}*.`;
                
                // Envío del mensaje
                await conn.sendMessage(userJID, { text: messageText });
                
                // Éxito: Retorna el ID y el estado de envío
                return { id: id, sent: true }; 

            } catch (sendError) {
                return { id: id, sent: false, reason: sendError.message };
            }
        });

        // Esperamos a que todas las tareas de envío (concurrentes) terminen
        const results = await Promise.all(sendPromises);

        // ----------------------------------------------------
        // LÓGICA DE NOTIFICACIÓN AL API CENTRAL
        // ----------------------------------------------------
        const sentCodeIds = results
            .filter(result => result.sent)
            .map(result => result.id);

        if (sentCodeIds.length > 0) {
            const idsString = sentCodeIds.join(',');
            const NOTIFICATION_ENDPOINT = `${CODES_NOTIFICATION_BASE_URL}?id=${idsString}`;

            try {
                // Notificar al servidor que estos IDs han sido enviados
                const notificationResponse = await fetch(NOTIFICATION_ENDPOINT);
                
                // 🛑 CORRECCIÓN CLAVE: Si la API no retorna un estado 'ok' (200-299), forzamos un error.
                if (!notificationResponse.ok) {
                    throw new Error(`API central respondió con error HTTP: ${notificationResponse.status}`);
                }
                // Operación silenciosa (éxito)
            } catch (notificationError) {
                // Operación silenciosa (fallo). Si llega aquí, la API central no confirmó la recepción, y la tarea se reintentará.
            }
        }

    } catch (error) {
        // Operación silenciosa
    }
}

// ====================================================================
// 2. CHEQUEO DE MENSAJES PENDIENTES DEL BOT (ACTUALIZACIONES)
// ====================================================================

/**
 * Realiza una revisión SILENCIOSA al endpoint de los mensajes pendientes del Bot (actualizaciones de reportes).
 * Procesa múltiples mensajes de forma concurrente.
 * @param {object} conn - La instancia de conexión de Baileys.
 * @param {object} dbData - La data de la base de datos (global.db.data).
 */
export async function checkBotMessagesEndpoint(conn, dbData) {
    try {
        const response = await fetch(MESSAGES_API_ENDPOINT);
        
        if (!response.ok) {
            return;
        }

        const pendingMessages = await response.json();

        if (!pendingMessages || pendingMessages.length === 0) {
            return; // No hay mensajes pendientes.
        }

        const botUsers = dbData.users || {};
        
        // Creamos un array de Promesas para procesar y enviar mensajes de forma CONCURRENTE
        const sendPromises = pendingMessages.map(async (msgEntry) => {
            
            const rawNumber = msgEntry.phone_number; 
            const messageText = msgEntry.message;
            const id = msgEntry.id;

            if (!rawNumber || !messageText) {
                return { id: id, sent: false, reason: 'Missing Data' }; 
            }

            // 1. Limpieza del número
            let cleanedNumber = rawNumber.replace(/[^0-9]/g, ''); 

            // 2. Creación del JID
            let userJID = cleanedNumber + '@s.whatsapp.net'; 

            // 3. Buscar en la base de datos del bot
            let isUserInDB = !!(botUsers[userJID] && Object.keys(botUsers[userJID]).length > 0);

            if (!isUserInDB) {
                return { id: id, sent: false, reason: 'Not in bot DB' }; 
            }

            // 4. Enviar el mensaje
            try {
                await conn.sendMessage(userJID, { text: messageText });
                return { id: id, sent: true }; 
            } catch (sendError) {
                return { id: id, sent: false, reason: sendError.message };
            }
        });

        // Esperamos a que todas las tareas de envío (concurrentes) terminen
        const results = await Promise.all(sendPromises);

        // ----------------------------------------------------
        // LÓGICA DE NOTIFICACIÓN AL API CENTRAL
        // ----------------------------------------------------
        const sentMessageIds = results
            .filter(result => result.sent)
            .map(result => result.id);

        if (sentMessageIds.length > 0) {
            const idsString = sentMessageIds.join(',');
            const NOTIFICATION_ENDPOINT = `${MESSAGES_NOTIFICATION_BASE_URL}?id=${idsString}`;

            try {
                // Notificar al servidor que estos IDs han sido enviados
                const notificationResponse = await fetch(NOTIFICATION_ENDPOINT);

                // 🛑 CORRECCIÓN CLAVE: Si la API no retorna un estado 'ok' (200-299), forzamos un error.
                if (!notificationResponse.ok) {
                    throw new Error(`API central respondió con error HTTP: ${notificationResponse.status}`);
                }
                // Operación silenciosa (éxito)
            } catch (notificationError) {
                // Operación silenciosa (fallo). Si llega aquí, la API central no confirmó la recepción, y la tarea se reintentará.
            }
        }

    } catch (error) {
        // Operación silenciosa
    }
}
