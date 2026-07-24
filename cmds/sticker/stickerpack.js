import axios from 'axios'
import sharp from 'sharp'

// --- Funciones auxiliares ---

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const withRetry = async (fn, attempt = 1) => {
  try {
    return await fn()
  } catch (e) {
    if (e.response?.status === 429 && attempt <= 3) {
      const wait = (e.response.headers['retry-after'] || 5) * 1000
      await delay(wait)
      return withRetry(fn, attempt + 1)
    }
    throw e
  }
}

const toWebpBuffer = async (buffer, isAnimated = false) => {
  try {
    const sharpInstance = sharp(buffer, isAnimated ? { animated: true } : {})
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
    const options = { quality: 80 }
    if (isAnimated) options.loop = 0
    return await sharpInstance.webp(options).toBuffer()
  } catch (e) {
    console.error('[toWebpBuffer] Error:', e.message)
    return null
  }
}

// --- Lógica de Sticker.ly (API directa) ---

const API_HEADERS = {
  'user-agent': 'androidapp.stickerly/3.17.0 (Redmi Note 4; U; Android 29; in-ID; id;)',
  'content-type': 'application/json',
  'accept-encoding': 'gzip'
}

const searchStickerly = async (query) => {
  const { data } = await axios.post(
    'https://api.sticker.ly/v4/stickerPack/smartSearch',
    {
      keyword: query,
      enabledKeywordSearch: true,
      filter: {
        extendSearchResult: false,
        sortBy: 'RECOMMENDED',
        languages: ['ALL'],
        minStickerCount: 3,
        searchBy: 'ALL',
        stickerType: 'ALL'
      }
    },
    { headers: API_HEADERS }
  )
  return data
}

