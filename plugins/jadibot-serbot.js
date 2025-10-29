import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} from "@whiskeysockets/baileys";
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
// ⚠️ Importación corregida de 'child_process'
import { spawn, exec } from 'child_process'
import { makeWASocket } from '../lib/simple.js' // Asegúrate de que esta ruta es correcta en tu proyecto
import { fileURLToPath } from 'url'

// --- Variables y Configuración ---
// NOTA: Estas cadenas Base64 contienen comandos de terminal, lo cual es riesgoso. 
// Se mantienen para replicar la lógica original del código, pero úsalas con precaución.
let crm1 = "Y2QgcGx1Z2lucy" // Base64 de: cd plugins
let crm2 = "A7IG1kNXN1b"    // Base64 de: ; md5sum
let crm3 = "SBpbmZvLWRvbmFyLmpz" // Base64 de:  info-donar.js
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz" // Base64 de:  _autorespoder.js info-bot.js
let drm1 = ""
let drm2 = ""
let rtx = "*︰꯭𞋭🏴‍☠️ CONEXIÓN SUBBOT*\n\n━⧽ MODO CODIGO QR\n\n✰ 𝖯𝖺𝗌𝗈𝗌 𝖽𝖾 𝗏𝗂𝗇𝖼𝗎𝗅𝖺𝖼𝗂𝗈́𝗇:\n\n• En la Pc o tu otro teléfono escanea este qr.\n\n➪ Toca en dispositivos vinculados.\n\n➪ Selecciona Vincular con el número de teléfono.\n\n➪ Escanea el código QR.\n\n★ 𝗡𝗼𝘁𝗮: Este código expira después de los 45 segundos."
let rtx2 = "*︰꯭𞋭🏴‍☠️ CONEXIÓN SUBBOT*\n\n━⧽ MODO CODIGO\n\n✰ 𝖯𝖺𝗌𝗈𝗌 𝖽𝖾 𝗏𝗂𝗇𝖼𝗎𝗅𝖺𝖼𝗂𝗈́𝗇:\n\n➪ Ve a la esquina superior derecha.\n\n➪ Toca en dispositivos vinculados.\n\n➪ Selecciona Vincular con el número de teléfono.\n\n➪ Pega el siguiente código que te enviaremos.\n\n★ 𝗡𝗼𝘁𝖺: 𝖤𝗌𝗍𝖾 𝖼𝗈𝖽𝗂𝗀𝗈 𝗌𝗈𝗅𝗈 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖺 𝖾𝗇 𝖾𝗅 𝗇𝗎́𝗆𝖾𝗋𝗈 𝗊𝗎𝖾 𝗅𝗈 𝗌𝗈𝗅𝗂𝖼𝗂𝗍𝗈́."


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- Variables Globales Asumidas (Deben estar definidas en el entorno principal del bot) ---
const blackJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []

// Variables faltantes que se asumen globales en un bot de esta estructura:
const emoji = '🔗'
const emoji2 = '🚫'
const jadi = 'jadibot' // Carpeta base para las sesiones
const loadDatabase = () => { /* Función ficticia */ console.log('Simulando carga de base de datos'); 
    if (!global.db) global.db = { data: {} } 
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.settings) global.db.data.settings = {}
}
if (!global.db) loadDatabase() // Asegurar que global.db exista para evitar errores
// -----------------------------------------------------------------------------------------

// --- Funciones de Utilidad ---

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));}
function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
hours = (hours < 10) ? '0' + hours : hours
minutes = (minutes < 10) ? '0' + minutes : minutes
seconds = (seconds < 10) ? '0' + seconds : seconds
return minutes + ' m y ' + seconds + ' s '
}

// --- Función Principal de Conexión ---

