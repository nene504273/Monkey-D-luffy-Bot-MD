import fetch from 'node-fetch'

// Define msgglobal (asumimos que es un mensaje de error genérico)
const msgglobal = '❌ Ha ocurrido un error inesperado al intentar enviar las reacciones.'

const handler = async (m, { conn, args }) => {
  // 1. Unir los argumentos en una sola cadena
  const fullArgs = args.join(' ')

  // 2. Comprobación de argumentos
  if (!fullArgs) {
    return m.reply(`📝 Ingresa la url del canal y los emojis!\n\n> » Ejemplo: url_canal, emoji1, emoji2`)
  }

  try {
    // 3. Separar la URL del post y los emojis por la primera coma
    const parts = fullArgs.split(/,(.*)/s).map(part => part.trim()).filter(part => part)

    const postLink = parts[0]
    // Si hay más de un elemento después de la división, el segundo elemento es la cadena de emojis
    const reactsString = parts.length > 1 ? parts[1] : ''

    if (!postLink || !reactsString) {
      return m.reply(`❌ Uso incorrecto, el uso correcto es:\n\n> » *url_del_post*, *emoji1*, *emoji2*, ...`)
    }

    if (!postLink.includes('whatsapp.com/channel/')) {
      return m.reply(`❌ El link debe ser de una publicación de **canal de WhatsApp**.`)
    }

    // 4. Limpiar y validar los emojis
    const emojiArray = reactsString.split(',').map(e => e.trim()).filter(e => e)

    if (emojiArray.length > 4) {
      return m.reply(`❌ Máximo **4 emojis** permitidos.`)
    }

    const apiKey = 'f6be3a763a23ef4a3fa3fb0268694ee6246016d5ce1d6801e7fc354ce803b5ed'

    const requestData = {
      post_link: postLink,
      // La API requiere los emojis separados por coma
      reacts: emojiArray.join(',') 
    }

    // 5. Solicitud a la API
    const response = await fetch('https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0',
        'Referer': 'https://asitha.top/channel-manager'
      },
      body: JSON.stringify(requestData)
    })

    const result = await response.json()

    // 6. Manejo de respuesta
    if (response.ok && result.message) {
      await m.reply(`✅ *Reacciones enviadas con éxito* a ${postLink}`)
    } else if (!response.ok && result.message) {
      // Mostrar el mensaje de error específico de la API si está disponible
      await m.reply(`⚠️ Error de la API: ${result.message}`)
    } 
    else {
      // Usar msgglobal si la respuesta no es OK y no hay mensaje específico
      await m.reply(msgglobal)
    }

  } catch (error) {
    console.error(error)
    await m.reply(msgglobal)
  }
}

handler.command = ['react'];
handler.help = ['react'];
handler.tags = ['utils'];

export default handler;