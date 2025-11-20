// Powered by Arlette Xz
import { promises as fs } from 'fs';
import fetch from 'node-fetch';

const FILE_PATH = './lib/characters.json';
let charactersCache = null;
let lastCacheLoad = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function loadCharacters() {
    const now = Date.now();
    if (charactersCache && (now - lastCacheLoad) < CACHE_TTL) {
        return charactersCache;
    }
    
    try {
        await fs.access(FILE_PATH);
    } catch {
        await fs.writeFile(FILE_PATH, '{}');
    }
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    charactersCache = JSON.parse(data);
    lastCacheLoad = now;
    return charactersCache;
}

function flattenCharacters(charactersData) {
    return Object.values(charactersData).flatMap(series => 
        Array.isArray(series.characters) ? series.characters : []
    );
}

function getSeriesNameByCharacter(charactersData, characterId) {
    return Object.entries(charactersData).find(([_, series]) => 
        Array.isArray(series.characters) && 
        series.characters.some(char => String(char.id) === String(characterId))
    )?.[1]?.name || 'Desconocido';
}

function formatTag(tag) {
    return String(tag).toLowerCase().trim().replace(/\s+/g, '_');
}

async function buscarImagenDelirius(tag) {
    const formattedTag = formatTag(tag);
    const apiUrls = [
        `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${formattedTag}`,
        `https://danbooru.donmai.us/posts.json?tags=${formattedTag}`,
        `${global.APIs?.delirius?.url || 'https://api.delirius.cc'}/search/gelbooru?query=${formattedTag}`
    ];
    
    const fetchPromises = apiUrls.map(async (url) => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            const contentType = response.headers.get('content-type') || '';
            if (!response.ok || !contentType.includes('application/json')) return [];
            
            const data = await response.json();
            const posts = Array.isArray(data) ? data : data?.posts || data?.data || [];
            
            const images = posts.map(post => 
                post?.file_url || 
                post?.large_file_url || 
                post?.sample_url || 
                post?.media_asset?.variants?.[0]?.url
            ).filter(url => typeof url === 'string' && /\.(jpe?g|png|webp)$/i.test(url));
            
            return images.length ? images : [];
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(`Error fetching from ${url}:`, error);
            }
            return [];
        }
    });
    
    const results = await Promise.allSettled(fetchPromises);
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value.length > 0) {
            return result.value;
        }
    }
    return [];
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const ctxErr = (global.rcanalx || {});
    const ctxWarn = (global.rcanalw || {});
    const ctxOk = (global.rcanalr || {});
    
    const cooldownTime = 15 * 60 * 1000;
    
    try {
        const chatData = global.db?.data?.chats?.[m.chat] || {};
        if (!chatData.gacha && m.isGroup) {
            return await conn.reply(m.chat, 'ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *' + usedPrefix + 'gacha on*', m, ctxWarn);
        }

        const userData = global.db?.data?.users?.[m.sender] || {};
        const currentTime = Date.now();
        
        if (userData.lastRoll && currentTime < userData.lastRoll + cooldownTime) {
            const remainingSeconds = Math.ceil((userData.lastRoll + cooldownTime - currentTime) / 1000);
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            
            let timeLeft = '';
            if (minutes > 0) timeLeft += minutes + ' minuto' + (minutes !== 1 ? 's' : '') + ' ';
            if (seconds > 0 || timeLeft === '') timeLeft += seconds + ' segundo' + (seconds !== 1 ? 's' : '');
            
            return await conn.reply(m.chat, 'ꕥ Debes esperar *' + timeLeft.trim() + '* para usar *' + (usedPrefix + command) + '* de nuevo.', m, ctxWarn);
        }

        const charactersData = await loadCharacters();
        const allCharacters = flattenCharacters(charactersData);
        
        if (!allCharacters.length) {
            return await conn.reply(m.chat, 'ꕥ No hay personajes disponibles en la base de datos.', m, ctxErr);
        }

        const randomCharacter = allCharacters[Math.floor(Math.random() * allCharacters.length)];
        const characterId = String(randomCharacter.id);
        const seriesName = getSeriesNameByCharacter(charactersData, randomCharacter.id);
        
        const characterTag = formatTag(randomCharacter.tags?.[0] || '');
        const images = await buscarImagenDelirius(characterTag);
        
        if (!images.length) {
            return await conn.reply(m.chat, 'ꕥ No se encontró imágenes para el personaje *' + randomCharacter.name + '*.', m, ctxErr);
        }

        const randomImage = images[Math.floor(Math.random() * images.length)];

        if (!global.db.data.characters) global.db.data.characters = {};
        if (!global.db.data.characters[characterId]) {
            global.db.data.characters[characterId] = {};
        }

        const characterDb = global.db.data.characters[characterId];
        
        characterDb.name = String(randomCharacter.name || 'Sin nombre');
        characterDb.value = Number(randomCharacter.value) || 100;
        characterDb.votes = 0;
        characterDb.user = null;
        characterDb.expiresAt = Date.now() + (3 * 60 * 1000);

        const infoText = `
── { 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐉𝐄 𝐀𝐋𝐄𝐀𝐓𝐎𝐑𝐈𝐎 } ──

❀ Nombre » ${randomCharacter.name}
⚥ Género » ${randomCharacter.gender || 'Desconocido'}
✰ Valor » ${randomCharacter.value || 100}
♡ Estado » Libre
❖ Fuente » ${seriesName}
ꕤ ɪᴅ » ${randomCharacter.id}`;

        const sentMessage = await conn.sendFile(
            m.chat, 
            randomImage, 
            characterDb.name + '.jpg', 
            infoText, 
            m
        );

        chatData.lastRolledId = characterId;
        chatData.lastRolledMsgId = sentMessage?.key?.id || null;
        chatData.lastRolledCharacter = {
            id: characterId,
            name: characterDb.name,
            media: randomImage,
            expiresAt: characterDb.expiresAt
        };

        userData.lastRoll = currentTime;

    } catch (error) {
        console.error('Error en handler de roll:', error);
        await conn.reply(m.chat, '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message, m, ctxErr);
    }
};

handler.help = ['roll', 'rw', 'rollwaifu'];
handler.tags = ['gacha'];
handler.command = ['rollwaifu', 'rw', 'roll'];
handler.group = true;

export default handler;