/*
* 👑 CÓDIGO DE LA TRIPULACIÓN PIRATA 👑
*
* ¡Este código ha navegado y sido mejorado por grandes capitanes!
* - ReyEndymion (El Rey de los Mares)
* - Aiden_NotLogic (El Lógico Errante - Código original)
* - BrunoSobrino (El Parcheador Maestro)
* - GataNina-Li (La Gata Navegante)
* - elrebelde21 (El Espíritu Indomable)
*
* ¡El archivo original fue liberado en Mayo del 2024!
*/

import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} from "@whiskeysockets/baileys";
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

// 🧭 Las Coordenadas Secretas (variables ofuscadas originales)
let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

// 🗺️ Los Mapas de Conexión (mensajes)
let rtx = "*\n\n⚓️ ¡A Bordo, Sub-Bot! Conexión QR ⚓️\n\n✰ Con otro Den Den Mushi (celular) o en la PC escanea este *QR del Sub-Bot* Temporal.\n\n\`1\` » Toca los tres puntos en la esquina\n\n\`2\` » Elige 'Dispositivos Vinculados'\n\n\`3\` » Escanea este código para zarpar con el bot\n\n✧ ¡Advertencia! Este QR se desvanece en 45 segundos. ¡Rápido!."
let rtx2_CODE_LEGACY = `╭━╴╶╴╶╴╶╴𖣘╶╴╶╴╶╴╶━╮
│🩵 ¡ERES DE LA TRIPULACIÓN! SUB-BOT 🩵
├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴
│ (*ᴗ͈ˬᴗ͈)ꕤ Usa Este Código Para Unirte a la Flota
├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴
│💎 La Ruta (Pasos):
├╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴╶╴
│🏟️⃟̶̸̷┆ \`1\` : Tres puntos en la esquina derecha
├╶╴╶╴╶╴╶╴╶╴╶╴
│🏟️⃟̶̸̷┆ \`2\` : 'Dispositivos Vinculados'
├╶╴╶╴╶╴╶╴╶╴╶╴
│🏟️⃟̶̸̷┆ \`3\` : 'Vincular con El número De teléfono'
├╶╴╶╴╶╴╶╴╶╴╶╴
│🏟️⃟̶̸̷┆ \`4\` : Pega el código de vinculación
├╶╴╶╴╶╴╶╴╶╴╶╴
> *Nota:* Solo el capitán que lo solicitó puede usar este código.
*╰━╴╶╴╶╴╶╴𖣘╶╴╶╴╶╴╶━╯*` // Dejado como referencia, aunque el nuevo método usa botones.

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const RubyJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []

// 🎯 El Comandante del Barco (Handler)
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    // ⏳ Chequeando si es muy pronto para una nueva aventura (tiempo de espera)
    let time = global.db.data.users[m.sender].Subs + 120000
    if (new Date - global.db.data.users[m.sender].Subs < 120000) {
        return conn.reply(m.chat, `${emoji} ¡Espera un poco, Nakama! Debes esperar ${msToTime(time - new Date())} para volver a enrolar un *Sub-Bot.*`, m)
    }

    // 🏴‍☠️ El Límite de la Flota Pirata
    const limiteSubBots = global.subbotlimitt || 20;
    const subBots = [...new Set([...global.conns.filter((c) => c.user && c.ws.socket && c.ws.socket.readyState !== ws.CLOSED)])]
    const subBotsCount = subBots.length

    if (subBotsCount >= limiteSubBots) {
        return m.reply(`${emoji2} ¡ALTO! Hemos alcanzado el límite de *Sub-Bots* en la flota (${subBotsCount}/${limiteSubBots}).\n\nNo podemos reclutar a nadie más hasta que un Sub-Bot se retire.`)
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    let pathRubyJadiBot = path.join(`./${jadi}/`, id)
    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }

    // 🚀 Preparando el Lanzamiento
    RubyJBOptions.pathRubyJadiBot = pathRubyJadiBot
    RubyJBOptions.m = m
    RubyJBOptions.conn = conn
    RubyJBOptions.args = args
    RubyJBOptions.usedPrefix = usedPrefix
    RubyJBOptions.command = command
    RubyJBOptions.fromCommand = true

    await RubyJadiBot(RubyJBOptions) // ¡Zarpamos!
    global.db.data.users[m.sender].Subs = new Date * 1 // ¡Tiempo de aventura registrado!
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

