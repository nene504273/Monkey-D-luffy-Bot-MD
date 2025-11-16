import { promises as fs } from 'fs'

// --- ⚓ Rutas de Archivos (El Gran Tesoro) ---
const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'

// --- ⏳ Almacenamiento y Configuración de Cooldowns ---
const cooldowns = new Map()
// 15 minutos en milisegundos. Uso de una constante para claridad.
const COOLDOWN_DURATION = 15 * 60 * 1000 

/**
 * 🧹 Función para limpiar el cooldown de un usuario después del tiempo.
 * @param {string} userId - ID del usuario.
 */
function clearCooldown(userId) {
    // Establece el timeout para que el ID se elimine del Map después de la duración.
    setTimeout(() => {
        cooldowns.delete(userId)
    }, COOLDOWN_DURATION)
}

// --- 🛠️ Funciones de Utilidad de Archivos (Carpintería del Going Merry) ---

/**
 * Carga datos de un archivo JSON.
 * @param {string} filePath - La ruta del archivo.
 * @param {any} defaultData - Los datos a devolver si el archivo no existe o está vacío.
 * @param {string} errorMsg - Mensaje de error para lanzar si falla la lectura/parseo.
 * @returns {Promise<object | array>} Los datos parseados.
 */
async function loadFile(filePath, defaultData, errorMsg) {
    try {
        const data = await fs.readFile(filePath, 'utf-8')
        // Si el archivo está vacío o solo tiene espacios, devuelve los datos por defecto.
        if (!data.trim()) return defaultData 
        return JSON.parse(data)
    } catch (error) {
        // Si el error es que el archivo NO EXISTE, devuelve los datos por defecto.
        if (error.code === 'ENOENT') {
            return defaultData
        }
        // Para cualquier otro error (JSON roto, permisos, etc.), lanza el error con el mensaje customizado.
        throw new Error(`${errorMsg} - Error: ${error.code || error.message}`)
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
        // Uso de '2' para un formato JSON legible (pretty-print).
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
        throw new Error(`${errorMsg} - Error: ${error.message}`)
    }
}

