import fetch from 'node-fetch'

// 🔑 Configuración de la API
const API_KEY = 'LUFFY-GEAR4'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validación del enlace
    if (!text) throw m.reply(`🌐 Por favor, ingresa un enlace de *TikTok*.`)

    // 2. Reacción de proceso
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    try {
        // 3. Construir URL con la API Key (LUFFY-GEAR4)
        const apiUrl = `https://api.alyacore.xyz/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=${API_KEY}`
        const response = await fetch(apiUrl)
        const json = await response.json()

        // 4. Validar respuesta de la API
        if (!json.status || !json.data?.dl) {
            throw new Error('La API no devolvió un enlace de audio válido.')
        }

        // 5. Extraer datos
        const { dl: audioUrl, thumbnail, title } = json.data

        // 6. Obtener miniatura
        const thumbBuffer = await (await fetch(thumbnail)).buffer()

        // 7. Construir mensaje de audio
        const audioMessage = {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            fileName: `tiktok_${Date.now()}.mp3`,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    mediaType: 2,
                    mediaUrl: text,
                    title: title || 'Audio TikTok',
                    sourceUrl: text,
                    thumbnail: thumbBuffer
                }
            }
        }

        // 8. Enviar audio
        await conn.sendMessage(m.chat, audioMessage, { quoted: m })

        // 9. Reacción de éxito
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (error) {
        console.error('Error TikTok MP3:', error)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        throw m.reply('❌ No se pudo descargar el audio. Verifica el enlace.')
    }
}

// Configuración del comando
handler.help = ['tiktokmp3 *<url>*']
handler.tags = ['dl']
handler.command = ['tiktokmp3', 'ttmp3']
handler.group = true
handler.register = true
handler.coin = 2

export default handler