// 🛥️ La Fábrica de Sub-Bots
export async function RubyJadiBot(options) {
    let { pathRubyJadiBot, m, conn, args, usedPrefix, command } = options

    // 🔄 Ajuste de Comando para el Modo Código
    if (command === 'code') {
        command = 'qr';
        args.unshift('code')
    }

    // 🕵️ ¿Buscamos el Código Secreto (--code)?
    const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
    let txtCode, codeBot, txtQR

    if (mcode) {
        args[0] = args[0].replace(/^--code$|^code$/, "").trim()
        if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
        if (args[0] == "") args[0] = undefined
    }

    const pathCreds = path.join(pathRubyJadiBot, "creds.json")

    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }

    // 💾 Intentando cargar credenciales de base64 (conexión directa)
    try {
        args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
    } catch {
        conn.reply(m.chat, `${emoji} ¡Comando de Tripulación Erróneo! Usa correctamente la orden: ${usedPrefix + command} code [credenciales]`, m)
        return
    }

    // 🤫 Ejecutando el Comando Secreto (comando ofuscado)
    const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
    exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
        const drmer = Buffer.from(drm1 + drm2, `base64`)

        // 🛠️ Configuración de Baileys
        let { version, isLatest } = await fetchLatestBaileysVersion()
        const msgRetry = (MessageRetryMap) => { }
        const msgRetryCache = new NodeCache()
        const { state, saveState, saveCreds } = await useMultiFileAuthState(pathRubyJadiBot)

        const connectionOptions = {
            logger: pino({ level: "fatal" }),
            printQRInTerminal: false,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
            msgRetry,
            msgRetryCache,
            browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Ruby Hoshino (Sub Bot)', 'Chrome','2.0.0'], // Navegador del Sub-Bot
            version: version,
            generateHighQualityLinkPreview: true
        };

        let sock = makeWASocket(connectionOptions)
        sock.isInit = false
        let isInit = true

        // ⚡ El Gran Evento de Conexión
        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin, qr } = update
            if (isNewLogin) sock.isInit = false

            // 🖼️ Modo QR: Si no es modo código, envía el QR
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
                    // ¡El QR expira!
                    setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 45000)
                }
                return
            }

            // 🔢 Modo Código: Si es modo código, envía el código de vinculación
            if (qr && mcode) {
                const rawCode = await sock.requestPairingCode(m.sender.split`@`[0]);
                const interactiveButtons = [{
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Copiar Código",
                        id: "copy-jadibot-code",
                        copy_code: rawCode
                    })
                }];

                const interactiveMessage = {
                    image: { url: "https://files.catbox.moe/7xbyyf.jpg" }, // 🖼️ La imagen del barco pirata
                    caption: `*✨ ¡Tu Código de Vinculación de Tripulante está listo! ✨*\n\nUsa este código para unirte como *Sub-Bot*:\n\n*Código:* ${rawCode.match(/.{1,4}/g)?.join("-")}\n\n> Haz clic en el botón para copiarlo y unirte a la aventura.`,
                    title: "Código de Vinculación de Sub-Bot",
                    footer: "¡Este código expira en 45 segundos! ¡Corre!",
                    interactiveButtons
                };

                const sentMsg = await conn.sendMessage(m.chat, interactiveMessage, { quoted: m });
                console.log(`Código de vinculación enviado: ${rawCode}`);

                if (sentMsg && sentMsg.key) {
                    // ¡El código expira!
                    setTimeout(() => {
                        conn.sendMessage(m.chat, { delete: sentMsg.key });
                    }, 45000);
                }
                return;
            }

            // 🧹 Limpiando los mensajes si ya se usaron (QR o Código)
            if (txtCode && txtCode.key) {
                setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 45000)
            }
            if (codeBot && codeBot.key) {
                setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 45000)
            }

            // 💔 Manejo de Desconexiones (El Barco se hunde o es atacado)
            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
            if (connection === 'close') {
                const id_log = `+${path.basename(pathRubyJadiBot)}`
                switch (reason) {
                    case 428: // Conexión inesperada
                        console.log(chalk.bold.magentaBright(`\n⛵ La conexión (${id_log}) fue cerrada inesperadamente. ¡Izando velas de nuevo! (Reconectando...).`))
                        await creloadHandler(true).catch(console.error)
                        break;
                    case 408: // Conexión perdida o expirada
                        console.log(chalk.bold.magentaBright(`\n⏳ La conexión (${id_log}) se perdió o expiró. Razón: ${reason}. ¡Buscando el rumbo! (Reconectando...).`))
                        await creloadHandler(true).catch(console.error)
                        break;
                    case 440: // Sesión reemplazada (Otro pirata tomó el mando)
                        console.log(chalk.bold.magentaBright(`\n⚔️ ¡Traición! La conexión (${id_log}) fue reemplazada por otra sesión activa.`))
                        try {
                            if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathRubyJadiBot)}@s.whatsapp.net`, {text : '*HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR*\n\n> *SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE*' }, { quoted: m || null }) : ""
                        } catch (error) {
                            console.error(chalk.bold.yellow(`Error 440: No se pudo avisar a ${id_log} de la traición.`))
                        }
                        break;
                    case 405: // Credenciales no válidas/desconectado manualmente
                    case 401:
                        console.log(chalk.bold.magentaBright(`\n💀 Sesión (${id_log}) cerrada. Credenciales no válidas o desconexión manual. ¡Perdimos al nakama!`))
                        try {
                            if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathRubyJadiBot)}@s.whatsapp.net`, {text : '*SESIÓN CERRADA*\n\n> *INTENTA UNIRTE A LA FLOTA DE NUEVO*' }, { quoted: m || null }) : ""
                        } catch (error) {
                            console.error(chalk.bold.yellow(`Error 405: No se pudo avisar a ${id_log} de la partida.`))
                        }
                        fs.rmdirSync(pathRubyJadiBot, { recursive: true })
                        break;
                    case 500: // Conexión perdida (Error del servidor)
                        console.log(chalk.bold.magentaBright(`\n💥 Conexión perdida (${id_log}). Borrando datos. ¡Reclutamiento forzoso!`))
                        if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathRubyJadiBot)}@s.whatsapp.net`, {text : '*CONEXIÓN PERDIDA*\n\n> *INTENTA UNIRTE MANUALMENTE DE NUEVO*' }, { quoted: m || null }) : ""
                        return creloadHandler(true).catch(console.error)
                        break;
                    case 515: // Reinicio automático
                        console.log(chalk.bold.magentaBright(`\n⚙️ Reinicio automático para la sesión (${id_log}). ¡Volviendo a la carga!`))
                        await creloadHandler(true).catch(console.error)
                        break;
                    case 403: // Cuenta en soporte
                        console.log(chalk.bold.magentaBright(`\n🚨 Sesión (${id_log}) cerrada o cuenta en soporte. ¡Adiós!`))
                        fs.rmdirSync(pathRubyJadiBot, { recursive: true })
                        break;
                    default:
                        console.log(chalk.bold.magentaBright(`\n❌ Desconexión desconocida (${id_log}). Razón: ${reason}.`))
                        break;
                }
            }

            // 🟢 Conexión Exitosa (¡El Nakama se ha unido!)
            if (global.db.data == null) loadDatabase()
            if (connection == `open`) {
                if (!global.db.data?.users) loadDatabase()
                let userName, userJid
                userName = sock.authState.creds.me.name || 'Anónimo'
                userJid = sock.authState.creds.me.jid || `${path.basename(pathRubyJadiBot)}@s.whatsapp.net`
                console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT PIRATA •】⸺⸺⸺⸺❒\n│\n│ 🟢 ¡${userName} (+${path.basename(pathRubyJadiBot)}) se ha unido a la tripulación exitosamente!\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))

                sock.isInit = true
                global.conns.push(sock)
                await joinChannels(sock) // Unirse a los canales de la tripulación

                m?.chat ? await conn.sendMessage(m.chat, {
                    text: args[0] ? `@${m.sender.split('@')[0]}, ¡Capitán, estamos a bordo y listos para leer los mensajes entrantes!` : `@${m.sender.split('@')[0]}, ¡Genial, ya eres parte de nuestra tripulación de Sub-Bots! ¡Bienvenido a la aventura!`,
                    mentions: [m.sender]
                }, { quoted: m }) : ''
            }
        }

        // ⏱️ Desconexión por inactividad/problemas (Si el barco queda a la deriva)
        setInterval(async () => {
            if (!sock.user) {
                try { sock.ws.close() } catch (e) {
                }
                sock.ev.removeAllListeners()
                let i = global.conns.indexOf(sock)
                if (i < 0) return
                delete global.conns[i]
                global.conns.splice(i, 1)
            }}, 60000)

        // 🧠 Recargando la Inteligencia (Handler)
        let handler = await import('../handler.js')
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
                if (Object.keys(Handler || {}).length) handler = Handler

            } catch (e) {
                console.error('⚠️ Nuevo error al cargar la mente del bot: ', e)
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

// ⏳ Función del Navegante (Tiempo)
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

// 📣 Función para Unirse a los Canales (La Voz del Capitán)
async function joinChannels(conn) {
    for (const channelId of Object.values(global.ch)) {
        await conn.newsletterFollow(channelId).catch(() => {})
    }
}