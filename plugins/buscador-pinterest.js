import fetch from "node-fetch"

const handler = async (m, { text, conn, args, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Por favor, escribe qué quieres buscar en Pinterest.\nEjemplo: #pin Luffy`, m)
  }

  const apikey = "LUFFY-GEAR4"
  const query = args.join(' ')
  const maxImages = 5 // Número máximo de imágenes a enviar

  try {
    await m.react(rwait)

    // Llamada a la API de Alyacore para Pinterest
    const apiUrl = `https://api.alyacore.xyz/search/pinterest?query=${encodeURIComponent(query)}&key=${apikey}`
    const response = await fetch(apiUrl)
    const json = await response.json()

    // Validar respuesta de la API
    let imageUrls = []
    if (json.status === true && Array.isArray(json.data)) {
      imageUrls = json.data.slice(0, maxImages)
    } else if (Array.isArray(json)) {
      // Por si la respuesta es directamente un array
      imageUrls = json.slice(0, maxImages)
    } else {
      throw new Error("Formato de respuesta inesperado")
    }

    if (imageUrls.length === 0) {
      await m.react(error)
      return conn.reply(m.chat, `${emoji2} No se encontraron imágenes para: *${query}*`, m)
    }

    // Mensaje informativo antes de enviar las imágenes
    const header = `🔎 *Pinterest Search*\n` +
                   `✩̣̣̣̣̣ͯ┄•͙✧⃝•͙┄✩ͯ•͙͙✧⃝•͙͙✩ͯ\n` +
                   `❍ *Búsqueda* › *${query}*\n` +
                   `❍ *Resultados* › ${imageUrls.length} imágenes\n` +
                   `──⇌••⇋──\n` +
                   `${dev}`

    await conn.reply(m.chat, header, m)

    // Enviar cada imagen
    for (let i = 0; i < imageUrls.length; i++) {
      const imgUrl = imageUrls[i]
      try {
        await conn.sendMessage(m.chat, {
          image: { url: imgUrl },
          caption: `📌 Pinterest • ${i + 1}/${imageUrls.length}\n${query}`,
        }, { quoted: m })
      } catch (imgError) {
        console.error(`Error enviando imagen ${i}:`, imgError.message)
        // Continuar con la siguiente imagen aunque falle una
      }
    }

    await m.react(done)

  } catch (e) {
    console.error(e)
    await m.react(error)
    return conn.reply(m.chat, `${msm} Ocurrió un error al buscar en Pinterest.`, m)
  }
}

// Configuración del comando
handler.help = ['pin', 'pinterest']
handler.tags = ['búsqueda']
handler.command = ['pin', 'pinterest', 'pins']
handler.group = true
handler.register = true
handler.coin = 2

export default handler