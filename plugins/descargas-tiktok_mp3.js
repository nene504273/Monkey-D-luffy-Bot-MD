import fetch from 'node-fetch'

// Configuración del servicio
const SERVICE_KEY = 'LUFFY-GEAR4'
const BASE_API = 'https://api.alyacore.xyz/dl/tiktokmp3'

const tiktokAudioHandler = async (m, { conn, text, usedPrefix, command }) => {
    // Validación inicial: se requiere un enlace
    if (!text || !text.trim()) {
        return conn.sendMessage(m.chat, { text: '🌐 *Por favor, ingresa el enlace del video de TikTok.*' }, { quoted: m })
    }

    // Notificar inicio de procesamiento
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
        // Construir endpoint con parámetros
        const requestUrl = `${BASE_API}?url=${encodeURIComponent(text)}&key=${SERVICE_KEY}`
        
        // Consultar API
        const apiResponse = await fetch(requestUrl)
        const responseData = await apiResponse.json()

        // Verificar estructura de respuesta
        if (!responseData?.status || !responseData?.data?.dl) {
            throw new Error('Respuesta de API inválida o enlace no procesable')
        }

        const { dl: audioLink, thumbnail, title } = responseData.data

        // Descargar miniatura para la previsualización
        const imageBuffer = await fetch(thumbnail).then(res => res.buffer())

        // Preparar mensaje de audio con metadata
        const audioPayload = {
            audio: { url: audioLink },
            mimetype: 'audio/mpeg',
            fileName: `TikTok_Audio_${Date.now()}.mp3`,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    mediaType: 2,
                    mediaUrl: text,
                    title: title?.slice(0, 100) || 'Audio de TikTok',
                    sourceUrl: text,
                    thumbnail: imageBuffer
                }
            }
        }

        // Enviar el audio
        await conn.sendMessage(m.chat, audioPayload, { quoted: m })

        // Confirmar éxito
        await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } })

    } catch (err) {
        console.error('Fallo en descarga de audio TikTok:', err)
        // Reacción de error
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
        // Mensaje de fallo
        await conn.sendMessage(m.chat, { 
            text: '❌ *Ocurrió un error al procesar el audio.*\nVerifica que el enlace sea válido y que el video contenga audio.' 
        }, { quoted: m })
    }
}

// Metadatos del comando
tiktokAudioHandler.help = ['tiktokmp3 <url>']
tiktokAudioHandler.tags = ['descargas']
tiktokAudioHandler.command = ['tiktokmp3']
tiktokAudioHandler.group = true
tiktokAudioHandler.register = true
tiktokAudioHandler.coin = 2

export default tiktokAudioHandler