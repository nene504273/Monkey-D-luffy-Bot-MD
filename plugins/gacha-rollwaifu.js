import { promises as fs } from 'fs'

// --- Rutas de Archivos ---
const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'

// --- Almacenamiento de Cooldowns ---
// Usar Map es más eficiente para esto
const cooldowns = new Map()
const COOLDOWN_DURATION = 15 * 60 * 1000 // 15 minutos en milisegundos

// --- Funciones de Utilidad de Archivos ---

/**
 * Carga datos de un archivo JSON.
 * @param {string} filePath - La ruta del archivo.
 * @param {any} defaultData - Los datos a devolver si el archivo no existe.
 * @param {string} errorMsg - Mensaje de error para lanzar si falla la lectura.
 * @returns {Promise<object | array>} Los datos parseados.
 */
async function loadFile(filePath, defaultData, errorMsg) {
    try {
        const data = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        // Si el archivo de harem no existe, retorna el valor por defecto (e.g., [])
        if (filePath === haremFilePath && error.code === 'ENOENT') {
            return defaultData
        }
        // Para otros errores (e.g., characters.json no encontrado, JSON malformado), lanza el error
        throw new Error(errorMsg)
    }
}

/**
 * Guarda datos en un archivo JSON.
 * @param {string} filePath - La ruta del archivo.
 * @param {object | array} data - Los datos a guardar.
 * @param {string} errorMsg - Mensaje de error para lanzar si falla la escritura.
 */
async function saveFile(filePath, data, errorMsg) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
        throw new Error(errorMsg)
    }
}

const loadCharacters = () => loadFile(charactersFilePath, null, '❀ No se pudo cargar el archivo characters.json.')
const saveCharacters = (characters) => saveFile(charactersFilePath, characters, '❀ No se pudo guardar el archivo characters.json.')

const loadHarem = () => loadFile(haremFilePath, [], '❀ No se pudo cargar el archivo harem.json.')
const saveHarem = (harem) => saveFile(haremFilePath, harem, '❀ No se pudo guardar el archivo harem.json.')


// --- Handler Principal (#rw) ---

let handler = async (m, { conn }) => {
    // El ID del usuario está en formato 'numero@s.whatsapp.net'
    const userId = m.sender
    const now = Date.now()
    
    // 1. Manejo de Cooldown
    const lastUse = cooldowns.get(userId)
    if (lastUse && now < lastUse) {
        const remainingTime = Math.ceil((lastUse - now) / 1000)
        const minutes = Math.floor(remainingTime / 60)
        const seconds = remainingTime % 60
        // Usar la función de respuesta directa del bot
        return await conn.reply(m.chat, `⏳ Por favor espera *${minutes} minutos y ${seconds} segundos* para usar *#rw* otra vez.`, m)
    }

    try {
        // 2. Carga de Datos
        const characters = await loadCharacters()
        if (!characters || characters.length === 0) {
            return await conn.reply(m.chat, '❌ Error: No hay personajes disponibles en la base de datos.', m)
        }
        
        const harem = await loadHarem()

        // 3. Selección Aleatoria
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
        
        // Asumiendo que `randomCharacter.img` es un array de URLs
        const randomImage = randomCharacter.img[Math.floor(Math.random() * randomCharacter.img.length)]

        // 4. Verificación de Estado y Mensaje
        
        // Verificar si el personaje está reclamado en la base de datos de personajes
        const isClaimed = randomCharacter.user
        
        // Obtener el nombre de usuario para el mensaje de estado y menciones
        let statusMessage
        let mentions = []
        
        if (isClaimed) {
            // Se asume que randomCharacter.user es el jid (e.g., '584121234567@s.whatsapp.net')
            const userName = randomCharacter.user.split('@')[0]
            statusMessage = `Reclamado por @${userName} 🛡️`
            mentions = [randomCharacter.user] // Agregar para la mención
        } else {
            statusMessage = 'Disponible 🌟'
        }

        const message = `
✨彡 𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓽𝓸 𝓻𝔀 𝓼𝓽𝔂𝓵𝓮 彡✨

🌸 𝓝𝓸𝓽𝓪: 𝓮𝓵 𝓹𝓮𝓻𝓼𝓸𝓷𝓪𝓳𝓮 𝓾𝓷𝓲𝓬𝓸 𝓲𝓷𝓽𝓮𝓻𝓮𝓼𝓪𝓷𝓽𝓮 🌸

👤 𝓝𝓸𝓶𝓫𝓻𝓮: *${randomCharacter.name}* 🌺

⚧ 𝓖é𝓷𝓮𝓻𝓸: *${randomCharacter.gender}* 🦋

💎 𝓥𝓪𝓵𝓸𝓻: *${randomCharacter.value}* 💥

📛 𝓔𝓼𝓽𝓪𝓭𝓸: ${statusMessage}

📚 𝓕𝓾𝓮𝓷𝓽𝓮: *${randomCharacter.source}* 📖

🆔 𝓘𝓓: *${randomCharacter.id}* 🎴
`
        // 5. Envío del Mensaje y Establecimiento del Cooldown
        
        // El bot debería soportar enviar una imagen con un pie de foto (caption)
        await conn.sendFile(m.chat, randomImage, `${randomCharacter.name}.jpg`, message, m, { mentions })

        // 6. Establecer Cooldown
        cooldowns.set(userId, now + COOLDOWN_DURATION)

    } catch (error) {
        // 7. Manejo de Errores
        console.error('Error en handler #rw:', error)
        await conn.reply(m.chat, `✘ Error al cargar o procesar el personaje: ${error.message}`, m)
    }
}

// --- Propiedades del Handler ---
handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha']
// Añadir un alias en mayúsculas para mayor flexibilidad, si el bot lo requiere.
handler.command = ['ver', 'rw', 'rollwaifu', 'RW', 'RollWaifu']
handler.group = true // Solo se permite en grupos

export default handler