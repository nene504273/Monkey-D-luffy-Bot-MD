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

// Using child_process is only necessary for the legacy 'exec', which is removed.
// const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws

// --- Path Setup ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Define the base directory for Sub-Bot sessions (Using 'jadi' if defined, otherwise 'subbots')
const BASE_SESSION_DIR = global.jadi ? `./${global.jadi}/` : './sessions/subbots/' 
const blackJBOptions = {}

// Initialize global connection array if it doesn't exist
if (!(global.conns instanceof Array)) global.conns = []

// --- Localization (Spanish text messages) ---
let rtx = "*︰꯭𞋭🏴‍☠️ CONEXIÓN SUBBOT*\n\n━⧽ MODO CÓDIGO QR\n\n✰ 𝖯𝖺𝗌𝗈𝗌 𝖽𝖾 𝗏𝗂𝗇𝖼𝗎𝗅𝖺𝖼𝗂𝗈́𝗇:\n\n• En la Pc o tu otro teléfono escanea este qr.\n\n➪ Toca en dispositivos vinculados.\n\n➪ Selecciona Vincular con el número de teléfono.\n\n➪ Escanea el código QR.\n\n★ 𝗡𝗼𝘁𝗮: Este código expira después de los 45 segundos."
let rtx2 = "*︰꯭𞋭🏴‍☠️ CONEXIÓN SUBBOT*\n\n━⧽ MODO CÓDIGO\n\n✰ 𝖯𝖺𝗌𝗈𝗌 𝖽𝖾 𝗏𝗂𝗇𝖼𝗎𝗅𝖺𝖼𝗂𝗈́𝗇:\n\n➪ Ve a la esquina superior derecha.\n\n➪ Toca en dispositivos vinculados.\n\n➪ Selecciona Vincular con el número de teléfono.\n\n➪ Pega el siguiente código que te enviaremos.\n\n★ 𝗡𝗼𝘁𝖺: 𝖤𝗌𝗍𝖾 𝖼𝗈𝖽𝗂𝗀𝗈 𝗌𝗈𝗅𝗈 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖺 𝖾𝗇 𝖾𝗅 𝗇𝗎́𝗆𝖾𝗋𝗈 𝗊𝗎𝖾 𝗅𝗈 𝗌𝗈𝗅𝗂𝖼𝗂𝗍𝗈́."

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

// --- Command Handler (Default Export) ---

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    // 1. Cooldown Check
    let cooldownTime = 120000 // 2 minutes
    let userSubsTime = global.db.data.users[m.sender].Subs || 0
    let timeRemaining = (userSubsTime + cooldownTime) - new Date()
    
    if (timeRemaining > 0) {
        return conn.reply(m.chat, `🕐 Debes esperar ${msToTime(timeRemaining)} para volver a vincular un *Sub-Bot.*`, m)
    }

    // 2. Global Sub-Bot Limit Check
    const MAX_SUBBOTS = 30
    const activeSubBots = global.conns.filter((c) => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
    const subBotsCount = activeSubBots.length
    
    // Ensure you define 'emoji2' elsewhere or replace it with a standard emoji
    const emoji2 = '🛑' 
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

    await luffyJadiBot(options) // Calling the refactored function

    // 5. Update Cooldown
    global.db.data.users[m.sender].Subs = new Date * 1
} 

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

// --- Core JadiBot Function (Exported as luffyJadiBot) ---

