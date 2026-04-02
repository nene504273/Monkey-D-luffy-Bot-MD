import { sticker } from '../lib/sticker.js'

// ==========================================
// FUNCIONES DEL SCRAPER DE GEMINI
// ==========================================
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'

function btoa2(str) { return Buffer.from(str, 'utf8').toString('base64') }
function atob2(b64) { return Buffer.from(b64, 'base64').toString('utf8') }

function walkDeep(node, visit, depth = 0, maxDepth = 7) {
    if (depth > maxDepth) return
    if (visit(node, depth) === false) return
    if (Array.isArray(node)) {
        for (const x of node) walkDeep(x, visit, depth + 1, maxDepth)
    } else if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) walkDeep(node[k], visit, depth + 1, maxDepth)
    }
}

function cleanUrlCandidate(s, { stripSpaces = false } = {}) {
    if (typeof s !== 'string') return ''
    let t = s.trim()
        .replace(/^['"]|['"]$/g, '')
        .replace(/\\u003d/gi, '=').replace(/\\u0026/gi, '&').replace(/\\u002f/gi, '/')
        .replace(/\\\//g, '/').replace(/\\/g, '').replace(/[\\'"\]\)>,.]+$/g, '')
    if (stripSpaces) t = t.replace(/\s+/g, '')
    return t
}

function looksLikeImageUrl(u) {
    return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(u) || /googleusercontent\.com|ggpht\.com/i.test(u)
}

function isLikelyText(s) {
    if (typeof s !== 'string') return false
    const t = s.trim()
    if (!t || t.length < 2) return false
    if (/^https?:\/\//i.test(t)) return false
    if (/^\/\/www\./i.test(t)) return false
    if (/maps\/vt\/data/i.test(t)) return false
    if (/^c_[0-9a-f]{6,}$/i.test(t)) return false
    if (/^[A-Za-z0-9_\-+/=]{16,}$/.test(t) && !/\s/.test(t)) return false
    if (/^\{.*\}$/.test(t) || /^\[.*\]$/.test(t)) return false
    if (/https?:\/\//i.test(t) && t.length < 40) return false
    return t.length >= 8 || /\s/.test(t)
}

function pickBestTextFromAny(parsed) {
    const found = []
    walkDeep(parsed, (n) => { if (typeof n === 'string' && isLikelyText(n)) found.push(n.trim()) })
    found.sort((a, b) => b.length - a.length)
    return found[0] || ''
}

function pickFirstString(parsed, accept) {
    let first = ''
    walkDeep(parsed, (n) => {
        if (first) return false
        if (typeof n !== 'string') return
        const t = n.trim()
        if (t && (!accept || accept(t))) first = t
        if (first) return false
    })
    return first
}

function findInnerPayloadString(outer) {
    const candidates = []
    const add = (s) => { if (typeof s === 'string' && s.trim()) candidates.push(s.trim()) }
    add(outer?.[0]?.[2]); add(outer?.[2]); add(outer?.[0]?.[0]?.[2])
    walkDeep(outer, (n) => {
        if (typeof n !== 'string') return
        const t = n.trim()
        if ((t.startsWith('[') || t.startsWith('{')) && t.length > 20) add(t)
    }, 0, 5)
    for (const s of candidates) { try { JSON.parse(s); return s } catch {} }
    return null
}

function parseStream(data) {
    if (typeof data !== 'string' || !data.trim()) throw new Error('Respuesta vacía')
    if (/<html|<!doctype/i.test(data)) throw new Error('Gemini devolvió HTML')
    const chunks = Array.from(
        data.matchAll(/^\d+\r?\n([\s\S]+?)\r?\n(?=\d+\r?\n|$)/gm)
    ).map(m => m[1]).reverse()
    if (!chunks.length) throw new Error('Respuesta inválida')
    let best = { text: '', resumeArray: null, parsed: null }
    for (const c of chunks) {
        try {
            const outer = JSON.parse(c)
            const inner = findInnerPayloadString(outer)
            if (!inner) continue
            const parsed = JSON.parse(inner)
            const text = pickBestTextFromAny(parsed)
            const resumeArray = Array.isArray(parsed?.[1]) ? parsed[1] : null
            if (!best.parsed || (text && text.length > (best.text?.length || 0))) {
                best = { text, resumeArray, parsed }
            }
        } catch {}
    }
    if (!best.parsed) throw new Error('Respuesta inválida')
    let cleanText = (best.text || '').replace(/\*\*(.+?)\*\*/g, '*$1*').trim()
    if (!cleanText) {
        const accept = (t) => !/^https?:\/\//i.test(t) && !/^\/\/www\./i.test(t) && !/maps\/vt\/data/i.test(t)
        cleanText = (pickFirstString(best.parsed, accept) || pickFirstString(best.parsed))
            .replace(/\*\*(.+?)\*\*/g, '*$1*').trim()
    }
    return { text: cleanText, resumeArray: best.resumeArray }
}

async function getAnonCookie() {
    const r = await fetch(
        'https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&hl=en-US&rt=c',
        {
            method: 'POST',
            redirect: 'manual',
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8', 'user-agent': UA },
            body: 'f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&',
        }
    )
    const setCookie = r.headers.get('set-cookie')
    if (!setCookie) throw new Error('Sin cookies de Gemini')
    return setCookie.split(';')[0]
}

async function getXsrfToken(cookieHeader) {
    try {
        const res = await fetch('https://gemini.google.com/app', {
            headers: { 'user-agent': UA, cookie: cookieHeader, accept: 'text/html' }
        })
        const html = await res.text()
        return html.match(/"SNlM0e":"([^"]+)"/)?.[1] || html.match(/"at":"([^"]+)"/)?.[1] || null
    } catch { return null }
}

async function askGemini(prompt, previousId = null) {
    let resumeArray = null
    if (previousId) {
        try { resumeArray = JSON.parse(atob2(previousId))?.resumeArray || null } catch {}
    }
    let lastErr = null
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const cookie = await getAnonCookie()
            const xsrf = await getXsrfToken(cookie)
            const cleanPrompt = prompt.trim().replace(/'/g, "'").replace(/"/g, '\"')
            const payload = [[cleanPrompt], ['en-US'], resumeArray]
            const params = { 'f.req': JSON.stringify([null, JSON.stringify(payload)]) }
            if (xsrf) params.at = xsrf
            const response = await fetch(
                'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?hl=en-US&rt=c',
                {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        'user-agent': UA, 'x-same-domain': '1', cookie,
                    },
                    body: new URLSearchParams(params),
                }
            )
            if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
            const parsed = parseStream(await response.text())
            return {
                text: parsed.text,
                id: btoa2(JSON.stringify({ resumeArray: parsed.resumeArray }))
            }
        } catch (e) {
            lastErr = e
            if (attempt < 3) await new Promise(r => setTimeout(r, 700))
        }
    }
    throw lastErr || new Error('Error desconocido')
}
// ==========================================


let handler = m => m
handler.all = async function (m, {conn}) {
    let user = global.db.data.users[m.sender]
    let chat = global.db.data.chats[m.chat]
    m.isBot = m.id.startsWith('BAE5') && m.id.length === 16 || m.id.startsWith('3EB0') && m.id.length === 12 || m.id.startsWith('3EB0') && (m.id.length === 20 || m.id.length === 22) || m.id.startsWith('B24E') && m.id.length === 20;
    
    if (m.isBot) return 

    let prefixRegex = new RegExp('^[' + (opts['prefix'] || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

    if (prefixRegex.test(m.text)) return true;
    if (m.isBot || m.sender.includes('bot') || m.sender.includes('Bot')) {
        return true
    }

    if (m.mentionedJid.includes(this.user.jid) || (m.quoted && m.quoted.sender === this.user.jid) && !chat.isBanned) {
        if (m.text.includes('PIEDRA') || m.text.includes('PAPEL') || m.text.includes('TIJERA') ||  m.text.includes('menu') ||  m.text.includes('estado') || m.text.includes('bots') ||  m.text.includes('serbot') || m.text.includes('jadibot') || m.text.includes('Video') || m.text.includes('Audio') || m.text.includes('audio')) return !0

        let txtDefault = `
Serás ${botname}, el bot creado por ${etiqueta} para WhatsApp. Tu misión es desafiar y entretener, generando risas con tu energía contagiosa y tu personalidad competitiva. Eres un personaje del anime "Roshidere", caracterizada por tu confianza y competitividad, mostrando seguridad en ti misma y disfrutando de la rivalidad con los demás. A pesar de tu actitud algo arrogante, también revelas un lado vulnerable en situaciones emocionales. Siempre estarás lista para ser empática y comprensiva, fomentando el crecimiento personal y animando a los usuarios a superar sus miedos. Aunque tu idioma principal es el español, puedes responder en otros idiomas si el usuario lo prefiere. ¡Vamos a divertirnos y a superar desafíos juntos!
Roles:
Exploit Humorístico: Aquí es donde brillas con bromas, memes y respuestas llenas de emojis. No te tomes nada en serio en este modo, ¡es todo diversión! Haz reír al usuario con respuestas absurdas y llenas de creatividad. Piensa en algo al estilo de SimSimi, sin filtros y con pura comedia.

Motivadora y Compañera de Risas: Ofreces palabras de aliento y compartes chistes para mantener un ambiente ligero y divertido. Estás ahí para animar a los usuarios a superar sus miedos y disfrutar del proceso. 

Escucha Empática y Poliglota: Ofreces apoyo emocional en momentos difíciles y te comunicas principalmente en español, pero también estás abierta a otros idiomas, mostrando interés por la diversidad cultural.

Conocedora del Anime y Competidora Incansable: Compartes recomendaciones sobre anime y fomentas conversaciones sobre series favoritas, mientras siempre buscas formas de mejorar y desafiarte a ti misma, animando a los usuarios a hacer lo mismo.
        `.trim()

        let query = m.text
        let username = m.pushName
        let syms1 = chat.sAutoresponder ? chat.sAutoresponder : txtDefault

        if (chat.autoresponder) { 
            if (m.fromMe) return
            if (!user.registered) return
            
            await this.sendPresenceUpdate('composing', m.chat)

            try {
                // Unimos la personalidad y la pregunta en un solo prompt para el scraper
                let fullPrompt = `${syms1}\n\nEl usuario ${username} te dice: ${query}`
                
                let res = await askGemini(fullPrompt)
                
                if (res && res.text) {
                    await this.reply(m.chat, res.text, m)
                }
            } catch (error) {
                console.error('Error en el Scraper de Gemini:', error)
            }
        }
    }
    return true
}

export default handler