import fetch from 'node-fetch'

const API_KEY = 'LUFFY-GEAR4'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw m.reply(`🌐 Por favor, ingresa un enlace de *TikTok*.`)

    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    try {
        const apiUrl = `https://api.alyacore.xyz/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=${API_KEY}`
        console.log('[TikTok MP3] Consultando:', apiUrl)

        const response = await fetch(apiUrl)
        const json = await response.json()
        console.log('[TikTok MP3] Respuesta API:', JSON.stringify(json, null, 2))

        // Validación más detallada
        if (!json.status) {
            throw new Error(`API respondió con estado false: ${json.message || 'Sin mensaje'}`)
        }
        if (!json.data || !json.data.dl) {
            throw new Error('La API no devolvió el enlace de descarga (dl)')
        }

        const { dl: audioUrl, thumbnail, title } = json.data

        // Obtener miniatura usando conn.getFile (más fiable que fetch directo)
        const thumbData = await conn.getFile(thumbnail)

        // Construir mensaje
        const audioMessage = {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',        // Probamos con 'audio/mpeg' que es más estándar para MP3
            fileName: `tiktok_${Date.now()}.mp3`,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    mediaType: 2,
                    mediaUrl: text,
                    title: title || 'Audio TikTok',
                    sourceUrl: text,
                    thumbnail: thumbData.data
                }
            }
        }

        await conn.sendMessage(m.chat, audioMessage, { quoted: m })
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (error) {
        console.error('[TikTok MP3] Error completo:', error)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        // Mensaje de error con más información (en desarrollo puedes ver la consola)
        throw m.reply(`❌ Error al descargar: ${error.message}`)
    }
}

// ⚙️ Configuración (puedes quitar group: true si quieres probar en privado)
handler.help = ['tiktokmp3 *<url>*']
handler.tags = ['dl']
handler.command = ['tiktokmp3', 'ttmp3']
handler.group = true      // <-- Quítalo o ponlo en false para probar en privado
handler.register = true
handler.coin = 2

export default handler