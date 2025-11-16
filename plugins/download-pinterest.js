import axios from 'axios'
import baileys, { delay, jidNormalized, WAMessageStubType } from '@whiskeysockets/baileys'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, args, usedPrefix }) => {
    if (!text) return m.reply(`❀ Por favor, ingresa lo que deseas buscar por Pinterest.`)
    try {
        await m.react('🕒')
        if (text.includes("https://")) {
            // ... (Tu código actual para descarga de un solo pin por URL) ...
            let i = await dl(args[0])
            let isVideo = i.download.includes(".mp4")
            await conn.sendMessage(m.chat, { [isVideo ? "video" : "image"]: { url: i.download }, caption: i.title }, { quoted: m })
        } else {
            const results = await pins(text)
            if (!results.length) {
                return conn.reply(m.chat, `ꕥ No se encontraron resultados para "${text}".`, m)
            }
            
            // 1. Obtener las URLs de las primeras 10 imágenes
            const urls = results.slice(0, 10).map(img => img.image_large_url).filter(url => url);

            // 2. Enviar un mensaje con el resumen de la búsqueda
            let caption = `❀ Pinterest - Search ❀\n\n✧ Búsqueda » "${text}"\n✐ Resultados » ${urls.length}`
            await conn.reply(m.chat, caption, m);
            
            // 3. Iterar sobre las URLs y enviar cada imagen individualmente
            for (let i = 0; i < urls.length; i++) {
                // Pequeña pausa opcional entre envíos para evitar spam o errores
                await delay(1000); 
                
                await conn.sendMessage(m.chat, { 
                    image: { url: urls[i] }, 
                    caption: `[${i + 1}/${urls.length}] Resultado de la búsqueda.` 
                }, { quoted: m });
            }

        }
        await m.react('✔️')
    } catch (e) {
        await m.react('✖️')
        conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n` + e, m)
    }
}
// ... (El resto de tu código handler, dl y pins) ...