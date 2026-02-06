import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Verificación de enlace
    if (!args[0]) {
        return conn.reply(m.chat, `🎵 *¡Falta el enlace!* \nUso: \`${usedPrefix + command} https://youtu.be/...\``, m);
    }

    // 2. Configuración de la API
    const apiKey = 'stellar-LarjcWHD';
    const apiUrl = `https://rest.alyabotpe.xyz/dl/ytmp3?url=${encodeURIComponent(args[0])}&apikey=${apiKey}`;

    try {
        // Notificamos que estamos trabajando
        await m.reply('⏳ *Procesando audio...* por favor espera.');

        const response = await fetch(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (!response.ok) throw new Error('Servidor API fuera de línea.');

        const res = await response.json();
        
        /* DEBUG: Si sigue fallando, quita las barras '//' de la línea de abajo 
           para ver en la consola qué está respondiendo la API exactamente.
        */
        // console.log(JSON.stringify(res, null, 2));

        // 3. Extracción dinámica de datos
        // Intentamos obtener los datos del objeto 'result' (que es el estándar de Alyabot)
        const data = res.result;

        if (!res.status || !data) {
            return m.reply('❌ La API no devolvió resultados. Verifica que el enlace sea de YouTube y sea público.');
        }

        // Buscamos la URL de descarga (algunas APIs la ponen en data.url y otras en data.download)
        const downloadUrl = data.download || data.url || (data.download && data.download.url);
        const title = data.title || 'Audio descargado';
        const thumb = data.thumbnail || data.image || icons;

        if (!downloadUrl) {
            return m.reply('❌ No se encontró un enlace de descarga directo en la respuesta.');
        }

        // 4. Envío del Audio
        await conn.sendMessage(m.chat, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: 'Descarga exitosa',
                    thumbnail: await (await fetch(thumb)).buffer(),
                    sourceUrl: args[0],
                    mediaType: 1,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`⚠️ *Error de conexión:* ${e.message}`);
    }
};

handler.help = ['ytmp3'];
handler.tags = ['descargas'];
handler.command = /^(ytmp3|ytaudio|mp3)$/i;
handler.limit = true;

export default handler;