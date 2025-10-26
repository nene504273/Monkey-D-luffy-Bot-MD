// handler.js (divisas/market)

import fetch from 'node-fetch';

// --- CONFIGURACIÓN DE CYPHERTRANS ---
const API_URL = 'https://cyphertrans.duckdns.org'; 

// --- CONSTANTES DE MENSAJE (AJUSTADAS PARA LUFFY) ---
const DENIQUES_CODE = 'LUFC';  // Código de la moneda base: LUFFY Currency (Asumiendo LUFC)
const DENIQUES_NAME = 'Berries'; // Nombre de la moneda base
const emoji = '📊'; 
const emoji2 = '❌';

// --- FUNCIÓN PRINCIPAL DEL HANDLER (REFACTORIZADA PARA ENFOQUE EN LUFFY) ---
async function handler(m, { conn, usedPrefix, command }) {
    // Envía un mensaje de espera (Placeholder)
    const initialMessage = await conn.sendMessage(m.chat, {text: `⏳ *Consultando Mercado de Divisas CypherTrans...*`}, {quoted: m});
    
    try {
        // 1. Llamar a la API para obtener los datos del mercado (Fuente para el cálculo)
        const response = await fetch(`${API_URL}/api/v1/currency_market`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000 
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error || `Error ${response.status} en la API.`;
            return conn.sendMessage(m.chat, { text: `${emoji2} Falló la consulta del mercado. *Razón:* ${errorMsg}` }, { edit: initialMessage.key });
        }

        // 2. Procesar los datos y construir el mensaje
        let message = `${emoji} *— Tasa de Cambio Base LUFFY —*\n\n`;
        
        // Mensaje de cabecera ajustado para el nuevo enfoque
        message += `Mostrando el precio de *1 ${DENIQUES_NAME} (${DENIQUES_CODE})* en otras divisas.\n`;
        message += `_Esta tasa es calculada por el motor CypherTrans en tiempo real._\n\n`;
        
        let counter = 0;
        for (const key in data) {
            const currency = data[key];
            const code = currency.code;
            const value = currency.value; // Tasa de Referencia: 1 [Moneda] = X LUFC
            const usage = currency.usage;
            counter++;
            
            let luffyRate; // 1 LUFFY = X [Otra Moneda]
            
            if (code === DENIQUES_CODE) {
                // Si la moneda actual es LUFFY, 1 LUFFY = 1 LUFFY
                luffyRate = 1.0;
            } else {
                // CALCULO (Inversión de la tasa): 1 LUFFY = 1 / (1 [Moneda] a LUFC)
                luffyRate = (1 / value);
            }

            const separator = (counter > 1) ? `\n———————————————————` : ``;

            message += `${separator}\n`;
            message += `🏦 *Divisa:* ${key.toUpperCase()} (${code})\n`;
            
            // Precio de 1 LUFFY
            message += `💵 *Precio (1 ${DENIQUES_CODE}):* *${luffyRate.toFixed(4)}* ${code}\n`;
            
            // Tasa de referencia del servidor (1 [Moneda] = X LUFC)
            message += `ℹ️ *Referencia:* 1 ${code} = *${value.toFixed(4)}* ${DENIQUES_CODE}\n`; 
            message += `📊 *Volumen:* ${usage} Transacciones\n`;
        }
        
        message += `\n*Nota:* El volumen alto aumenta la volatilidad del precio.`;


        // 3. Editar el mensaje inicial con la respuesta final
        return conn.sendMessage(m.chat, { text: message }, { edit: initialMessage.key });

    } catch (error) {
        console.error("Error de conexión al consultar divisas CypherTrans:", error);
        
        let errorMessage = `${emoji2} *Error de Conexión/Tiempo de Espera*`;
        
        // Manejo de errores de conexión
        if (error.code === 'ERR_REQUEST_TIMEOUT' || error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
            errorMessage += `\n\nEl servidor de CypherTrans (*${API_URL}*) tardó demasiado en responder o está inactivo. Intenta más tarde.`;
        } else {
            errorMessage += `\n\nNo se pudo establecer la comunicación con el servidor. *Detalles:* ${error.message}`;
        }
        
        // Edita el mensaje de espera con el error de conexión
        return conn.sendMessage(m.chat, { text: errorMessage }, { edit: initialMessage.key });
    }
}


handler.help = ['divisas', 'market', 'currency'];
handler.tags = ['rpg'];
handler.command = ['divisas', 'market', 'currency'];
handler.group = true;
handler.register = true;

export default handler;
