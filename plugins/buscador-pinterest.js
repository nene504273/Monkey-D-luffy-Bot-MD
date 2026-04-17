import fetch from "node-fetch"
import baileys from "@whiskeysockets/baileys"

async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`)
  if (medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para un álbum")
  const caption = options.text || options.caption || ""
  const delay = !isNaN(options.delay) ? options.delay : 500
  const quoted = options.quoted || null
  delete options.text
  delete options.caption
  delete options.delay
  delete options.quoted
  const album = baileys.generateWAMessageFromContent(
    jid,
    { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.length } },
    quoted ? { quoted } : {}
  )
  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id })
  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i]
    const img = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    )
    img.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key }
    }
    await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id })
    await baileys.delay(delay)
  }
  return album
}

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `☠️ Por favor, escribe qué quieres buscar en Pinterest.\nEjemplo: ${usedPrefix}${command} Luffy`, m)
  }

  const query = args.join(' ')
  const limit = 10

  try {
    await m.react(rwait)

    const response = await fetch(
      `https://api.alyacore.xyz/dl/pinterestv2?query=${encodeURIComponent(query)}&limit=${limit}&key=LUFFY-GEAR4`
    )
    const json = await response.json()

    if (!json.status || !Array.isArray(json.results)) {
      throw new Error("La API no devolvió un formato válido")
    }

    if (json.results.length < 2) {
      await m.react(error)
      return conn.reply(m.chat, `☠️ No se encontraron suficientes imágenes para: *${query}*`, m)
    }

    const infoMessage =
      `⚓ *Pinterest Search*\n` +
      `✩̣̣̣̣̣ͯ┄•͙✧⃝•͙┄✩ͯ•͙͙✧⃝•͙͙✩ͯ\n` +
      `❍ *Búsqueda* › *${query}*\n` +
      `❍ *Resultados* › ${json.count} imágenes\n` +
      `❍ *Enviando* › ${json.results.length} en álbum\n` +
      `──⇌••⇋──\n` +
      `${dev}`

    await conn.reply(m.chat, infoMessage, m)

    const images = json.results.slice(0, 10).map(item => ({
      type: "image",
      data: { url: item.dl }
    }))

    await sendAlbumMessage(conn, m.chat, images, {
      caption: `⚓ Pinterest • ${query}`,
      quoted: m
    })

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