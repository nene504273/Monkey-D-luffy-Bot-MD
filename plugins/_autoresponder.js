import { sticker } from '../lib/sticker.js'

// ==========================================
// FUNCIONES DEL SCRAPER DE GEMINI (CON FILTRO ANTI-MAPS)
// ==========================================
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'

function btoa2(str) { return Buffer.from(str, 'utf8').toString('base64') }

function walkDeep(node, visit, depth = 0, maxDepth = 7) {
    if (depth > maxDepth) return
    if (visit(node, depth) === false) return
    if (Array.isArray(node)) {
        for (const x of node) walkDeep(x, visit, depth + 1, maxDepth)
    } else if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) walkDeep(node[k], visit, depth + 1, maxDepth)
    }
}

function isLikelyText(s) {
    if (typeof s !== 'string') return false
    const t = s.trim()
    // FILTRO ESTRICTO: Si contiene rumbos de mapas o urls de google maps, lo ignoramos
    if (t.length < 2) return false
    if (/^https?:\/\//i.test(t)) return false
    if (t.includes('googleusercontent.com') || t.includes('maps.google') || t.includes('vt/data=')) return false
    return t.length >= 3 || /\s/.test(t)
}

function pickBestTextFromAny(parsed) {
    const found = []
    walkDeep(parsed, (n) => { if (typeof n === 'string' && isLikelyText(n)) found.push(n.trim()) })
    found.sort((a, b) => b.length - a.length) // El texto más largo suele ser la respuesta real
    return found[0] || ''
}

function findInnerPayloadString(outer) {
    const candidates = []
    const add = (s) => { if (typeof s === 'string' && s.trim()) candidates.push(s.trim()) }
    add(outer?.[0]?.[2]); add(outer?.[2]); add(outer?.[0]?.[0]?.[2])
    walkDeep(outer, (n) => {
        if (typeof n === 'string' && (n.trim().startsWith('[') || n.trim().startsWith('{')) && n.length > 20) add(n)
    }, 0, 5)
    for (const s of candidates) { try { JSON.parse(s); return s } catch {} }
    return null
}

function parseStream(data) {
    const chunks = Array.from(data.matchAll(/^\d+\r?\n([\s\S]+?)\r?\n(?=\d+\r?\n|$)/gm)).map(m => m[1]).reverse()
    let bestText = ''
    for (const c of chunks) {
        try {
            const parsed = JSON.parse(findInnerPayloadString(JSON.parse(c)))
            const text = pickBestTextFromAny(parsed)
            if (text.length > bestText.length) bestText = text
        } catch {}
    }
    return { text: bestText.replace(/\*\*(.+?)\*\*/g, '*$1*').trim() }
}

async function getAnonCookie() {
    const r = await fetch('https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&hl=en-US&rt=c', {
        method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8', 'user-agent': UA },
        body: 'f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&',
    })
    return r.headers.get('set-cookie').split(';')[0]
}

async function getXsrfToken(cookieHeader) {
    try {
        const res = await fetch('https://gemini.google.com/app', { headers: { 'user-agent': UA, cookie: cookieHeader } })
        const html = await res.text()
        return html.match(/"SNlM0e":"([^"]+)"/)?.[1] || null
    } catch { return null }
}

async function askGemini(prompt) {
    const cookie = await getAnonCookie()
    const xsrf = await getXsrfToken(cookie)
    const payload = [[prompt], ['es-ES'], null]
    const response = await fetch('https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?hl=es-ES&rt=c', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8', 'user-agent': UA, 'x-same-domain': '1', cookie },
        body: new URLSearchParams({ 'f.req': JSON.stringify([null, JSON.stringify(payload)]), at: xsrf })
    })
    return parseStream(await response.text())
}

// ==========================================
// HANDLER PRINCIPAL
// ==========================================

let handler = m => m
handler.all = async function (m, {conn}) {
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    
    if (m.isBot || !m.text || !chat.autoresponder || chat.isBanned || !user.registered) return 

    let prefixRegex = new RegExp('^[' + (opts['prefix'] || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
    if (prefixRegex.test(m.text)) return true

    if (m.mentionedJid.includes(this.user.jid) || (m.quoted && m.quoted.sender === this.user.jid)) {
        if (/menu|estado|bots|serbot|video|audio|piedra|papel|tijera/i.test(m.text)) return !0

        await this.sendPresenceUpdate('composing', m.chat)

        try {
            // PROMPT PARA HABLAR NORMAL PERO CON ONDA
            let promptIA = `Instrucciones: Actúa como ${botname}. Sé carismático, divertido y un poco sarcástico. Responde de forma natural y fluida, como una persona real en un chat de WhatsApp. NUNCA envíes enlaces, links de mapas o URLs de ningún tipo.
Pregunta del usuario: ${m.text}`

            let res = await askGemini(promptIA)
            
            if (res.text && res.text.length > 5) {
                await this.reply(m.chat, res.text, m)
            } else {
                // Si el filtro borró todo por error o Gemini fue muy corto
                await this.reply(m.chat, "No sé ni qué decirte a eso, me dejaste pensando... 🤔", m)
            }
        } catch (e) {
            console.error('Error en Gemini:', e)
        }
    }
    return true
}

export default handler