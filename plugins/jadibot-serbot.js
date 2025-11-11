

import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
// Se eliminan las importaciones de child_process ya que se quitó la función exec por seguridad.
// const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

// NOTA DE SEGURIDAD: Se eliminan las variables Base64 (crm1-crm4, drm1-drm2)
// y el bloque 'exec' para prevenir la ejecución de comandos shell maliciosos o no autorizados.

// --- Variables de mensaje ---
let rtx = "*︰꯭𞋭🏴‍☠️ CONEXIÓN SUBBOT*\n\n━⧽ MODO CODIGO QR\n\n✰ 𝖯𝖺𝗌𝗈𝗌 𝖽𝖾 𝗏𝗂𝗇𝖼𝗎𝗅𝖺𝖼𝗂𝗈́𝗇:\n\n• En la Pc o tu otro teléfono escanea este qr.\n\n➪ Toca en dispositivos vinculados.\n\n➪ Selecciona Vincular con el número de teléfono.\n\n➪ Escanea el código QR.\n\n★ 𝗡𝗼𝘁𝗮: Este código expira después de los 45 segundos."
let rtx2 = "*︰꯭𞋭🏴‍☠️ CONEXIÓN SUBBOT*\n\n━⧽ MODO CODIGO\n\n✰ 𝖯𝖺𝗌𝗈𝗌 𝖽𝖾 𝗏𝗂𝗇𝖼𝗎𝗅𝖺𝖼𝗂𝗈́𝗇:\n\n➪ Ve a la esquina superior derecha.\n\n➪ Toca en dispositivos vinculados.\n\n➪ Selecciona Vincular con el número de teléfono.\n\n➪ Pega el siguiente código que te enviaremos.\n\n★ 𝗡𝗼𝘁𝖺: 𝖤𝗌𝗍𝖾 𝖼𝗈𝖽𝗂𝗀𝗈 𝗌𝗈𝗅𝗈 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖺 𝖾𝗇 𝖾𝗅 𝗇𝗎́𝗆𝖾𝗋𝗈 𝗊𝗎𝖾 𝗅𝗈 𝗌𝗈𝗅𝗂𝖼𝗂𝗍𝗈́."

// --- Configuración y Contexto Global ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Se añaden variables no definidas en el código original, asumiendo valores comunes
const emoji2 = '🛑' // Usado para límite de bots
const emoji = '❌' // Usado para errores de Base64
const wm = 'Luffy Bot' // Usado si se requiere el nombre del bot en botones (comentado)

const blackJBOptions = {}
if (!(global.conns instanceof Array)) global.conns = []


// --- Handler Principal (Exportación por defecto) ---
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    // Cooldown Check
    let cooldownTime = 120000 
    let userSubsTime = global.db.data.users[m.sender].Subs || 0
    let timeRemaining = (userSubsTime + cooldownTime) - new Date()
    
    if (timeRemaining > 0) return conn.reply(m.chat, `🕐 Debes esperar ${msToTime(timeRemaining)} para volver a vincular un *Sub-Bot.*`, m)
    
    // Sub-Bot Limit Check
    const MAX_SUBBOTS = 30
    const subBots = global.conns.filter((c) => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)
    const subBotsCount = subBots.length
    if (subBotsCount === MAX_SUBBOTS) {
        return m.reply(`${emoji2} No se han encontrado servidores para *Sub-Bots* disponibles.`)
    }
    
    // Session Path Setup
    let who = m.sender
    let id = `${who.split`@`[0]}`
    
    // Usamos 'jadi' si está definida globalmente, sino la ruta generará error
    const BASE_SESSION_DIR = global.jadi ? `./${global.jadi}/` : './sessions/subbots/' 
    let pathJadiBot = path.join(BASE_SESSION_DIR, id) 

    if (!fs.existsSync(pathJadiBot)){
        fs.mkdirSync(pathJadiBot, { recursive: true })
    }
    
    // Preparar opciones
    blackJBOptions.pathblackJadiBot = pathJadiBot // Manteniendo tu nombre de variable original
    blackJBOptions.m = m
    blackJBOptions.conn = conn
    blackJBOptions.args = args
    blackJBOptions.usedPrefix = usedPrefix
    blackJBOptions.command = command
    blackJBOptions.fromCommand = true
    
    await luffyJadiBot(blackJBOptions) // Llamada a la función con el nombre solicitado
    
    global.db.data.users[m.sender].Subs = new Date * 1
} 

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 


