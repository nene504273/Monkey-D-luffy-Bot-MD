import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';
const haremFilePath = './src/database/harem.json';

const cooldowns = {};

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('❀ No se pudo cargar el archivo characters.json.');
    }
}

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8');
    } catch (error) {
        throw new Error('❀ No se pudo guardar el archivo characters.json.');
    }
}

let handler = async (m, { conn }) => {
    const userId = m.sender;
    const now = Date.now();

    if (cooldowns[userId] && now < cooldowns[userId]) {
        const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000);
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        return await conn.reply(m.chat, `《✧》Debes esperar *${minutes} minutos y ${seconds} segundos* para volver a reclamar.`, m);
    }

    if (m.quoted && m.quoted.text) {
        try {
            const characters = await loadCharacters();
            const characterIdMatch = m.quoted.text.match(/✦ ID: \*(.+?)\*/);

            if (!characterIdMatch) {
                await conn.reply(m.chat, '《✧》No se pudo encontrar el ID del personaje en el mensaje citado.', m);
                return;
            }

            const characterId = characterIdMatch[1];
            const character = characters.find(c => c.id === characterId);

            if (!character) {
                await conn.reply(m.chat, '《✧》El mensaje citado no es un personaje válido.', m);
                return;
            }

            if (character.user && character.user !== userId) {
                await conn.reply(
                    m.chat,
                    `《✧》El personaje *${character.name}* ya ha sido reclamado por @${character.user.split('@')[0]}, inténtalo a la próxima :v.`,
                    m,
                    { mentions: [character.user] }
                );
                return;
            }

            character.user = userId;
            character.status = "Reclamado";

            await saveCharacters(characters);

            await conn.reply(
                m.chat,
                `╔═══════ • ° ❁⊕❁ ° • ═══════╗\n` +
                `⟢ ✦ ¡Reclamo exitoso! ✦\n` +
                `┃ Has reclamado a *${character.name}* como tu waifu 💖\n` +
                `╚═══════ • ° ❁⊕❁ ° • ═══════╝`,
                m
            );

            cooldowns[userId] = now + 30 * 60 * 1000; // 30 minutos

        } catch (error) {
            await conn.reply(m.chat, `✘ Error al reclamar el personaje: ${error.message}`, m);
        }

    } else {
        await conn.reply(m.chat, '《✧》Debes citar un personaje válido para reclamar.', m);
    }
};

handler.help = ['claim'];
handler.tags = ['gacha'];
handler.command = ['c', 'claim', 'reclamar'];
handler.group = true;

export default handler;
