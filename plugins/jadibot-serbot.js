import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
import { fileURLToPath } from 'url'
import { makeWASocket } from '../lib/simple.js' // Assuming simple.js is a local wrapper

const { CONNECTING } = ws

// --- Path Setup ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- Configuration & Initialization ---
const emoji2 = '🛑' // Añadido un valor por defecto para 'emoji2'
const emoji = '❌' // Añadido un valor por defecto para 'emoji'
const wm = 'Luffy Bot' // Añadido un valor por defecto para 'wm'
const BASE_SESSION_DIR = global.jadi ? `./${global.jadi}/` : './sessions/subbots/' // Usando global.jadi o un valor por defecto
const blackJBOptions = {}

if (!(global.conns instanceof Array)) global.conns = []

// --- Localization (Mensajes de conexión) ---
let rtx = "*︰꯭𞋭🏴‍☠️ CONEXIÓN SUBBOT*\n\n━⧽ MODO CODIGO QR\n\n✰ 𝖯𝖺𝗌𝗈𝗌 𝖽𝖾 𝗏𝗂𝗇𝖼𝗎𝗅𝖺𝖼𝗂𝗈́𝗇:\n\n• En la Pc o tu otro teléfono escanea este qr.\n\n➪ Toca en dispositivos vinculados.\n\n➪ Selecciona Vincular con el número de teléfono.\n\n➪ Escanea el código QR.\n\n★ 𝗡𝗼𝘁a: Este código expira después de los 45 segundos."
let rtx2 = "*︰꯭𞋭🏴‍☠️ CONEXIÓN SUBBOT*\n\n━⧽ MODO CODIGO\n\n✰ 𝖯𝖺𝗌𝗈𝗌 𝖽𝖾 𝗏𝗂𝗇𝖼𝗎𝗅𝖺𝖼𝗂𝗈́𝗇:\n\n➪ Ve a la esquina superior derecha.\n\n➪ Toca en dispositivos vinculados.\n\n➪ Selecciona Vincular con el número de teléfono.\n\n➪ Pega el siguiente código que te enviaremos.\n\n★ 𝗡𝗼𝘁𝖺: 𝖤𝗌𝗍𝖾 𝖼𝗈𝖽𝗂𝗀𝗈 𝗌𝗈𝗅𝗈 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖺 𝖾𝗇 𝖾𝗅 𝗇𝗎́𝗆𝖾𝗋𝗈 𝗊𝗎𝖾 𝗅𝗈 𝗌𝗈𝗅𝗂𝖼𝗂𝗍𝗈́."


// --- Utility Functions ---

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds

    return minutes + ' m y ' + seconds + ' s '
}

// --- Command Handler (Exportación por defecto) ---

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    // 1. Cooldown Check (2 minutes)
    let cooldownTime = 120000 
    let userSubsTime = global.db.data.users[m.sender].Subs || 0
    let timeRemaining = (userSubsTime + cooldownTime) - new Date()
    
    if (timeRemaining > 0) {
        return conn.reply(m.chat, `🕐 Debes esperar ${msToTime(timeRemaining)} para volver a vincular un *Sub-Bot.*`, m)
    }

    // 2. Global Sub-Bot Limit Check
    const MAX_SUBBOTS = 30
    const activeSubBots = global.conns.filter((c) => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
    const subBotsCount = activeSubBots.length
    
    if (subBotsCount >= MAX_SUBBOTS) {
        return m.reply(`${emoji2} No se han encontrado servidores para *Sub-Bots* disponibles.`)
    }

    // 3. Prepare Session Path
    let who = m.sender
    let id = `${who.split('@')[0]}` 
    let pathJadiBot = path.join(BASE_SESSION_DIR, id)

    if (!fs.existsSync(pathJadiBot)){
        fs.mkdirSync(pathJadiBot, { recursive: true })
    }

    // 4. Execute Core Logic
    const options = {
        pathJadiBot: pathJadiBot,
        m: m,
        conn: conn,
        args: args,
        usedPrefix: usedPrefix,
        command: command,
        fromCommand: true
    }

    await luffyJadiBot(options)

    // 5. Update Cooldown
    global.db.data.users[m.sender].Subs = new Date * 1
} 

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

// --- Core JadiBot Function (Exported como luffyJadiBot) ---

