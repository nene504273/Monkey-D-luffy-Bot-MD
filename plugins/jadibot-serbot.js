/*
* CÓDIGO HECHO POR NEVI-DEV
* EXCLUSIVAMENTE PARA LUFFY BOT DE NENE
*/

const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

// === CONFIGURACIÓN PERSONALIZADA DE LUFFY ===
const EMOJI_LUFFY = '🏴‍☠️';
const NOMBRE_BOT = 'Monkey D Luffy 👒';
const COOLDOWN_TIME = 120000; // 2 minutos
const LIMIT_SESSIONS = 30; // Límite máximo de Sub-Bots

// --- TEXTOS DE GUÍA ---
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

const RTX_QR_FINAL = TEXT_INIT + TEXT_QR_GUIDE + TEXT_FOOTER;
const RTX_CODE_FINAL = TEXT_INIT + TEXT_CODE_GUIDE + TEXT_FOOTER;
// =======================================================


let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LuffyJBOptions = {} // Cambio de Ellen a Luffy
if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
//if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`♡ Comando desactivado temporalmente.`)

let time = (global.db.data.users[m.sender].lastJadibot || 0) + COOLDOWN_TIME
if (new Date - global.db.data.users[m.sender].lastJadibot < COOLDOWN_TIME) return conn.reply(m.chat, `${EMOJI_LUFFY} ¡Alto ahí, Nakama! Debes esperar ${msToTime(time - new Date())} para intentar vincular un *Sub-Bot* de nuevo.`, m)
const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const subBotsCount = subBots.length
if (subBotsCount >= LIMIT_SESSIONS) { // Uso de LIMIT_SESSIONS
return m.reply(`${EMOJI_LUFFY} ¡Lo siento! La capacidad máxima de *Sub-Bots* (${LIMIT_SESSIONS}) ha sido alcanzada. Intenta más tarde.`)
}

const mode = args[0] && /(--code|code)/i.test(args[0].trim()) ? 'code' : (args[0] && /(--qr|qr)/i.test(args[0].trim()) ? 'qr' : null)

