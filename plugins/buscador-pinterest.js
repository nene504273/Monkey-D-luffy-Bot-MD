//codigo actualizado por Ander, no lo toquen si lo van a malograr PUTOS.
import fetch from "node-fetch"

const handler = async (m, { text, conn, args, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `☠️ Por favor, escribe qué quieres buscar en Pinterest.\nEjemplo: #pin Luffy`, m)
  }

  const apikey = "LUFFY-GEAR4"
  const query = args.join(' ')
  const limit = 10

  try {
    await m.react(rwait)

    const response = await fetch(`https://api.alyacore.xyz/dl/pinterestv2?query=${encodeURIComponent(query)}&limit=${limit}&key=${LUFFY-GEAR4}`)
    const json = await response.json()

    if (!json.status || !Array.isArray(json.results)) {
      throw new Error("La API no devolvió un formato válido")
    }

    if (json.results.length === 0) {
      await m.react(error)
      return conn.reply(m.chat, `☠️ No se encontraron imágenes para: *${query}*`, m)
    }

    const infoMessage = `⚓ *Pinterest Search*\n` +
                        `✩̣̣̣̣̣ͯ┄•͙✧⃝•͙┄✩ͯ•͙͙✧⃝•͙͙✩ͯ\n` +
                        `❍ *Búsqueda* › *${query}*\n` +
                        `❍ *Resultados* › ${json.count} imágenes\n` +
                        `❍ *Enviando* › ${json.results.length} en álbum\n` +
                        `──⇌••⇋──\n` +
                        `${dev}`

    await conn.reply(m.chat, infoMessage, m)

    const buffers = await Promise.all(
      json.results.map(item => fetch(item.dl).then(r => r.buffer()))
    )

    await conn.sendMessage(m.chat, {
      imageMessage: buffers.map((buffer, index) => ({
        image: buffer,
        caption: index === 0 ? `⚓ Pinterest • ${query}` : ''
      }))
    }, { quoted: m })

    await m.react(done)

  } catch (e) {
    console.error(e)
    await m.react(error)
    return conn.reply(m.chat, `☠️ Ocurrió un error al buscar en Pinterest.`, m)
  }
}

handler.help = ['pin', 'pinterest']
handler.tags = ['búsqueda']
handler.command = ['pin', 'pinterest', 'pins']
handler.group = true
handler.register = true
handler.coin = 2

export default handler