export async function luffyJadiBot(options) {
    let { pathJadiBot, m, conn, args, usedPrefix, command } = options
    
    // Tu lógica original para forzar el modo código si se llama con '!code'
    if (command === 'code') {
        command = 'qr'; 
        args.unshift('code')
    }
    
    const isCodeMode = args.some(arg => arg.trim() === '--code' || arg.trim() === 'code')
    
    let txtCode, codeBot, txtQR

    if (isCodeMode) {
        // Lógica original para limpiar los argumentos después de detectar 'code'
        args[0] = args[0].replace(/^--code$|^code$/, "").trim()
        if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
        
        // Esto estaba presente en tu código, si args[0] queda vacío, lo vuelve 'undefined'
        if (args[0] == "") args[0] = undefined 
    }

    // Usamos el path renombrado
    const pathCreds = path.join(pathJadiBot, "creds.json")

    // 1. Handle base64 credentials if provided
    if (!fs.existsSync(pathJadiBot)){
        fs.mkdirSync(pathJadiBot, { recursive: true })
    }

    try {
        // Si hay un argumento válido (no el token 'code' limpio, si es que lo hay)
        if (args[0] && args[0] !== undefined) {
             const credsData = Buffer.from(args[0], "base64").toString("utf-8")
             JSON.parse(credsData) 
             fs.writeFileSync(pathCreds, credsData, null, '\t')
        }
    } catch (error) {
        conn.reply(m.chat, `${emoji} Uso incorrecto o credenciales Base64 no válidas. Use correctamente el comando » ${usedPrefix + command} code`, m)
        return
    }

    // 2. Initialize Baileys Connection

    // *** ELIMINADO: Bloque 'exec' con comandos shell. Esta es la corrección de seguridad. ***

    let { version } = await fetchLatestBaileysVersion()
    
    const msgRetryCache = new NodeCache()
    // Ya no se necesita 'saveState' aquí, solo 'saveCreds'
    const { state, saveCreds } = await useMultiFileAuthState(pathJadiBot) 

    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
        },
        msgRetryCache,
        browser: isCodeMode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Luffy (Sub Bot)', 'Chrome','2.0.0'],
        version: version,
        generateHighQualityLinkPreview: true
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true
    
    // 3. Connection Update Handler

    async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update

        if (isNewLogin) sock.isInit = false
        
        // QR Code Mode
        if (qr && !isCodeMode) {
            if (m?.chat) {
                txtQR = await conn.sendMessage(m.chat, { 
                    image: await qrcode.toBuffer(qr, { scale: 8 }), 
                    caption: rtx.trim()
                }, { quoted: m})
            } else {
                return 
            }

            if (txtQR && txtQR.key) {
                setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }).catch(() => {})}, 45000) 
            }
            return
        } 
        
        // Pairing Code Mode
        if (qr && isCodeMode) {
            let secret = await sock.requestPairingCode(m.sender.split`@`[0])
            secret = secret.match(/.{1,4}/g)?.join("-")
            
            txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
            codeBot = await m.reply(secret)

            if (txtCode && txtCode.key) {
                setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }).catch(() => {})}, 45000)
            }
            if (codeBot && codeBot.key) {
                setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key }).catch(() => {})}, 45000)
            }
        }

        // --- Manejo de Desconexión ---
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

        if (connection === 'close') {
            const userJid = `${path.basename(pathJadiBot)}@s.whatsapp.net`
            const logMsg = (msg) => console.log(chalk.bold.magentaBright(`\n[SUB-BOT +${path.basename(pathJadiBot)}] ${msg}\n`))

            // 428: Conexión cerrada inesperadamente
            if (reason === DisconnectReason.connectionClose || reason === 428) {
                logMsg(`La conexión fue cerrada inesperadamente. Intentando reconectar...`)
                await creloadHandler(true).catch(console.error)
            }
            // 408: Conexión perdida o expirada
            else if (reason === DisconnectReason.connectionTimeout || reason === 408) {
                logMsg(`La conexión se perdió o expiró. Razón: ${reason}. Intentando reconectar...`)
                await creloadHandler(true).catch(console.error)
            }
            // 440: Conexión reemplazada
            else if (reason === DisconnectReason.connectionReplaced || reason === 440) {
                logMsg(`La conexión fue reemplazada por otra sesión activa.`)
                m?.chat ? await conn.sendMessage(userJid, {text : '*HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR*\n\n> *SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE*' }, { quoted: m || null }).catch(() => {})
            }
            // 401/405: Credenciales no válidas/Sesión cerrada
            else if (reason === DisconnectReason.loggedOut || reason === 401 || reason === 405) {
                logMsg(`La sesión fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.`)
                m?.chat ? await conn.sendMessage(userJid, {text : '*SESIÓN PENDIENTE*\n\n> *INTENTÉ NUEVAMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }).catch(() => {})
                fs.rmdirSync(pathJadiBot, { recursive: true })
            }
            // 500: Conexión perdida (Error del servidor)
            else if (reason === 500) {
                logMsg(`Conexión perdida en la sesión. Borrando datos...`)
                m?.chat ? await conn.sendMessage(userJid, {text : '*CONEXIÓN PÉRDIDA*\n\n> *INTENTÉ MANUALMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }).catch(() => {})
                return creloadHandler(true).catch(console.error)
            }
            // 515: Reinicio automático
            else if (reason === 515) {
                logMsg(`Reinicio automático para la sesión.`)
                await creloadHandler(true).catch(console.error)
            }
            // 403: Cuenta en soporte o bloqueada
            else if (reason === 403) {
                logMsg(`Sesión cerrada o cuenta en soporte. Borrando sesión...`)
                fs.rmdirSync(pathJadiBot, { recursive: true })
            }
            
            // Eliminar de global.conns
            let i = global.conns.indexOf(sock)              
            if (i >= 0) {
                delete global.conns[i]
                global.conns.splice(i, 1)
            }
        } // Fin de connection === 'close'

        // --- Manejo de Conexión Abierta ---
        if (global.db.data == null && typeof loadDatabase === 'function') loadDatabase()
        if (connection == `open`) {
            if (!global.db.data?.users && typeof loadDatabase === 'function') loadDatabase()

            const userName = sock.authState.creds.me.name || 'Anónimo'
            
            console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))

            sock.isInit = true
            global.conns.push(sock)

            const initialMessage = args[0] ? 
                `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` : 
                `@${m.sender.split('@')[0]}, Te conectaste a ${conn.user.name} como (Subbot) con exito.`
                
            m?.chat ? await conn.sendMessage(m.chat, {text: initialMessage, mentions: [m.sender]}, { quoted: m }) : ''
        }
    } // Fin de connectionUpdate function

    // 4. Limpieza de conexiones inactivas
    setInterval(async () => {
        if (!sock.user || (sock.ws.socket?.readyState !== CONNECTING && sock.ws.socket?.readyState !== ws.OPEN)) {
            try { sock.ws.close() } catch (e) { }

            sock.ev.removeAllListeners()
            let i = global.conns.indexOf(sock)              
            if (i >= 0) {
                delete global.conns[i]
                global.conns.splice(i, 1)
            }
        }
    }, 60000)

    // 5. Reload Handler Function
    let handlerModule = await import('../handler.js') 
    
    let creloadHandler = async function (restatConn) {
        try {
            const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
            if (Object.keys(Handler || {}).length) handlerModule = Handler
        } catch (e) {
            console.error('⚠️ Error al recargar handler: ', e)
        }

        if (restatConn) {
            const oldChats = sock.chats 
            try { sock.ws.close() } catch { }
            sock.ev.removeAllListeners()
            sock = makeWASocket(connectionOptions, { chats: oldChats })
            isInit = true
        }

        if (!isInit) {
            sock.ev.off("messages.upsert", sock.handler)
            sock.ev.off("connection.update", sock.connectionUpdate)
            sock.ev.off('creds.update', sock.credsUpdate)
        }

        // Bindea los nuevos handlers
        sock.handler = handlerModule.handler.bind(sock)
        sock.connectionUpdate = connectionUpdate.bind(sock)
        sock.credsUpdate = saveCreds.bind(sock) 

        sock.ev.on("messages.upsert", sock.handler)
        sock.ev.on("connection.update", sock.connectionUpdate)
        sock.ev.on("creds.update", sock.credsUpdate)
        
        isInit = false
        return true
    }

    creloadHandler(false)
} // Fin de luffyJadiBot