// --- LÓGICA DE BOTONES ---
if (!mode) {
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
// --- FIN LÓGICA DE BOTONES ---

let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${who.split`@`[0]}`
let pathLuffyJadiBot = path.join(`./${jadi}/`, id) // Cambio de Ellen a Luffy
if (!fs.existsSync(pathLuffyJadiBot)){
fs.mkdirSync(pathLuffyJadiBot, { recursive: true })
}
LuffyJBOptions.pathLuffyJadiBot = pathLuffyJadiBot // Cambio de Ellen a Luffy
LuffyJBOptions.m = m
LuffyJBOptions.conn = conn
LuffyJBOptions.args = args
LuffyJBOptions.usedPrefix = usedPrefix
LuffyJBOptions.command = command
LuffyJBOptions.fromCommand = true
LuffyJBOptions.mode = mode // Añadir el modo para la función principal
LuffyJadiBot(LuffyJBOptions) // Cambio de Ellen a Luffy
global.db.data.users[m.sender].lastJadibot = new Date * 1 // Cambio de Subs a lastJadibot
} 
handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code', 'serbot'] // Añadir 'serbot' para el menú de botones
export default handler 

export async function LuffyJadiBot(options) { // Cambio de Ellen a Luffy
let { pathLuffyJadiBot, m, conn, args, usedPrefix, command, mode } = options // Cambio de Ellen a Luffy

const isBase64Creds = mode === 'qr' && args[0] && !/(--code|code)/i.test(args[0].trim()) ? args[0] : null
const isBase64CredsForCode = mode === 'code' && args[1] && !/(--code|code)/i.test(args[1].trim()) ? args[1] : null

let txtCode, codeBot, txtQR

const pathCreds = path.join(pathLuffyJadiBot, "creds.json") // Cambio de Ellen a Luffy
if (!fs.existsSync(pathLuffyJadiBot)){
fs.mkdirSync(pathLuffyJadiBot, { recursive: true })} // Cambio de Ellen a Luffy

// Intentar escribir credenciales Base64 si se proporciona
const credsToUse = isBase64Creds || isBase64CredsForCode;
if (credsToUse) {
    try {
        fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(credsToUse, "base64").toString("utf-8")), null, '\t'));
    } catch {
        conn.reply(m.chat, `${EMOJI_LUFFY} Formato de credenciales Base64 inválido.`, m);
        return;
    }
}


const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
const drmer = Buffer.from(drm1 + drm2, `base64`)

let { version, isLatest } = await fetchLatestBaileysVersion()
const msgRetry = (MessageRetryMap) => { }
const msgRetryCache = new NodeCache()
const { state, saveState, saveCreds } = await useMultiFileAuthState(pathLuffyJadiBot) // Cambio de Ellen a Luffy

const connectionOptions = {
logger: pino({ level: "fatal" }),
printQRInTerminal: false,
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
msgRetry,
msgRetryCache,
browser: mode === 'code' ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : [NOMBRE_BOT, 'Chrome','2.0.0'], // Uso de NOMBRE_BOT
version: version,
generateHighQualityLinkPreview: true
};

let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true
sock.options = options

async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) sock.isInit = false

// --- LÓGICA DEL CÓDIGO DE 8 DÍGITOS ---
if (mode === 'code' && (connection === 'connecting' || qr)) {
    // Si no está registrado, pedimos el código de emparejamiento.
    if (!sock.authState.creds.registered) {
        let phoneNumber = m.sender.split`@`[0];
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

        try {
            let secret = await sock.requestPairingCode(phoneNumber);
            secret = secret.match(/.{1,4}/g)?.join("-");
           
            // *** ENVÍO AL CHAT ORIGINAL (m.chat) - GRUPO O PRIVADO ***
            txtCode = await conn.sendMessage(m.chat, {text : RTX_CODE_FINAL.trim()}, { quoted: m }); // Uso de RTX_CODE_FINAL
            codeBot = await conn.sendMessage(m.chat, {text: `*🔑 TU CÓDIGO DE NAKAMA:* \n\n\`\`\`${secret}\`\`\`\n\n_Pégalo en WhatsApp en "Vincular con el número de teléfono"_`});
           
            // Eliminar los mensajes tras el timeout
            setTimeout(() => { 
                try { conn.sendMessage(m.chat, { delete: txtCode.key }) } catch {}
                try { conn.sendMessage(m.chat, { delete: codeBot.key }) } catch {}
            }, 45000); 
           
            console.log(chalk.yellow(`[CODE] Sesión de ${m.sender} - Código: ${secret} enviado a: ${m.chat}`));
            // Una vez enviado el código, nos aseguramos de que no se repita el envío si el handler recarga
             sock.ev.off('connection.update', sock.connectionUpdate);
           
        } catch (e) {
            console.error('Error al generar el código de emparejamiento:', e);
            await conn.reply(m.chat, `${EMOJI_LUFFY} Ocurrió un error al generar el código de emparejamiento. Asegúrate de que tu número de teléfono tiene el formato correcto (Código de país + Número). Intenta de nuevo.`, m);
            // Si falla, cerramos el socket y eliminamos la sesión.
            try { sock.ws.close(); fs.rmdirSync(pathLuffyJadiBot, { recursive: true }); } catch {}
            return;
        }
    }
}

// --- MANEJO DE QR --- (Solo si se eligió QR)
if (qr && mode === 'qr') {
    if (m?.chat) {
        txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: RTX_QR_FINAL.trim()}, { quoted: m}); // Uso de RTX_QR_FINAL
    } else {
        return 
    }
    if (txtQR && txtQR.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 45000) // 45 segundos para el QR
    }
    return
} 

const endSesion = async (loaded) => {
if (!loaded) {
try {
sock.ws.close()
} catch {
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)              
if (i < 0) return 
delete global.conns[i]
global.conns.splice(i, 1)
}}

const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
const sessionPathBase = path.basename(pathLuffyJadiBot) // Uso de pathLuffyJadiBot

