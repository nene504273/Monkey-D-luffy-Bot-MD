import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import NodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from 'pino';
import chalk from 'chalk';
import * as ws from 'ws';
import { makeWASocket } from '../lib/simple.js'; // Asumiendo que usas simple.js para extender Baileys
import { fileURLToPath } from 'url';

// === CONFIGURACIÓN DE ESTILO Y TEXTOS ===
const EMOJI_LUFFY = '🏴‍☠️';
const NOMBRE_BOT = 'Monkey D Luffy 👒';
const COOLDOWN_TIME = 120000; // 2 minutos
const LIMIT_SESSIONS = 30; // Límite máximo de Sub-Bots

// Textos base para el Sub-Bot (Más limpio)
const TEXT_INIT = `*${EMOJI_LUFFY} ¡HOLA, NAKAMA! ${EMOJI_LUFFY}*\n\n`;

const TEXT_QR_GUIDE = `*—• MODO: CÓDIGO QR •—*\n\n` +
                      `*⚙️ PASOS DE VINCULACIÓN:*\n` +
                      `\n1. En tu otro dispositivo, toca en *Dispositivos Vinculados*.\n` +
                      `2. Selecciona *Vincular un dispositivo*.\n` +
                      `3. Escanea el Código QR a continuación.\n`;
             
const TEXT_CODE_GUIDE = `*—• MODO: CÓDIGO DE 8 DÍGITOS •—*\n\n` +
                        `*⚙️ PASOS DE VINCULACIÓN:*\n` +
                        `\n1. Ve a la esquina superior derecha (Menú).\n` +
                        `2. Toca en *Dispositivos Vinculados*.\n` +
                        `3. Selecciona *Vincular con el número de teléfono*.\n` +
                        `4. Pega el código de 8 dígitos que te enviaré.\n`;

const TEXT_FOOTER = `\n⭐ *NOTA:* Este proceso expira rápido. ¡Rápido, Nakama!`;

// Combina los textos para las respuestas finales
const RTX_QR_FINAL = TEXT_INIT + TEXT_QR_GUIDE + TEXT_FOOTER;
const RTX_CODE_FINAL = TEXT_INIT + TEXT_CODE_GUIDE + TEXT_FOOTER;

// Ruta base para las sesiones
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSIONS_DIR = path.join(__dirname, '..', 'jadibots'); // Carpeta 'jadibots'

if (global.conns instanceof Array) console.log()
else global.conns = []; // Array global para almacenar las conexiones activas

// =====================================================================

let handler = async (m, { conn, args, usedPrefix, command }) => {
    
    // 1. COOLDOWN
    let time = global.db.data.users[m.sender].lastJadibot + COOLDOWN_TIME;
    if (new Date - global.db.data.users[m.sender].lastJadibot < COOLDOWN_TIME) {
        return conn.reply(m.chat, `🕐 ¡Alto ahí, Nakama! Debes esperar ${msToTime(time - new Date())} para intentar vincular un *Sub-Bot* de nuevo.`, m);
    }
    
    // 2. LÍMITE DE SESIONES
    const subBotsCount = global.conns.filter((c) => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED).length;
    if (subBotsCount >= LIMIT_SESSIONS) {
        return conn.reply(m.chat, `💔 ¡Lo siento! La capacidad máxima de *Sub-Bots* (${LIMIT_SESSIONS}) ha sido alcanzada. Intenta más tarde.`, m);
    }

    const mode = args[0]?.toLowerCase();

    // 3. MOSTRAR BOTONES SI NO HAY MODO ESPECIFICADO
    if (mode !== 'qr' && mode !== 'code') {
        let buttonMessage = {
            text: `${TEXT_INIT}Selecciona el método para vincular tu dispositivo a la tripulación de *${NOMBRE_BOT}* como Sub-Bot.`,
            footer: 'Elige tu camino para convertirte en Nakama.',
            buttons: [
                { buttonId: `${usedPrefix + command} qr`, buttonText: { displayText: '📸 CÓDIGO QR' }, type: 1 },
                { buttonId: `${usedPrefix + command} code`, buttonText: { displayText: '🔑 CÓDIGO DE 8 DÍGITOS' }, type: 1 }
            ],
            headerType: 1
        }
        return conn.sendMessage(m.chat, buttonMessage, { quoted: m });
    }

    // 4. PREPARAR SESIÓN
    const who = m.sender;
    const id = who.split('@')[0];
    const pathSession = path.join(SESSIONS_DIR, id);
    
    if (!fs.existsSync(pathSession)){
        fs.mkdirSync(pathSession, { recursive: true });
    }

    // 5. INICIAR CONEXIÓN
    await startJadibot({
        pathSession,
        m,
        conn,
        mode,
        isBase64Creds: args[1], // Para vincular con credenciales base64
        usedPrefix,
        command
    });

    global.db.data.users[m.sender].lastJadibot = new Date() * 1;
}