export async function LuffyJadiBot(options) {
let { pathblackJadiBot, m, conn, args, usedPrefix, command } = options
if (command === 'code') {
command = 'qr'; 
args.unshift('code')}
const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
let txtCode, codeBot, txtQR
if (mcode) {
args[0] = args[0].replace(/^--code$|^code$/, "").trim()
if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
if (args[0] == "") args[0] = undefined
}
const pathCreds = path.join(pathblackJadiBot, "creds.json")
if (!fs.existsSync(pathblackJadiBot)){
fs.mkdirSync(pathblackJadiBot, { recursive: true })}
try {
// Si se proporciona un argumento (código Base64), intenta escribir las credenciales
args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
} catch (e) {
// console.error(e) // Opcional: para debug
conn.reply(m.chat, `${emoji} Use correctamente el comando » ${usedPrefix + command} code`, m) // Asume 'emoji' está definido
return
}

const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
const drmer = Buffer.from(drm1 + drm2, `base64`)

let { version, isLatest } = await fetchLatestBaileysVersion()
const msgRetry = (MessageRetryMap) => { }
const msgRetryCache = new NodeCache()
const { state, saveState, saveCreds } = await useMultiFileAuthState(pathblackJadiBot)

const connectionOptions = {
logger: pino({ level: "fatal" }),
printQRInTerminal: false,
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
msgRetry,
msgRetryCache,
// El navegador se cambia si se usa el código de emparejamiento (mcode)
browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Makima (Sub Bot)', 'Chrome','2.0.0'],
version: version,
generateHighQualityLinkPreview: true
};

let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true

// Definición de la función de recarga para manejar la reconexión y los handlers
let handler = await import('../handler.js') // Asegúrate de que esta ruta es correcta
let creloadHandler = async function (restatConn) {
    try {
        // Recarga dinámica del handler para obtener la última versión sin reiniciar el proceso principal
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler.default || Handler // Manejar export default o export normal

    } catch (e) {
        console.error('⚠️ Nuevo error: ', e)
    }
    if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        // Crear un nuevo socket con las mismas opciones y chats antiguos
        sock = makeWASocket(connectionOptions, { chats: oldChats }) 
        isInit = true
    }
    if (!isInit) {
        // Desactivar los listeners anteriores si no es la inicialización
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off('creds.update', sock.credsUpdate)
    }

    // Asignar y enlazar las funciones a la instancia del socket
    sock.handler = handler.handler.bind(sock) // Asume que el handler exporta { handler }
    sock.connectionUpdate = connectionUpdate.bind(sock)
    sock.credsUpdate = saveCreds.bind(sock, true)
    
    // Asignar los nuevos listeners
    sock.ev.on("messages.upsert", sock.handler)
    sock.ev.on("connection.update", sock.connectionUpdate)
    sock.ev.on("creds.update", sock.credsUpdate)
    isInit = false
    return true
}

// Función principal de manejo de eventos de conexión
async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) sock.isInit = false

// --- Manejo de QR ---
if (qr && !mcode) {
    if (m?.chat) {
        txtQR = await conn.sendMessage(m.chat, { 
            image: await qrcode.toBuffer(qr, { scale: 8 }), 
            caption: rtx.trim()
        }, { quoted: m})
    } else {
        return 
    }
    if (txtQR && txtQR.key) {
        // Borrar el mensaje QR después de 30 segundos
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }).catch(e => console.error("Error al borrar QR:", e))}, 30000)
    }
    return
} 

// --- Manejo de Código de Emparejamiento ---
if (qr && mcode) {
    // Solicitar el código de emparejamiento usando el JID del remitente (sólo números)
    let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
    secret = secret.match(/.{1,4}/g)?.join("-") // Formato X-X-X-X-X
    
    txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
    codeBot = await m.reply(secret)
    console.log(chalk.yellow(`Código de Emparejamiento para +${m.sender.split`@`[0]}: ${secret}`))
    
    // Borrar mensajes de código después de 30 segundos
    if (txtCode && txtCode.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }).catch(e => console.error("Error al borrar código 1:", e))}, 30000)
    }
    if (codeBot && codeBot.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key }).catch(e => console.error("Error al borrar código 2:", e))}, 30000)
    }
}

// --- Lógica de Desconexión ---
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
        global.conns.splice(i, 1) // Eliminar el socket de la lista global
    }}

