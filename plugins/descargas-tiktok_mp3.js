import fetch from 'node-fetch'

const API_URL = 'https://api.alyacore.xyz/dl/tiktokmp3'
const API_KEY = 'LUFFY-GEAR4'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.trim()) {
        return conn.sendMessage(m.chat, { 
            text: '🌐 *Falta el enlace.*\nEjemplo: `#tiktokmp3 https://vt.tiktok.com/ZS91Etu8w/`' 
        }, { quoted: m })
    }

    // Enviar un mensaje de "procesando" visible
    const waitingMsg = await conn.sendMessage(m.chat, { text: '⏳ *Descargando audio de TikTok...*' }, { quoted: m })

    try {
        const requestUrl = `${API_URL}?url=${encodeURIComponent(text)}&key=${API_KEY}`
        const response = await fetch(requestUrl)
        const json = await response.json()

        if (!json?.status || !json?.data?.dl) {
            throw new Error('La API no devolvió enlace de audio válido')
        }

        const { dl: audioUrl, title } = json.data

        // Enviar el audio como DOCUMENTO MP3 (más fiable que mensaje de audio con externalAdReply)
        await conn.sendMessage(m.chat, {
            document: { url: audioUrl },
            fileName: `${title?.replace(/[^\w\s]/gi, '') || 'tiktok_audio'}.mp3`,
            mimetype: 'audio/mpeg',
            caption: `🎵 *${title || 'Audio TikTok'}*\n🔗 ${text}`
        }, { quoted: m })

        // Eliminar mensaje de "procesando" para limpiar chat
        await conn.sendMessage(m.chat, { delete: waitingMsg.key })

    } catch (error) {
        console.error('Error TikTok Audio:', error)
        await conn.sendMessage(m.chat, { 
            text: '❌ *No se pudo obtener el audio.*\nVerifica que el enlace sea público y tenga audio.' 
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