const getPackDetail = async (url) => {
  const match = url.match(/\/s\/([^\/\?#]+)/)
  if (!match) throw new Error('URL inválida de sticker.ly')
  const packId = match[1]
  const { data } = await axios.get(
    `https://api.sticker.ly/v4/stickerPack/${packId}?needRelation=true`,
    { headers: API_HEADERS }
  )
  return data
}

const filterSearchResults = (packs) => {
  return packs
    .map(pack => ({
      name: pack.name || 'Sin nombre',
      author: pack.authorName || 'Desconocido',
      url: pack.shareUrl,
      stickerCount: pack.resourceFiles?.length || pack.stickerCount || 0,
      viewCount: pack.viewCount || 0,
      exportCount: pack.exportCount || 0,
      isAnimated: pack.isAnimated || false
    }))
    .filter(pack => {
      if (!pack.url || pack.stickerCount < 3) return false
      const badNames = ['my stickers', 'test', 'sin nombre']
      const lower = pack.name.toLowerCase()
      return !badNames.some(bad => lower.includes(bad))
    })
    .sort((a, b) => {
      const scoreA = (a.exportCount * 2) + a.viewCount + (a.stickerCount * 50)
      const scoreB = (b.exportCount * 2) + b.viewCount + (b.stickerCount * 50)
      return scoreB - scoreA
    })
}

// --- Comando del bot ---

export default {
  command: ['stickerly', 'sl', 'dlsticker'],
  category: 'descargas',
  run: async ({ msg, sock, args, command, text }) => {
    if (!text) {
      return msg.reply(
        `✿ Hola hermosa personita :3\n` +
        `Por favor, ingresa un texto o URL.\n\n` +
        `⏤ 𝗘𝗷𝗲𝗺𝗽𝗹𝗼𝘀:\n` +
        `▸ ${command} Hatsune Miku\n` +
        `▸ ${command} Goku\n` +
        `▸ ${command} https://sticker.ly/s/XXXXXX`
      )
    }

    await msg.react('⏳')

    try {
      let packDetails

      if (text.includes('sticker.ly/s/')) {
        const detailData = await withRetry(() => getPackDetail(text))
        if (!detailData.result) throw new Error('Paquete no encontrado')
        const res = detailData.result
        packDetails = {
          name: res.name || 'Sin nombre',
          author: res.user?.displayName || 'Desconocido',
          stickers: (res.stickers || []).map(stick => ({
            fileName: stick.fileName,
            isAnimated: stick.isAnimated || false,
            imageUrl: stick.resourceUrl || `${res.resourceUrlPrefix}${stick.fileName}`
          })).filter(s => s.imageUrl)
        }
      } else {
        const searchData = await withRetry(() => searchStickerly(text))
        if (!searchData.result?.stickerPacks?.length) {
          await msg.react('🥀')
          return msg.reply(`❖ No encontré paquetes relacionados con *${text}*`)
        }

        const filtered = filterSearchResults(searchData.result.stickerPacks)
        if (!filtered.length) {
          await msg.react('🥀')
          return msg.reply(`❖ No hay paquetes de calidad para *${text}*`)
        }

        // Elegir aleatoriamente entre los 15 mejores
        const top = filtered.slice(0, 15)
        const selected = top[Math.floor(Math.random() * top.length)]

        const detailData = await withRetry(() => getPackDetail(selected.url))
        if (!detailData.result) throw new Error('Detalle del paquete no disponible')

        const res = detailData.result
        packDetails = {
          name: res.name || 'Sin nombre',
          author: res.user?.displayName || 'Desconocido',
          stickers: (res.stickers || []).map(stick => ({
            fileName: stick.fileName,
            isAnimated: stick.isAnimated || false,
            imageUrl: stick.resourceUrl || `${res.resourceUrlPrefix}${stick.fileName}`
          })).filter(s => s.imageUrl)
        }
      }

      if (!packDetails.stickers.length) {
        await msg.react('🥀')
        return msg.reply('❖ Este paquete no tiene stickers válidos.')
      }

      // Limitar a 30 stickers
      const stickersToProcess = packDetails.stickers.slice(0, 30)

      // Descargar y convertir a WebP
      const stickerList = []
      let coverBuffer = null

      for (let i = 0; i < stickersToProcess.length; i++) {
        const sticker = stickersToProcess[i]
        try {
          const response = await withRetry(() =>
            axios.get(sticker.imageUrl, { responseType: 'arraybuffer', timeout: 15000 })
          )
          const originalBuffer = Buffer.from(response.data)

          const webp = await toWebpBuffer(originalBuffer, sticker.isAnimated)
          if (!webp) continue // si falla la conversión, omitir

          // Usar el primer sticker válido como portada
          if (!coverBuffer && i === 0) {
            try {
              coverBuffer = await sharp(originalBuffer, { animated: false })
                .resize(96, 96, { fit: 'cover' })
                .webp({ quality: 80 })
                .toBuffer()
            } catch (e) {
              console.error('[cover] Error generando portada:', e.message)
            }
          }

          stickerList.push({
            sticker: webp,
            isAnimated: sticker.isAnimated || false,
            isLottie: false,
            emojis: ['🎀']
          })
        } catch (err) {
          console.error(`[sticker] Error descargando/conviertiendo ${i + 1}:`, err.message)
        }
      }

      if (!stickerList.length) {
        await msg.react('🥀')
        return msg.reply('❖ No se pudo procesar ningún sticker.')
      }

      // Construir mensaje stickerPack
      const packMessage = {
        stickerPack: {
          name: packDetails.name,
          publisher: packDetails.author,
          stickers: stickerList
        }
      }
      if (coverBuffer) packMessage.stickerPack.cover = coverBuffer

      await sock.sendMessage(msg.chat, packMessage, { quoted: msg })

      await msg.reply(
        `✅ *¡Paquete enviado!*\n` +
        `📦 *${packDetails.name}*\n` +
        `👤 *${packDetails.author}*\n` +
        `📊 *${stickerList.length} stickers*`
      )
      await msg.react('💰')
    } catch (e) {
      console.error('[stickerly] Error general:', e)
      await msg.react('❌')
      return msg.reply(`❖ Ocurrió un error:\n${e.message || 'Error desconocido'}`)
    }
  }
}