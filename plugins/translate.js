import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

const handler = async (m, { args, usedPrefix, command, conn }) => {
    // Mensaje de ayuda corregido con las variables bien interpoladas
    const msg = `☠️ *¡Yōhō~ nakama!* ☠️\n\nEscribe el *(idioma)* y el *(texto)* que deseas traducir. ¡Luffy y su tripulación te ayudarán con eso! 🌊\n\n📌 *Ejemplo:*\n${usedPrefix + command} en Hola mundo`;

    // Si no hay argumentos y no se está respondiendo a un mensaje, enviar ayuda
    if (!args || !args[0]) {
        if (!m.quoted) return m.reply(msg);
    }

    let lang = args[0];
    let text = args.slice(1).join(' ');
    const defaultLang = 'es';

    // Lógica para detectar si el primer argumento es un idioma (2 letras) o texto
    if ((args[0] || '').length !== 2) {
        lang = defaultLang;
        text = args.join(' ');
    }

    // Si no hay texto en el comando, intentar tomarlo del mensaje respondido (quoted)
    if (!text && m.quoted && m.quoted.text) {
        text = m.quoted.text;
    }

    // Si después de todo sigue sin haber texto, mandar el mensaje de ayuda
    if (!text) return m.reply(msg);

    try {
        // Intento 1: Google Translate API
        // Nota: Asegúrate de pasar el objeto correctamente { to: lang }
        const result = await translate(text, { to: lang, autoCorrect: true });
        
        await m.reply(`🌐 *Traducción (${lang}):*\n\n${result.text}`);

    } catch (e) {
        // Intento 2: Fallback con API externa (LolHuman)
        try {
            // Mensaje de espera (asumiendo que 'wait' está definido en tu bot, si no, usa un string)
            const waitMsg = global.wait || '⏳ *Procesando traducción...*';
            await m.reply(waitMsg);

            // URL corregida con interpolación ${}
            const lol = await fetch(`https://api.lolhuman.xyz/api/translate/auto/${lang}?apikey=lolkeysapi&text=${encodeURIComponent(text)}`);
            const loll = await lol.json();
            
            const result2 = loll.result.translated;
            
            await m.reply(`🌍 *Traducción (${lang}):*\n\n${result2}`);

        } catch (e2) {
            // Manejo de error final
            console.error(e2); // Es bueno ver el error en la consola
            await m.reply(`❌ *¡Gomen! El sombrero de paja no pudo con esta traducción...* Intenta con otro idioma o texto.`, m.chat);
        }
    }
};

handler.command = ['translate', 'traducir', 'trad'];
handler.register = true;

export default handler;