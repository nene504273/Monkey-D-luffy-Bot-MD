import fetch from 'node-fetch'
import baileys from '@whiskeysockets/baileys'

async function sendAlbumMessage(jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`)
  if (medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para un álbum")

  const caption = options.text || options.caption || ""
  const delay = !isNaN(options.delay) ? options.delay : 500
  delete options.text
  delete options.caption
  delete options.delay

  const album = baileys.generateWAMessageFromContent(
    jid,
    { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.length } },
    {}
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
      messageAssociation: { associationType: 1, parentMessageKey: album.key },
    }
    await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id })
    await baileys.delay(delay)
  }

  return album
}

const pinterest = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `🌸 𝙐𝙨𝙤: *${usedPrefix + command}* <término de búsqueda>\n📌 Ejemplo: *${usedPrefix + command} anime girl*`, m, rcanal)

  await m.react('🕐')
  conn.reply(m.chat, '*🔎 Buscando imágenes en Pinterest...*', m, {
    contextInfo: {
      externalAdReply: {
        mediaUrl: null,
        mediaType: 1,
        showAdAttribution: true,
        title: packname,
        body: wm,
        previewType: 0,
        thumbnail: icons,
        sourceUrl: channel
      }
    }
  })

  try {
    const res = await fetch(`https://api.vreden.my.id/api/pinterest?query=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json?.result || json.result.length < 2)
      return conn.reply(m.chat, '✖️ No se encontraron suficientes imágenes para un álbum.', m)

    const images = json.result.slice(0, 10).map(url => ({
      type: "image",
      data: { url }
    }))

    const caption = `*Resultados de tu búsqueda:* ${text}`
    await sendAlbumMessage(m.chat, images, { caption, quoted: m })

    await m.react('✅')
  } catch (error) {
    console.error(error)
    await m.react('✖️')
    conn.reply(m.chat, 'Ocurrió un error al obtener tus imágenes de Pinterest.', m)
  }
}

handler.help = ['pinterest <query>']
handler.tags = ['buscador', 'descargas']
handler.coin = 1;
handler.register = true
handler.command = ['pinterest', 'pin'];
handler.register = true

export default pinterest