// Funciones simplificadas de carga/guardado
const loadCharacters = () => loadFile(charactersFilePath, [], '❀ No se pudo cargar el archivo characters.json. (¡Tesoro perdido!)')
// Asumiendo que characters.json siempre debe existir y tener algo para que el comando funcione.
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
    const nextUseTime = lastUse + COOLDOWN_DURATION;
    
    if (lastUse && now < nextUseTime) {
        const remainingTime = Math.ceil((nextUseTime - now) / 1000)
        const minutes = Math.floor(remainingTime / 60)
        const seconds = remainingTime % 60
        
        // Respuesta directa y concisa
        return await conn.reply(m.chat, `⏳ ¡Espera un poco, Nakama! Te quedan *${minutes} minutos y ${seconds} segundos* para tu próximo *#rw*.`, m)
    }

    try {
        // 2. Carga de Datos (Verificación del Log Pose)
        // Se corrigió para esperar un array vacío [] si no existe, como definido en loadCharacters.
        const characters = await loadCharacters()
        
        if (!characters || !Array.isArray(characters) || characters.length === 0) {
            return await conn.reply(m.chat, '❌ Error: ¡La base de datos de personajes está vacía! No hay nadie que enrolar.', m)
        }
        
        // 3. Selección Aleatoria (Elige a tu Nakama)
        const randomIndex = Math.floor(Math.random() * characters.length)
        const randomCharacter = characters[randomIndex]
        
        // 4. Verificación de Imagen (¡Que no falte el retrato!)
        const images = randomCharacter.img
        
        if (!images || !Array.isArray(images) || images.length === 0) {
             console.error(`Personaje ID ${randomCharacter.id} no tiene imágenes válidas. Se omite el cooldown.`)
             return await conn.reply(m.chat, `⚠️ ¡El personaje ${randomCharacter.name} no tiene una imagen válida! Intenta de nuevo.`, m)
        }
        
        const randomImage = images[Math.floor(Math.random() * images.length)]
        
        // 5. Verificación de Estado y Mensaje (Bandera Pirata)
        // El personaje está reclamado si randomCharacter.user es un string no vacío.
        const isClaimed = !!randomCharacter.user && typeof randomCharacter.user === 'string'
        
        let statusMessage
        let mentions = [] // Lista de JIDs para mencionar
        
        if (isClaimed) {
            // El usuario reclamante, usado para la mención.
            const userJid = randomCharacter.user
            // El número, para mostrar en el mensaje.
            const userNumber = userJid.split('@')[0] 
            
            statusMessage = `Reclamado por @${userNumber} 🛡️`
            mentions = [userJid] // ¡Importante! Agregar para que WhatsApp lo reconozca.
        } else {
            statusMessage = 'Disponible 🌟'
        }

        // 6. Construcción del Mensaje (¡El cartel de "Se Busca"!)
        const message = `
✨彡 𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓽𝓸 𝓻𝔀 𝓼𝓽𝔂𝓵𝓮 彡✨

🌸 𝓝𝓸𝓽𝓪: 𝓮𝓵 𝓹𝓮𝓻𝓼𝓸𝓷𝓪𝓳𝓮 𝓾𝓷𝓲𝓬𝓸 𝓲𝓷𝓽𝓮𝓻𝓮𝓼𝓪𝓷𝓽𝓮 🌸

👤 𝓝𝓸𝓶𝓫𝓻𝓮: *${randomCharacter.name || 'Desconocido'}* 🌺

⚧ 𝓖é𝓷𝓮𝓻𝓸: *${randomCharacter.gender || '??'}* 🦋

💎 𝓥𝓪𝓵𝓸𝓻: *${randomCharacter.value || 0}* 💥

📛 𝓔𝓼𝓽𝓪𝓭𝓸: ${statusMessage}

📚 𝓕𝓾𝓮𝓷𝓽𝓮: *${randomCharacter.source || 'Sin Fuente'}* 📖

🆔 𝓘📴: *${randomCharacter.id || 'N/A'}* 🎴
`
        // 7. Envío del Mensaje y Establecimiento del Cooldown
        
        // conn.sendFile: Envía la imagen con el texto (caption) y maneja las menciones.
        // El cuarto argumento es el caption (message).
        // El sexto argumento es un objeto de opciones, que incluye { mentions }.
        await conn.sendFile(m.chat, randomImage, `${randomCharacter.id}_${randomCharacter.name}.jpg`, message, m, { mentions: mentions })

        // 8. Establecer Cooldown (¡Marcando el tiempo!)
        cooldowns.set(userId, now) // Guarda el tiempo actual de uso
        clearCooldown(userId)      // Inicia el temporizador para borrarlo

    } catch (error) {
        // 9. Manejo de Errores (¡La Marina nos ataca!)
        console.error('Error en handler #rw (Gomu Gomu no Error):', error)
        await conn.reply(m.chat, `💥 ¡Oh no! El Going Merry ha sido atacado. Error al cargar o procesar el personaje: ${error.message}`, m)
    }
}

// --- 🏷️ Propiedades del Handler (La Jolly Roger) ---
// La corrección clave: Asegurar que 'rw' y 'c' estén en el handler.command
handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha', 'waifu'] 
// Usar regex /^(...)$/i para ser sensible a mayúsculas/minúsculas y que reconozca #rw, #RW, #ver, etc.
// Notar que en la imagen también se intentó usar '#c', así que lo incluyo aquí como alias.
handler.command = /^(ver|rw|rollwaifu|c)$/i 
// Asegurarse de que el comando '#c' que da error en la imagen también se incluya,
// ya que parece ser un alias para el comando de gacha/roll.
handler.group = true 

export default handler