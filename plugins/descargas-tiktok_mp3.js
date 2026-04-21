import fetch from 'node-fetch'

const API_URL = 'https://api.alyacore.xyz/dl/tiktokmp3'
const API_KEY = 'LUFFY-GEAR4'

const handler = async (m, { conn, text }) => {
    if (!text?.trim()) {
        return conn.sendMessage(m.chat, { 
            text: '🌐 *Falta el enlace.*\nEjemplo: `#tiktokmp3 https://vt.tiktok.com/ZS91Etu8w/`' 
        }, { quoted: m })
    }

    // Mensaje temporal de espera (se borrará después)
    const waitMsg = await conn.sendMessage(m.chat, { text: '⏳ *Procesando audio...*' }, { quoted: m })

    try {
        const response = await fetch(`${API_URL}?url=${encodeURIComponent(text)}&key=${API_KEY}`)
        const json = await response.json()

        if (!json?.status || !json?.data?.dl) throw new Error('Audio no disponible')

        const { dl: audioUrl, title } = json.data

        // 🔥 Envío como AUDIO nativo de WhatsApp (sin contextInfo complejo)
        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title || 'tiktok_audio'}.mp3`,
            ptt: false   // false = se muestra como música, no como nota de voz
        }, { quoted: m })

        // Borrar mensaje de "procesando"
        await conn.sendMessage(m.chat, { delete: waitMsg.key })

    } catch (err) {
        console.error('Error audio TikTok:', err)
        await conn.sendMessage(m.chat, { 
            text: '❌ *No se pudo obtener el audio.* Verifica el enlace.' 
        }, { quoted: m })
    }
}

handler.help = ['tiktokmp3 <url>']
handler.tags = ['descargas']
handler.command = ['ttmp3']
handler.group = true
handler.register = true
handler.coin = 2

export default handler