export async function luffyJadiBot(options) {
    let { pathJadiBot, m, conn, args, usedPrefix, command } = options
    
    // Check for pairing code argument (mcode renamed to isCodeMode)
    const isCodeMode = args.some(arg => arg.trim() === '--code' || arg.trim() === 'code')
    
    // Clean args for base64 creds if present
    const cleanArgs = args.filter(arg => arg.trim() !== '--code' && arg.trim() !== 'code')
    
    let txtCode, codeBot, txtQR

    const pathCreds = path.join(pathJadiBot, "creds.json")

    // 1. Handle base64 credentials if provided
    if (cleanArgs.length > 0) {
        try {
            const credsData = Buffer.from(cleanArgs[0], "base64").toString("utf-8")
            // Basic validation to prevent writing junk data
            JSON.parse(credsData) 
            fs.writeFileSync(pathCreds, credsData)
        } catch (error) {
            const emoji = '❌' // Assuming 'emoji' is the error emoji
            conn.reply(m.chat, `${emoji} Uso incorrecto o credenciales Base64 no válidas. Use correctamente el comando » ${usedPrefix + command} (código base64)`, m)
            return
        }
    }

    // 2. Initialize Baileys Connection

    // *** Removed exec block and crm variables for security ***

    let { version } = await fetchLatestBaileysVersion()
    
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathJadiBot)

    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
        },
        msgRetryCache,
        // Using 'Luffy (Sub Bot)' for the browser name as requested
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
                }, { quoted: m })
            } else {
                return 
            }

            // Set timeout to delete the QR message (45 seconds, as per your text)
            if (txtQR && txtQR.key) {
                setTimeout(() => { 
                    conn.sendMessage(m.sender, { delete: txtQR.key }).catch(e => console.error("Error deleting QR:", e))
                }, 45000) 
            }
            return
        } 
        
        // Pairing Code Mode
        if (qr && isCodeMode) {
            let secret = await sock.requestPairingCode(m.sender.split`@`[0])
            secret = secret.match(/.{1,4}/g)?.join("-")
            
            txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
            codeBot = await m.reply(secret)
            
            // Set timeout to delete the pairing code messages (45 seconds)
            if (txtCode && txtCode.key) {
                setTimeout(() => { 
                    conn.sendMessage(m.sender, { delete: txtCode.key }).catch(e => console.error("Error deleting code msg:", e))
                }, 45000)
            }
            if (codeBot && codeBot.key) {
                setTimeout(() => { 
                    conn.sendMessage(m.sender, { delete: codeBot.key }).catch(e => console.error("Error deleting code:", e))
                }, 45000)
            }
        }

        // Handle Disconnection
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

        if (connection === 'close') {
            const userJid = `${path.basename(pathJadiBot)}@s.whatsapp.net`
            const logMsg = (msg) => console.log(chalk.bold.magentaBright(`\n[SUB-BOT +${path.basename(pathJadiBot)}] ${msg}\n`))

            // 401/405: Logged out / Invalid credentials
            if ([DisconnectReason.loggedOut, DisconnectReason.badSession, 401, 405].includes(reason)) {
                logMsg(`Sesión cerrada. Credenciales no válidas o dispositivo desconectado. Borrando sesión...`)
                fs.rmdirSync(pathJadiBot, { recursive: true })
                m?.chat ? await conn.sendMessage(userJid, {text : '*SESIÓN CERRADA*\n\n> *INTENTE NUEVAMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }).catch(() => {})
            } 
            // 440: Connection replaced
            else if (reason === DisconnectReason.connectionReplaced || reason === 440) {
                logMsg(`La conexión fue reemplazada por otra sesión activa. Intentando reconectar...`)
                m?.chat ? await conn.sendMessage(userJid, {text : '*HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR*\n\n> *SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE*' }, { quoted: m || null }).catch(() => {})
                await creloadHandler(true).catch(console.error)
            } 
            // 408/500/515/428: Reconnecting reasons
            else if ([DisconnectReason.connectionLost, DisconnectReason.connectionTimeout, 408, 500, 515, 428].includes(reason)) {
                 logMsg(`Conexión perdida, expirada o error interno. Intentando reconectar (Razón: ${reason})...`)
                await creloadHandler(true).catch(console.error)
            }
            // 403: Blocked/Account support
            else if (reason === 403) {
                logMsg(`Sesión cerrada o cuenta en soporte para la sesión. Borrando datos...`)
                fs.rmdirSync(pathJadiBot, { recursive: true })
            }
            
            // Remove the disconnected socket from global.conns
            let i = global.conns.indexOf(sock)              
            if (i >= 0) {
                delete global.conns[i]
                global.conns.splice(i, 1)
            }
        }

        // Handle Connection Open
        if (global.db.data == null) loadDatabase()
        if (connection == `open`) {
            if (!global.db.data?.users) loadDatabase() // Load user database
            
            const userName = sock.authState.creds.me.name || 'Anónimo'
            
            console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))

            sock.isInit = true
            global.conns.push(sock)

            // Send confirmation message
            const initialMessage = args[0] ? 
                `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` : 
                `@${m.sender.split('@')[0]}, Te conectaste a ${conn.user.name} como (Subbot) con exito.`
                
            m?.chat ? await conn.sendMessage(m.chat, {text: initialMessage, mentions: [m.sender]}, { quoted: m }) : ''
        }
    }

    // 4. Auto-disconnect for inactive/broken connections
    setInterval(async () => {
        if (sock.ws.socket?.readyState !== CONNECTING && sock.ws.socket?.readyState !== ws.OPEN) {
            try { 
                sock.ws.close() 
            } catch (e) { }

            sock.ev.removeAllListeners()
            let i = global.conns.indexOf(sock)              
            if (i >= 0) {
                delete global.conns[i]
                global.conns.splice(i, 1)
                console.log(chalk.bold.redBright(`[SUB-BOT +${path.basename(pathJadiBot)}] Sesión eliminada por inactividad/cierre.`))
            }
        }
    }, 60000) // Check every 60 seconds


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
}

// Retaining the original utility functions for compatibility, even though 'sleep' and 'delay' aren't used in the core logic above.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}