if (connection === 'close') {
if (reason === 428) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${sessionPathBase}) fue cerrada inesperadamente. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}
if (reason === 408) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${sessionPathBase}) se perdió o expiró. Razón: ${reason}. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}
if (reason === 440) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${sessionPathBase}) fue reemplazada por otra sesión activa.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${sessionPathBase}@s.whatsapp.net`, {text : '*HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR*\n\n> *SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE*' }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.bold.yellow(`Error 440 no se pudo enviar mensaje a: +${sessionPathBase}`))
}}
if (reason == 405 || reason == 401 || reason === DisconnectReason.loggedOut) { // Se agrega DisconnectReason.loggedOut para ser explícito
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La sesión (+${sessionPathBase}) fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${sessionPathBase}@s.whatsapp.net`, {text : '*SESIÓN PENDIENTE*\n\n> *INTENTÉ NUEVAMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.bold.yellow(`Error 405 no se pudo enviar mensaje a: +${sessionPathBase}`))
}
fs.rmdirSync(pathLuffyJadiBot, { recursive: true }) // Uso de pathLuffyJadiBot
}
if (reason === 500) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Conexión perdida en la sesión (+${sessionPathBase}). Borrando datos...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${sessionPathBase}@s.whatsapp.net`, {text : '*CONEXIÓN PÉRDIDA*\n\n> *INTENTÉ MANUALMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }) : ""
return creloadHandler(true).catch(console.error)
//fs.rmdirSync(pathLuffyJadiBot, { recursive: true })
}
if (reason === 515) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Reinicio automático para la sesión (+${sessionPathBase}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}
if (reason === 403) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Sesión cerrada o cuenta en soporte para la sesión (+${sessionPathBase}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
fs.rmdirSync(pathLuffyJadiBot, { recursive: true }) // Uso de pathLuffyJadiBot
}}
if (global.db.data == null) loadDatabase()
if (connection == `open`) {
if (!global.db.data?.users) loadDatabase()
let userName, userJid 
userName = sock.authState.creds.me.name || 'Anónimo'
userJid = sock.authState.creds.me.jid || `${path.basename(pathLuffyJadiBot)}@s.whatsapp.net` // Uso de pathLuffyJadiBot
console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathLuffyJadiBot)}) conectado exitosamente. ¡NAKAMA!\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))
sock.isInit = true
global.conns.push(sock)
await joinChannels(sock)

// Mensaje de éxito con temática Luffy
m?.chat ? await conn.sendMessage(m.chat, {text: `*🎉 ¡CONEXIÓN EXITOSA, NAKAMA!* @${m.sender.split('@')[0]}\n\nAhora eres un Sub-Bot de *${NOMBRE_BOT}*. ¡A navegar!`, mentions: [m.sender]}, { quoted: m }) : ''

}}
setInterval(async () => {
if (!sock.user) {
try { sock.ws.close() } catch (e) {      
//console.log(await creloadHandler(true).catch(console.error))
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)              
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)

let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler

} catch (e) {
console.error('⚠️ Nuevo error: ', e)
}
if (restatConn) {
const oldChats = sock.chats
try { sock.ws.close() } catch { }
sock.ev.removeAllListeners()
sock = makeWASocket(connectionOptions, { chats: oldChats })
isInit = true
sock.options = options // Asegurar que las opciones se mantengan
}
if (!isInit) {
sock.ev.off("messages.upsert", sock.handler)
sock.ev.off("connection.update", sock.connectionUpdate)
sock.ev.off('creds.update', sock.credsUpdate)
}

sock.handler = handler.handler.bind(sock)
sock.connectionUpdate = connectionUpdate.bind(sock)
sock.credsUpdate = saveCreds.bind(sock, true)
sock.ev.on("messages.upsert", sock.handler)
sock.ev.on("connection.update", sock.connectionUpdate)
sock.ev.on("creds.update", sock.credsUpdate)
isInit = false
return true
}
creloadHandler(false)
})
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));}
function msToTime(duration) {
var seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60)
minutes = (minutes < 10) ? '0' + minutes : minutes
seconds = (seconds < 10) ? '0' + seconds : seconds
return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(conn) {
for (const channelId of Object.values(global.ch)) {
await conn.newsletterFollow(channelId).catch(() => {})
}}
