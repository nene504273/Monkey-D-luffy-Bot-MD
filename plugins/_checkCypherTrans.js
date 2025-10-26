// Asegúrate de que estas dependencias estén disponibles.
import fetch from 'node-fetch'; 
import fs from 'fs/promises'; 
import path from 'path'; 
// Si quieres enviar imagen, necesitarás Buffer
import { Buffer } from 'buffer';

// --- CONFIGURACIÓN DE CYPHERTRANS ---
const HASH_FILE_PATH = path.join(process.cwd(), 'src', 'hash.json'); 
const API_URL = 'https://cyphertrans.duckdns.org'; 

// Las variables globales 'global.db.data.users' y 'moneda' son necesarias para esta función.
// Usamos global.moneda como el código de moneda local (e.g., MARC)
const moneda = global.moneda || 'ELLC'; 
const emoji = '✅';
const emoji2 = '❌';

/**
 * Extrae el número de teléfono del número de cuenta CypherTrans.
 */
function extractUserNumber(recipientAccount) {
    // Asume que el número es todo menos los últimos 7 caracteres (MARC1234)
    return recipientAccount.slice(0, -7); 
}

/**
 * Obtiene el hash del bot desde el archivo local.
 */
async function getBotHashFromFile() {
    try {
        const data = await fs.readFile(HASH_FILE_PATH, 'utf-8');
        const hashData = JSON.parse(data);
        if (hashData && hashData.bot_hash) {
            return hashData.bot_hash;
        }
        return null;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(`[CypherTrans] Advertencia: Archivo de hash no encontrado en ${HASH_FILE_PATH}.`);
        } else {
            console.error(`[CypherTrans] Error leyendo hash.json:`, error.message);
        }
        return null;
    }
}

// --- FUNCIÓN PRINCIPAL DE CHEQUEO DE TRANSACCIONES ---

export async function checkCypherTransInbound(sock) {
    if (!sock) return console.error('[CypherTrans] Error: Objeto de conexión (sock) no proporcionado.');
    
    const BOT_HASH = await getBotHashFromFile();
    if (!BOT_HASH) return console.log('[CypherTrans] Solicitud omitida: Bot no registrado.');
    
    try {
        const response = await fetch(`${API_URL}/api/v1/inbound_history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_hash: BOT_HASH })
        });

        if (!response.ok) return console.error(`[CypherTrans] Error en la API: ${response.status} ${response.statusText}`);

        const newTransactions = await response.json();
        if (newTransactions.length === 0) return;

        console.log(`[CypherTrans] ${newTransactions.length} nuevas transacciones entrantes encontradas.`);

        for (const tx of newTransactions) {
            
            // 1. Determinar el JID de destino para el depósito y mensaje
            const userNumber = extractUserNumber(tx.recipient);
            const standardJID = `${userNumber}@s.whatsapp.net`;
            const lidJID = `${userNumber}@lid`; 
            
            let targetJID = null;
            
            // Prioridad 1: Buscar por @lid (usado en tu DB)
            if (global.db.data.users[lidJID]) {
                targetJID = lidJID;
            } 
            // Prioridad 2: Buscar por JID estándar
            else if (global.db.data.users[standardJID]) {
                targetJID = standardJID;
            }
            
            // 2. Procesar si se encontró un usuario en la DB
            if (targetJID) {
                // El monto a depositar es el 'received_amount' de la API
                const depositAmount = tx.received_amount || tx.amount; 
                const receiptUrl = `${API_URL}/receipt/${tx.tx_id}`;
                const contactId = userNumber; 
                
                // --- LÓGICA DE DEPÓSITO AL BANCO ---
                if (typeof global.db.data.users[targetJID].bank !== 'number') {
                    global.db.data.users[targetJID].bank = 0;
                }
                global.db.data.users[targetJID].bank += depositAmount * 1; 
                const newBankBalance = global.db.data.users[targetJID].bank;
                console.log(`[CypherTrans] ${depositAmount} depositado en el banco de ${targetJID}.`);
                // ------------------------------------
                
                // 3. Preparar el mensaje (con o sin imagen)
                const isCrossCurrency = tx.sent_currency !== tx.received_currency;
                
                // Base del mensaje (Estética mejorada)
                let baseCaption = `${emoji} *— ¡DEPÓSITO MULTIBOT APROBADO! —*` +
                    `\n\n*Desde:* ${tx.sender}` +
                    `\n*ID Transacción:* \`${tx.tx_id}\``;
                
                // Detalles del envío (Origen)
                baseCaption += `\n\n*Monto Enviado:* ${tx.amount} ${tx.sent_currency}`;
                if (tx.fee > 0) {
                    baseCaption += `\n*Comisión Aplicada:* -${tx.fee} ${tx.sent_currency}`;
                }

                // Detalles de la Conversión (si aplica)
                if (isCrossCurrency) {
                     baseCaption += `\n*Tasa de Cambio:* 1 ${tx.sent_currency} = ${tx.exchange_rate} ${tx.received_currency}`;
                }
                
                // Monto Final Recibido (Destino)
                baseCaption += `\n\n*Monto Depositado:* *${depositAmount} ${tx.received_currency}*`;
                
                // Balance Final
                baseCaption += `\n\n*Tu Nuevo Saldo en el Banco:* ${newBankBalance} ${moneda}`;
                
                // Footer
                baseCaption += `\n\n_El dinero ha sido depositado directamente en tu cuenta de banco._`;


                let messageOptions;
               
                // *** SECCIÓN CORREGIDA ***
                // La API envía la imagen en 'image_base64' y el tipo es 'image/png'.
                const imageBase64Data = tx.image_base64;
               
                // VERIFICACIÓN CLAVE: Si hay base64 y no es vacío, intentamos enviar la imagen
                if (imageBase64Data && imageBase64Data.length > 100) { 
                    // Convertir el Base64 de la imagen a un Buffer
                    const media = Buffer.from(imageBase64Data, 'base64');
                    messageOptions = {
                        image: media, 
                        caption: baseCaption,
                        // CORREGIDO: Usamos image/png
                        mimetype: 'image/png',
                        mentions: [standardJID]
                    };
                } else {
                    // Si NO hay recibo Base64, enviamos solo texto, incluyendo el enlace HTML
                    const textMessage = baseCaption +
                        `\n\nComprobante (HTML): ${receiptUrl}`;
                    
                    messageOptions = {
                        text: textMessage,
                        mentions: [standardJID]
                    };
                }
                
                // 4. Enviar el mensaje (Imagen o Texto)
                try {
                    await sock.sendMessage(targetJID, messageOptions);
                    console.log(`[CypherTrans] Notificación de depósito (con/sin recibo) enviada a ${targetJID}.`);
                } catch (e) {
                    console.error(`[CypherTrans] ERROR: Falló el envío del mensaje/recibo a ${targetJID}.`, e.message);
                }
                
            } else {
                console.log(`[CypherTrans] ERROR: Usuario ${userNumber} (ni @lid ni @s.whatsapp.net) no encontrado en la DB local.`);
            }
        }
    } catch (error) {
        console.error("Error al verificar CypherTrans:", error.message);
    }
}