const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
    // Manejo de errores de conexión y reconexión
    if (reason === DisconnectReason.connectionLost || reason === DisconnectReason.connectionTimeout || reason === 428 || reason === 408 || reason === 515 || reason === 500) {
        console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathblackJadiBot)}) fue cerrada inesperadamente/expiró/perdida. Razón: ${reason}. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
        // Enviar mensaje de error solo si la razón es 500 (Server Error)
        if (reason === 500 && options.fromCommand) {
            m?.chat ? await conn.sendMessage(`${path.basename(pathblackJadiBot)}@s.whatsapp.net`, {text : '*CONEXIÓN PÉRDIDA*\n\n> *INTENTÉ MANUALMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }).catch(e => console.error(`Error 500 no se pudo enviar mensaje a: +${path.basename(pathblackJadiBot)}`, e)) : ""
        }
        await creloadHandler(true).catch(console.error)
        
    } else if (reason === DisconnectReason.loggedOut || reason == 405 || reason == 401 || reason === 403) {
        // Sesión inválida, cerrada o reemplazada (Logged Out, Unauthorized, Forbidden)
        console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La sesión (+${path.basename(pathblackJadiBot)}) fue cerrada permanentemente. Razón: ${reason}. Borrando credenciales...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
        
        // Enviar mensaje de sesión cerrada/no válida
        if (options.fromCommand) {
            const msgText = (reason === 440) 
                ? '*HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR*\n\n> *SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE*' 
                : '*SESIÓN CERRADA/PENDIENTE*\n\n> *INTENTÉ NUEVAMENTE VOLVER A SER SUB-BOT*'
            m?.chat ? await conn.sendMessage(`${path.basename(pathblackJadiBot)}@s.whatsapp.net`, {text : msgText }, { quoted: m || null }).catch(e => console.error(`Error ${reason} no se pudo enviar mensaje a: +${path.basename(pathblackJadiBot)}`, e)) : ""
        }
        // Eliminar archivos de sesión
        fs.rmdirSync(pathblackJadiBot, { recursive: true })
        await endSesion(false) // Cerrar y remover de global.conns
    } else {
        // Otras razones de desconexión (ej. Boom.isBoom)
        console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Desconexión por razón desconocida: ${reason}. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
        await creloadHandler(true).catch(console.error)
    }
}
// --- Lógica de Conexión Abierta ---
if (global.db.data == null) loadDatabase() // Asume 'loadDatabase' está disponible
if (connection == `open`) {
    if (!global.db.data?.users) loadDatabase() 
    let userName = sock.authState.creds.me.name || 'Anónimo'
    let userJid = sock.authState.creds.me.jid || `${path.basename(pathblackJadiBot)}@s.whatsapp.net`
    
    // Asegurarse de que el usuario no se añada dos veces
    if (!sock.isInit) {
        console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathblackJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))
        sock.isInit = true
        // Solo agregar a la lista si no está ya (evitar duplicados al reconectar)
        if (!global.conns.includes(sock)) {
            global.conns.push(sock)
        }

        // Mensaje de éxito al usuario que ejecutó el comando
        m?.chat ? await conn.sendMessage(m.chat, {
            text: args[0] ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` : `@${m.sender.split('@')[0]}, Te conectaste a Monkey D Luffy como (Subbot) con exito.`,
            mentions: [m.sender]
        }, { quoted: m }) : ''
    }
}}

creloadHandler(false) // Iniciar la conexión y los handlers

// Intervalo de limpieza y chequeo del socket
setInterval(async () => {
if (!sock.user) {
try { sock.ws.close() } catch (e) {      
    // console.log(e) // Opcional: para debug
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)              
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)

}) // Cierre del exec
}

// --- Handler (Punto de entrada del comando) ---

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
// if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`♡ Comando desactivado temporalmente.`) // Asume 'globalThis.db.data.settings' está disponible
let time = (global.db.data.users[m.sender]?.Subs || 0) + 120000 // Usar ?. para evitar error si el usuario no existe
if (new Date - (global.db.data.users[m.sender]?.Subs || 0) < 120000) return conn.reply(m.chat, `🕐 Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m) // Asume 'global.db.data.users' está disponible

const subBots = global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)
const subBotsCount = subBots.length

if (subBotsCount >= 30) {
return m.reply(`${emoji2} No se han encontrado servidores para *Sub-Bots* disponibles.`) // Asume 'emoji2' está definido
}

let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${who.split`@`[0]}`
let pathblackJadiBot = path.join(`./${jadi}/`, id) // Asume 'jadi' está definido

// Crear la carpeta de sesión si no existe
if (!fs.existsSync(pathblackJadiBot)){
fs.mkdirSync(pathblackJadiBot, { recursive: true })
}

// Configurar y llamar a la función principal
blackJBOptions.pathblackJadiBot = pathblackJadiBot
blackJBOptions.m = m
blackJBOptions.conn = conn
blackJBOptions.args = args
blackJBOptions.usedPrefix = usedPrefix
blackJBOptions.command = command
blackJBOptions.fromCommand = true

// Corregir el nombre de la función para que coincida con la exportación solicitada
LuffyJadiBot(blackJBOptions) 

// Actualizar el tiempo de suscripción
if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
global.db.data.users[m.sender].Subs = new Date * 1 // Asume 'global.db.data.users' está disponible
} 

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']

// --- Exportación del Handler ---
export default handler