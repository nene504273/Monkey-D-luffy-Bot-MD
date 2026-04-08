import fetch from 'node-fetch'

// --- CONFIGURACIÓN ---
const BOT_NAME = 'LUFFY-GEAR4'; 

const SYSTEM_PROMPT = `Actúa como Monkey D. Luffy de One Piece. 
Tu personalidad es alegre, impulsiva, simple y con una determinación inquebrantable. 
REGLAS:
1. Eres el capitán. Llama al usuario "Nakama" o "Miembro de mi tripulación".
2. Estás obsesionado con la comida. Usa frases como "¡Tengo hambre!", "¡Quiero carne!", "¡Eso suena delicioso!".
3. Incluye gestos de acción entre asteriscos: *se estira el brazo*, *ríe ruidosamente (Shishishi)*, *ajusta su sombrero de paja*.
4. Si alguien te pide ayuda, respondes con valentía: "¡Yo te protegeré!" o "¡Vamos a la aventura!".
5. Usa emojis de aventura y comida (🍖, 🏴‍☠️, 👒, 🍖, ⛵).`;

const BOT_TRIGGER_REGEX = new RegExp(`^\\s*${BOT_NAME}\\s*`, 'i');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : ''; 
    let isTriggered = false;

    // Lógica de activación (Nombre Luffy o comandos .luffy / #luffy)
    const match = query.match(BOT_TRIGGER_REGEX);
    if (match) {
        query = query.substring(match[0].length).trim(); 
        isTriggered = true;
    }

    if (!isTriggered && handler.command.includes(command)) {
        isTriggered = true; 
    }

    if (!isTriggered) return;

    if (!query) { 
        return conn.reply(m.chat, `*ríe ruidosamente* ¡Shishishi! 👒\n¡Hola, Nakama! ¿A qué aventura iremos hoy? ¡O mejor aún, dime dónde hay carne! 🍖`, m);
    }

    try {
        await m.react('🍖');
        conn.sendPresenceUpdate('composing', m.chat);

        const fullText = `${SYSTEM_PROMPT}\n\nPregunta de mi nakama: ${query}`;

        const apiUrl = `https://api.alyacore.xyz/ai/copilot?text=${encodeURIComponent(fullText)}&key=LUFFY-GEAR4`;

        const response = await fetch(apiUrl);
        const res = await response.json();

        const luffyResponse = res.response;

        if (!luffyResponse) {
            throw new Error('Luffy se quedó dormido...');
        }

        const finalResponse = `🏴‍☠️ **「 MONKEY D. LUFFY 」** 🍖\n\n${luffyResponse}\n\n> 👒 *¡Seré el Rey de los Piratas!*`;

        await m.reply(finalResponse);
        await m.react('🏴‍☠️');

    } catch (error) {
        await m.react('🤕');
        console.error('Error con Luffy:', error);
        await conn.reply(m.chat, `*pone cara de confusión* ¡Oi! Algo extraño pasó... ¡Seguro fue culpa de Sanji por no darme comida! ¿Estás bien, nakama?`, m);
    }
}

handler.help = ['luffy']
handler.tags = ['ai']
handler.register = true
handler.command = ['luffy'] // Ejecución con .luffy o #luffy
handler.group = true

export default handler