handler.help = ['qr', 'code', 'serbot'];
handler.tags = ['serbot'];
handler.command = ['qr', 'code', 'serbot'];
export default handler;

// =====================================================================

async function startJadibot(options) {
    let { pathSession, m, conn, mode, isBase64Creds, usedPrefix, command } = options;
    let txtQR, codeBot, txtCode;

    const pathCreds = path.join(pathSession, "creds.json");
    
    // Intentar escribir credenciales Base64 si se proporciona
    if (isBase64Creds) {
        try {
            fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(isBase64Creds, "base64").toString("utf-8")), null, '\t'));
        } catch {
            conn.reply(m.chat, `❌ Formato de credenciales Base64 inválido.`, m);
            return;
        }
    }
    
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const msgRetryCache = new NodeCache();
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathSession);

    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
        msgRetryCache,
        browser: [NOMBRE_BOT, 'Chrome','2.0.0'], // Navegador personalizado
        version: version,
        generateHighQualityLinkPreview: true,
    };

    let sock = makeWASocket(connectionOptions);
    sock.isInit = false;
    let isInit = true;
    
    sock.options = options; 

    // Función de actualización de conexión (Manejo de estados, QR, CODE)
    async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update;
        if (isNewLogin) sock.isInit = false;

        // --- MANEJO DE QR Y CODE ---
        if (qr && mode === 'qr') {
            // El QR se puede enviar al grupo o privado, no es sensible.
            txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: RTX_QR_FINAL.trim()}, { quoted: m});
            setTimeout(() => { 
                try { conn.sendMessage(m.sender, { delete: txtQR.key }) } catch {} 
            }, 45000); // 45 segundos para el QR
        }
        
        if (qr && mode === 'code') {
            let secret = await sock.requestPairingCode(m.sender.split`@`[0]);
            secret = secret.match(/.{1,4}/g)?.join("-");
            
            // --- LÓGICA DE GRUPO/PRIVADO ---
            // Si es un grupo, notificamos que el código se enviará al privado.
            if (m.chat.endsWith('@g.us')) {
                 await conn.reply(m.chat, `*${EMOJI_LUFFY} ¡SOLICITUD RECIBIDA, NAKAMA!* Te he enviado las instrucciones y el *CÓDIGO DE 8 DÍGITOS* a tu chat privado. ¡Revisa tu DM!`, m);
            }
            
            // FORZAR ENVÍO DE LA GUÍA Y EL CÓDIGO AL CHAT PRIVADO DEL USUARIO (m.sender)
            txtCode = await conn.sendMessage(m.sender, {text : RTX_CODE_FINAL.trim()});
            codeBot = await conn.sendMessage(m.sender, {text: `*🔑 TU CÓDIGO DE NAKAMA:* \n\n\`\`\`${secret}\`\`\`\n\n_Pégalo en WhatsApp en "Vincular con el número de teléfono"_`});
            
            // Eliminación de mensajes después del timeout (en el privado del usuario)
            setTimeout(() => { 
                try { conn.sendMessage(m.sender, { delete: txtCode.key }) } catch {}
                try { conn.sendMessage(m.sender, { delete: codeBot.key }) } catch {}
            }, 45000); 
            
            console.log(chalk.yellow(`[CODE] Sesión de ${m.sender} - Código: ${secret} enviado al privado.`));
        }
        
        // --- MANEJO DE CIERRE DE CONEXIÓN ---
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (connection === 'close') {
            const shouldReconnect = reason !== DisconnectReason.loggedOut;

            if (reason === DisconnectReason.loggedOut || reason === 401 || reason === 403) {
                // Credenciales no válidas, cerrado manual o cuenta en soporte
                console.log(chalk.red(`[LOGOUT] Sesión (+${path.basename(pathSession)}) eliminada. Razón: ${reason}`));
                try { 
                    await conn.sendMessage(m.chat, { text: `💔 Tu sesión de Sub-Bot ha sido cerrada permanentemente. Razón: ${reason}. Intenta vincularte de nuevo.` }, { quoted: m });
                } catch {}
                fs.rmdirSync(pathSession, { recursive: true });
                // Eliminar del array global
                const i = global.conns.indexOf(sock);
                if (i >= 0) global.conns.splice(i, 1);
            } else if (shouldReconnect) {
                // Reintento de conexión por otros errores (Timeout, reemplazo, etc.)
                console.log(chalk.yellow(`[RECONECT] Sesión (+${path.basename(pathSession)}) cerrada. Razón: ${reason}. Reiniciando...`));
                await creloadHandler(true).catch(console.error);
            }
        }

        // --- CONEXIÓN ABIERTA ---
        if (connection === 'open') {
            const userName = sock.authState.creds.me.name || 'Anónimo';
            console.log(chalk.bold.cyanBright(`\n${EMOJI_LUFFY} 🟢 Sub-Bot (+${path.basename(pathSession)}) de ${userName} conectado exitosamente.`));
            
            sock.isInit = true;
            global.conns.push(sock);
            
            // Mensaje de éxito (se envía al chat original del comando)
            if (options.fromCommand) {
                 await conn.sendMessage(m.chat, {text: `*🎉 ¡CONEXIÓN EXITOSA, NAKAMA!* @${m.sender.split('@')[0]}\n\nAhora eres un Sub-Bot de *${NOMBRE_BOT}*. ¡A navegar!`, mentions: [m.sender]}, { quoted: m });
            }
        }
    }
    
    // ... CÓDIGO DE RECARGA Y LIMPIEZA ...
    
    setInterval(() => {
        if (!sock.user) {
            try { sock.ws.close() } catch (e) {}
            sock.ev.removeAllListeners();
            let i = global.conns.indexOf(sock);
            if (i >= 0) global.conns.splice(i, 1);
        }
    }, 60000); // Limpieza de conexiones fallidas cada minuto

    let handler = await import('../handler.js'); // Importa el handler principal
    
    let creloadHandler = async function (restatConn) {
        // Recarga el handler para tomar los comandos
        try {
            const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
            if (Object.keys(Handler || {}).length) handler = Handler;
        } catch (e) {
            console.error('⚠️ Error al recargar handler: ', e);
        }
        
        // Reiniciar la conexión (manteniendo el estado si es posible)
        if (restatConn) {
            const oldChats = sock.chats;
            try { sock.ws.close() } catch { }
            sock.ev.removeAllListeners();
            sock = makeWASocket(connectionOptions, { chats: oldChats });
            isInit = true;
            sock.options = options; // Reasignar opciones
        }
        
        if (!isInit) {
            sock.ev.off("messages.upsert", sock.handler);
            sock.ev.off("connection.update", sock.connectionUpdate);
            sock.ev.off('creds.update', sock.credsUpdate);
        }

        // Asignar funciones y listeners
        sock.handler = handler.handler.bind(sock);
        sock.connectionUpdate = connectionUpdate.bind(sock);
        sock.credsUpdate = saveCreds.bind(sock, true);
        
        sock.ev.on("messages.upsert", sock.handler);
        sock.ev.on("connection.update", sock.connectionUpdate);
        sock.ev.on("creds.update", sock.credsUpdate);
        
        isInit = false;
        return true;
    }
    
    creloadHandler(false);
}

// =====================================================================
// Funciones de Utilidad
// =====================================================================

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60);
    
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;
    return minutes + ' m y ' + seconds + ' s ';
}