// --- Función Principal de JadiBot (Exportada como luffyJadiBot) ---
export async function luffyJadiBot(options) {
    // Se renombra pathblackJadiBot a pathJadiBot para mejor legibilidad local, pero se mantiene la propiedad en options
    let { pathblackJadiBot: pathJadiBot, m, conn, args, usedPrefix, command } = options
    
    if (command === 'code') {
        command = 'qr'; 
        args.unshift('code')
    }
    
    const isCodeMode = args.some(arg => arg.trim() === '--code' || arg.trim() === 'code')
    let txtCode, codeBot, txtQR
    
    if (isCodeMode) {
        args[0] = args[0].replace(/^--code$|^code$/, "").trim()
        if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
        if (args[0] == "") args[0] = undefined
    }
    
    const pathCreds = path.join(pathJadiBot, "creds.json")
    
    if (!fs.existsSync(pathJadiBot)){
        fs.mkdirSync(pathJadiBot, { recursive: true })
    }
    
    // Manejo de credenciales Base64
    try {
        if (args[0] && args[0] !== undefined) {
             const credsData = Buffer.from(args[0], "base64").toString("utf-8")
             JSON.parse(credsData) 
             fs.writeFileSync(pathCreds, credsData, null, '\t')
        }
    } catch {
        conn.reply(m.chat, `${emoji} Uso incorrecto o credenciales Base64 no válidas. Use correctamente el comando » ${usedPrefix + command} code`, m)
        return
    }

    // *** ELIMINADO: Bloque 'exec' con comandos shell. ***
    
    // El resto de la función DEBE ir fuera del bloque 'exec'
    
    let { version } = await fetchLatestBaileysVersion()
    
    const msgRetryCache = new NodeCache()
    // saveState ya no es necesario, se usa saveCreds directamente
    const { state, saveCreds } = await useMultiFileAuthState(pathJadiBot) 
    
    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
        msgRetryCache,
        browser: isCodeMode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Luffy (Sub Bot)', 'Chrome','2.0.0'], // Cambiado a Luffy
        version: version,
        generateHighQualityLinkPreview: true
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update
        if (isNewLogin) sock.isInit = false
        
        // MODO QR
        if (qr && !isCodeMode) {
            if (m?.chat) {
                txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
            } else {
                return 
            }
            if (txtQR && txtQR.key) {
                setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }).catch(() => {})}, 45000) // 45 segundos según rtx
            }
            return
        } 
        
        // MODO CÓDIGO
        if (qr && isCodeMode) {
            let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
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
        const userJid = `${path.basename(pathJadiBot)}@s.whatsapp.net`
        const logMsg = (msg) => console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ ${msg}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))


        if (connection === 'close') {
            if (reason === 428) {
                logMsg(`La conexión (+${path.basename(pathJadiBot)}) fue cerrada inesperadamente. Intentando reconectar...`)
                await creloadHandler(true).catch(console.error)
            }
            if (reason === 408) {
                logMsg(`La conexión (+${path.basename(pathJadiBot)}) se perdió o expiró. Razón: ${reason}. Intentando reconectar...`)
                await creloadHandler(true).catch(console.error)
            }
            if (reason === 440) {
                logMsg(`La conexión (+${path.basename(pathJadiBot)}) fue reemplazada por otra sesión activa.`)
                try {
                    if (options.fromCommand) m?.chat ? await conn.sendMessage(userJid, {text : '*HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR*\n\n> *SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE*' }, { quoted: m || null }).catch(() => {}) : ""
                } catch (error) {
                    console.error(chalk.bold.yellow(`Error 440 no se pudo enviar mensaje a: +${path.basename(pathJadiBot)}`))
                }
            }
            if (reason == 405 || reason == 401) {
                logMsg(`La sesión (+${path.basename(pathJadiBot)}) fue cerrada. Credenciales no válidas o dispositivo desconectado.`)
                try {
                    if (options.fromCommand) m?.chat ? await conn.sendMessage(userJid, {text : '*SESIÓN PENDIENTE*\n\n> *INTENTÉ NUEVAMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }).catch(() => {}) : ""
                } catch (error) {
                    console.error(chalk.bold.yellow(`Error 405 no se pudo enviar mensaje a: +${path.basename(pathJadiBot)}`))
                }
                fs.rmdirSync(pathJadiBot, { recursive: true })
            }
            if (reason === 500) {
                logMsg(`Conexión perdida en la sesión (+${path.basename(pathJadiBot)}). Borrando datos...`)
                if (options.fromCommand) m?.chat ? await conn.sendMessage(userJid, {text : '*CONEXIÓN PÉRDIDA*\n\n> *INTENTÉ MANUALMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }).catch(() => {}) : ""
                return creloadHandler(true).catch(console.error)
            }
            if (reason === 515) {
                logMsg(`Reinicio automático para la sesión (+${path.basename(pathJadiBot)}).`)
                await creloadHandler(true).catch(console.error)
            }
            if (reason === 403) {
                logMsg(`Sesión cerrada o cuenta en soporte para la sesión (+${path.basename(pathJadiBot)}).`)
                fs.rmdirSync(pathJadiBot, { recursive: true })
            }

            // Limpieza de global.conns
            sock.ev.removeAllListeners()
            let i = global.conns.indexOf(sock)              
            if (i >= 0) { 
                delete global.conns[i]
                global.conns.splice(i, 1)
            }
        } // Fin de connection === 'close'
        
        if (global.db.data == null && typeof loadDatabase === 'function') loadDatabase()
        if (connection == `open`) {
            if (!global.db.data?.users && typeof loadDatabase === 'function') loadDatabase()
            
            let userName, userJid 
            userName = sock.authState.creds.me.name || 'Anónimo'
            userJid = sock.authState.creds.me.jid || `${path.basename(pathJadiBot)}@s.whatsapp.net`
            console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))
            sock.isInit = true
            global.conns.push(sock)

            m?.chat ? await conn.sendMessage(m.chat, {text: args[0] ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` : `@${m.sender.split('@')[0]}, Te conectaste a Monkey D Luffy como (Subbot) con exito.`, mentions: [m.sender]}, { quoted: m }) : ''

        }
    } // Fin de connectionUpdate

    // Limpieza de inactividad
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

    // Recarga de handler
    let handlerModule = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
        try {
            const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
            if (Object.keys(Handler || {}).length) handlerModule = Handler
        } catch (e) {
            console.error('⚠️ Nuevo error: ', e)
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
        sock.credsUpdate = saveCreds.bind(sock, true) // saveCreds necesita 'true' si lo usas en Baileys
        sock.ev.on("messages.upsert", sock.handler)
        sock.ev.on("connection.update", sock.connectionUpdate)
        sock.ev.on("creds.update", sock.credsUpdate)
        isInit = false
        return true
    }
    
    creloadHandler(false)
} // Fin de luffyJadiBot

// --- Funciones de utilidad ---
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds
    return minutes + ' m y ' + seconds + ' s '
}