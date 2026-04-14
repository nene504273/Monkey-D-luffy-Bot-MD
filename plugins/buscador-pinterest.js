import fetch from "node-fetch"

const handler = async (m, { text, conn, args, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Por favor, escribe qué quieres buscar en Pinterest.\nEjemplo: #pin Luffy`, m)
  }

  const apikey = "LUFFY-GEAR4"
  const query = args.join(' ')
  const maxImages = 5 // Cantidad de imágenes a enviar en el álbum

  try {
    await m.react(rwait)

    // Llamada a la API de Alyacore (formato real)
    const apiUrl = `https://api.alyacore.xyz/search/pinterest?query=${encodeURIComponent(query)}&key=${apikey}`
    const response = await fetch(apiUrl)
    const json = await response.json()

    // Validar estructura de la respuesta real
    if (!json.status || !Array.isArray(json.data)) {
      throw new Error("La API no devolvió un formato válido")
    }

    const resultados = json.data
    if (resultados.length === 0) {
      await m.react(error)
      return conn.reply(m.chat, `${emoji2} No se encontraron imágenes para: *${query}*`, m)
    }

    // Extraer URLs (usamos 'hd' para mejor calidad, si no existe usamos 'mini')
    const imageUrls = resultados.slice(0, maxImages).map(item => item.hd || item.mini).filter(url => url)

    if (imageUrls.length === 0) {
      await m.react(error)
      return conn.reply(m.chat, `${emoji2} No se pudieron obtener las imágenes.`, m)
    }

    // Construir mensaje informativo al estilo YouTube
    const totalEncontrados = resultados.length
    const infoMessage = `🔎 *Pinterest Search*\n` +
                        `✩̣̣̣̣̣ͯ┄•͙✧⃝•͙┄✩ͯ•͙͙✧⃝•͙͙✩ͯ\n` +
                        `❍ *Búsqueda* › *${query}*\n` +
                        `❍ *Resultados* › ${totalEncontrados} imágenes\n` +
                        `❍ *Enviando* › ${imageUrls.length} en álbum\n` +
                        `──⇌••⇋──\n` +
                        `${dev}`

    // Enviar mensaje de cabecera
    await conn.reply(m.chat, infoMessage, m)

    // Construir el array para el álbum
    const albumMessages = imageUrls.map((url, index) => ({
      image: { url },
      caption: index === 0 ? `📌 Pinterest • ${query}` : '' // Solo el primero lleva caption
    }))

    // Enviar álbum
    await conn.sendMessage(m.chat, albumMessages, { quoted: m })

    await m.react(done)

  } catch (e) {
    console.error(e)
    await m.react(error)
    return conn.reply(m.chat, `${msm} Ocurrió un error al buscar en Pinterest.`, m)
  }
}

// Configuración del comando (similar a tu handler de YouTube)
handler.help = ['pin', 'pinterest']
handler.tags = ['búsqueda']
handler.command = ['pin', 'pinterest', 'pins']
handler.group = true
handler.register = true
handler.coin = 2

export default handler