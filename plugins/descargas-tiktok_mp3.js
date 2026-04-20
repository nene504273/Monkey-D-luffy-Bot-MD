import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validación: Se debe proporcionar un enlace de TikTok
    if (!text) throw m.reply(`🌐 Por favor, ingresa un enlace de *TikTok*.`);
    
    // 2. Reacción de "en proceso"
    conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    try {
        // 3. Construir la URL de la nueva API y hacer la solicitud
        const apiUrl = `https://api.alyacore.xyz/dl/tiktokmp3?url=${encodeURIComponent(text)}&key=LUFFY-GEAR4`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        // 4. Verificar que la API respondió correctamente
        if (!data.status) {
            throw new Error('La API no pudo procesar la solicitud.');
        }

        // 5. Extraer la información relevante de la nueva estructura JSON
        const { dl, thumbnail, title } = data.data;

        // 6. Construir el objeto del mensaje de audio
        const doc = {
            audio: { url: dl },
            mimetype: 'audio/mp4',
            fileName: `tt_audio_${Date.now()}.mp3`,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    mediaType: 2,
                    mediaUrl: text,
                    title: title,
                    sourceUrl: text,
                    thumbnail: await (await conn.getFile(thumbnail)).data
                }
            }
        };

        // 7. Enviar el audio
        await conn.sendMessage(m.chat, doc, { quoted: m });

        // 8. Reacción de "éxito"
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('Error al procesar el enlace de TikTok:', error);
        // Reacción de "error"
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        throw m.reply('❌ Ocurrió un error al descargar el audio. Verifica el enlace e inténtalo de nuevo.');
    }
}

handler.help = ['tiktokmp3 *<url>*']
handler.tags = ['dl']
handler.command = ['tiktokmp3', 'ttmp3']
handler.group = true
handler.register = true
handler.coin = 2

export default handler