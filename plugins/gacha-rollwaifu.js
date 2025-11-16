import { promises as fs } from 'fs'

// --- ⚓ Rutas de Archivos (El Gran Tesoro) ---
const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'

// --- ⏳ Almacenamiento y Configuración de Cooldowns ---
// Usar Map es más eficiente para esto, como un buen mapa del tesoro.
const cooldowns = new Map()
const COOLDOWN_DURATION = 15 * 60 * 1000 // 15 minutos (¡No hay atajos para el One Piece!)

/**
 * 🧹 Función para limpiar el cooldown de un usuario después del tiempo.
 * @param {string} userId - ID del usuario.
 */
function clearCooldown(userId) {
    // Si el usuario vuelve a usar el comando antes, el Map se actualiza
    // y el antiguo timeout es irrelevante, por lo que no hace falta cancelarlo.
    setTimeout(() => {
        cooldowns.delete(userId)
        // Opcionalmente: console.log(`Cooldown de ${userId} eliminado.`)
    }, COOLDOWN_DURATION)
}

// --- 🛠️ Funciones de Utilidad de Archivos (Carpintería del Going Merry) ---

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
        // Solo si el archivo de harem no existe, se considera 'normal'
        if (filePath === haremFilePath && error.code === 'ENOENT') {
            return defaultData
        }
        // Para cualquier otro error (characters.json no encontrado, JSON roto, etc.), ¡LANZA EL ERROR!
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
        // El '2' en JSON.stringify es para un formato legible (pretty-print)
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
        throw new Error(errorMsg)
    }
}

// Funciones simplificadas de carga/guardado
const loadCharacters = () => loadFile(charactersFilePath, null, '❀ No se pudo cargar el archivo characters.json. (¡Tesoro perdido!)')
const saveCharacters = (characters) => saveFile(charactersFilePath, characters, '❀ No se pudo guardar el archivo characters.json. (¡Error al escribir el Log Pose!)')

const loadHarem = () => loadFile(haremFilePath, [], '❀ No se pudo cargar el archivo harem.json. (¡La isla no está en el mapa!)')
const saveHarem = (harem) => saveFile(haremFilePath, harem, '❀ No se pudo guardar el archivo harem.json. (¡Error al escribir el mapa!)')


// --- 👒 Handler Principal (#rw - El Roll de Luffy) ---

let handler = async (m, { conn }) => {
    // El ID del usuario está en formato 'numero@s.whatsapp.net'
    const userId = m.sender
    const now = Date.now()
    
    // 1. Manejo de Cooldown (¡No se puede comer carne tan seguido!)
    const lastUse = cooldowns.get(userId)
    if (lastUse && now < lastUse) {
        const remainingTime = Math.ceil((lastUse - now) / 1000)
        const minutes = Math.floor(remainingTime / 60)
        const seconds = remainingTime % 60
        // Respuesta directa y concisa
        return await conn.reply(m.chat, `⏳ ¡Espera un poco, Nakama! Te quedan *${minutes} minutos y ${seconds} segundos* para tu próximo *#rw*.`, m)
    }

    try {
        // 2. Carga de Datos (Verificación del Log Pose)
        const characters = await loadCharacters()
        if (!characters || characters.length === 0) {
            return await conn.reply(m.chat, '❌ Error: ¡La base de datos de personajes está vacía! No hay nadie que enrolar.', m)
        }
        
        // No es necesario cargar el harem si no se usa en este comando
        // const harem = await loadHarem() 

        // 3. Selección Aleatoria (Elige a tu Nakama)
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
        
        // 4. Verificación de Imagen (¡Que no falte el retrato!)
        const images = randomCharacter.img
        if (!images || !Array.isArray(images) || images.length === 0) {
            // Este es un error en el personaje en sí, se registra pero no se detiene el bot por el cooldown.
             console.error(`Personaje ID ${randomCharacter.id} no tiene imágenes válidas.`)
             return await conn.reply(m.chat, `⚠️ ¡El personaje ${randomCharacter.name} no tiene una imagen válida! Intenta de nuevo.`, m)
        }
        
        const randomImage = images[Math.floor(Math.random() * images.length)]
        
        // 5. Verificación de Estado y Mensaje (Bandera Pirata)
        
        // El personaje está reclamado si la propiedad 'user' existe y tiene un valor
        const isClaimed = !!randomCharacter.user
        
        let statusMessage
        let mentions = [] // Lista de JIDs para mencionar
        
        if (isClaimed) {
            // Se asume que randomCharacter.user es el jid (e.g., '584121234567@s.whatsapp.net')
            // No es necesario splittear si solo se usa para la mención
            statusMessage = `Reclamado por @${randomCharacter.user.split('@')[0]} 🛡️`
            mentions = [randomCharacter.user] // Agregar para que WhatsApp lo reconozca
        } else {
            statusMessage = 'Disponible 🌟'
        }

        // 6. Construcción del Mensaje (¡El cartel de "Se Busca"!)
        // Usando template literals para un código más limpio
        const message = `
✨彡 𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓽𝓸 𝓻𝔀 𝓼𝓽𝔂𝓵𝓮 彡✨

🌸 𝓝𝓸𝓽𝓪: 𝓮𝓵 𝓹𝓮𝓻𝓼𝓸𝓷𝓪𝓳𝓮 𝓾𝓷𝓲𝓬𝓸 𝓲𝓷𝓽𝓮𝓻𝓮𝓼𝓪𝓷𝓽𝓮 🌸

👤 𝓝𝓸𝓶𝓫𝓻𝓮: *${randomCharacter.name || 'Desconocido'}* 🌺

⚧ 𝓖é𝓷𝓮𝓻𝓸: *${randomCharacter.gender || '??'}* 🦋

💎 𝓥𝓪𝓵𝓸𝓻: *${randomCharacter.value || 0}* 💥

📛 𝓔𝓼𝓽𝓪𝓭𝓸: ${statusMessage}

📚 𝓕𝓾𝓮𝓷𝓽𝓮: *${randomCharacter.source || 'Sin Fuente'}* 📖

🆔 𝓘𝓓: *${randomCharacter.id || 'N/A'}* 🎴
`
        // 7. Envío del Mensaje y Establecimiento del Cooldown
        
        // conn.sendFile maneja el envío de la imagen con pie de foto y menciones
        await conn.sendFile(m.chat, randomImage, `${randomCharacter.id}_${randomCharacter.name}.jpg`, message, m, { mentions })

        // 8. Establecer Cooldown (¡Marcando el tiempo!)
        cooldowns.set(userId, now + COOLDOWN_DURATION)
        clearCooldown(userId) // Establece el timeout para limpiar el Map

    } catch (error) {
        // 9. Manejo de Errores (¡La Marina nos ataca!)
        console.error('Error en handler #rw (Gomu Gomu no Error):', error)
        // Usar la función de respuesta directa del bot
        await conn.reply(m.chat, `💥 ¡Oh no! El Going Merry ha sido atacado. Error al cargar o procesar el personaje: ${error.message}`, m)
    }
}

// --- 🏷️ Propiedades del Handler (La Jolly Roger) ---
handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha', 'waifu'] // Añadí 'waifu' para mejor categorización
// Asegúrate de que los comandos sean accesibles.
handler.command = /^(ver|rw|rollwaifu)$/i // Usar regex /.../i para ser sensible a mayúsculas/minúsculas como 'RW' o 'rollwaifu'
handler.group = true // Solo se permite en grupos

export default handler