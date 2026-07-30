import fetch from 'node-fetch'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: async ({ msg, sock, args, command }) => {

    if (!args.length) {
      return msg.reply('✎ Ingresa uno o varios enlaces de *Facebook*')
    }

    // Filtra URLs válidas de Facebook
    const urls = args.filter(arg => /facebook\.com|fb\.watch|video\.fb\.com/.test(arg))
    if (!urls.length) {
      return msg.reply('✿ Por favor, envía un link de Facebook válido')
    }

    try {
      // Procesar hasta 10 enlaces (para no saturar)
      const maxLinks = Math.min(urls.length, 10)
      const mediaPromises = []

      for (let i = 0; i < maxLinks; i++) {
        const url = urls[i]
        mediaPromises.push(processFacebookUrl(url, msg))
      }

      const results = await Promise.allSettled(mediaPromises)
      const successful = results.filter(r => r.status === 'fulfilled' && r.value)

      if (successful.length === 0) {
        return msg.reply('✿ No se pudo obtener ningún video de los enlaces proporcionados.')
      }

      // Si es un solo video, enviarlo directamente
      if (successful.length === 1) {
        const { buffer, filename } = successful[0].value
        await sock.sendMessage(
          msg.chat,
          {
            video: buffer,
            mimetype: 'video/mp4',
            fileName: filename || 'facebook_video.mp4',
            // Opcional: añadir caption
            // caption: `📹 Video de Facebook`
          },
          { quoted: msg }
        )
        return
      }

      // Si son varios, enviarlos uno tras otro (con un pequeño delay para evitar bloqueos)
      for (const result of successful) {
        const { buffer, filename } = result.value
        await sock.sendMessage(
          msg.chat,
          {
            video: buffer,
            mimetype: 'video/mp4',
            fileName: filename || 'facebook_video.mp4'
          },
          { quoted: msg }
        )
        // Pequeña pausa entre envíos
        await new Promise(resolve => setTimeout(resolve, 500))
      }

    } catch (e) {
      console.error('Error en comando fb:', e)
      msg.reply('❌ Ocurrió un error al procesar el(los) enlace(s). Intenta más tarde.')
    }
  }
}

/**
 * Función auxiliar para procesar un solo enlace de Facebook
 * Retorna { buffer, filename } o lanza error
 */
async function processFacebookUrl(url, msg) {
  // 1. Obtener datos de la API (suponiendo que devuelve JSON con la URL del video)
  const apiUrl = `${api.url}/dl/facebookv2?url=${encodeURIComponent(url)}&key=${api.key}`
  const res = await fetch(apiUrl)
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)

  const data = await res.json()

  // 2. Extraer la URL del video (ajusta la ruta según la respuesta real de tu API)
  // Ejemplo común: data.video, data.url, data.download_url, etc.
  const videoUrl = data.video || data.url || data.download_url || data.result?.url
  if (!videoUrl) throw new Error('No se encontró la URL del video en la respuesta de la API')

  // 3. Descargar el video como buffer
  const videoRes = await fetch(videoUrl)
  if (!videoRes.ok) throw new Error(`Error al descargar el video: ${videoRes.status}`)

  const buffer = await videoRes.buffer()

  // 4. Verificar tamaño (WhatsApp permite hasta ~16 MB, pero mejor limitar a 15 MB)
  const sizeMB = buffer.length / (1024 * 1024)
  if (sizeMB > 15) {
    throw new Error(`El video pesa ${sizeMB.toFixed(2)} MB y supera el límite de 15 MB.`)
  }

  // 5. Generar nombre de archivo (opcional)
  const filename = `fb_${Date.now()}.mp4`

  return { buffer, filename }
}