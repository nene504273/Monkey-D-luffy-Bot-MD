import axios from 'axios'
import sharp from 'sharp'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const toBuffer = async (url) =>
  Buffer.from((await axios.get(url, { responseType: 'arraybuffer' })).data)

const toWebp = async (buffer, isAnimated = false) => {
  try {
    const base = sharp(buffer, isAnimated ? { animated: true } : {})
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 80, ...(isAnimated ? { loop: 0 } : {}) })
    return await base.toBuffer()
  } catch (e) {
    // Si sharp no puede procesar el buffer (ej. GIF animado corrupto) retornamos null para filtrarlo
    console.error('[toWebp] Error:', e.message)
    return null
  }
}

const withRetry = async (fn, attempt = 1) => {
  try {
    return await fn()
  } catch (e) {
    if (e.response?.status === 429 && attempt <= 3) {
      await delay((e.response.headers['retry-after'] || 5) * 1000)
      return withRetry(fn, attempt + 1)
    }
    throw e
  }
}

const searchStickerly = (query) =>
  withRetry(async () => {
    const { data } = await axios.get('https://api.alyacore.xyz/stickerly/search', {
      params: { query, key: 'LUFFY-FIX67' }
    })
    return data
  })

const getPackDetail = (url) =>
  withRetry(async () => {
    const { data } = await axios.get('https://api.alyacore.xyz/stickerly/detail', {
      params: { url, key: 'LUFFY-FIX67' }
    })
    return data
  })

export default {
  command: ['stickerpack', 'spack'],
  category: 'utils',
  run: async ({ msg, sock, args, command, text }) => {
    try {
      const prefix = (global.prefix || '.').trim()
      const cmd = command || 'spack'

      if (!text)
        return msg.reply(
          `❖ Ingresa un texto para buscar stickers.\n> Ejemplo: *${prefix + cmd} Alya Kujou*`
        )

      const user = (globalThis.db?.data?.users?.[msg.sender]) || {}
      const name = user.name || msg.sender?.split('@')[0] || 'Usuario'
      const packName = user.metadatos || global.dev || 'Sticker Pack'
      const author = user.metadatos2 || `@${name}`

      const search = await searchStickerly(text)
      const resultados = search.resultados || search.result || []
      const freePacks = resultados.filter(p => !p.isPaid)

      if (!freePacks.length)
        return msg.reply(`❖ No se encontraron stickers gratuitos para *${text}*.`)

      const bestPack = freePacks[0]
      const detail = await getPackDetail(bestPack.url)

      if (!detail.status || !detail.detalles?.stickers?.length)
        return msg.reply(`❖ No se pudo obtener el paquete de stickers.`)

      const { detalles } = detail
      const stickers = detalles.stickers.slice(0, 30)

      // Convertir stickers, omitiendo los que fallen
      const stickerList = (
        await Promise.allSettled(
          stickers.map(async (s) => {
            const buf = await toBuffer(s.imageUrl)
            const webp = await toWebp(buf, s.isAnimated)
            if (!webp) return null  // señal para filtrar
            return {
              sticker: webp,
              isAnimated: s.isAnimated || false,
              isLottie: false,
              emojis: ['🎭']
            }
          })
        )
      )
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value)

      if (!stickerList.length)
        return msg.reply(`❖ No se pudieron procesar los stickers (posiblemente formatos no soportados).`)

      // Intentar generar cover, si falla se ignora
      let cover = null
      try {
        const coverBuffer = await toBuffer(detalles.thumbnailUrl)
        cover = await sharp(coverBuffer)
          .resize(96, 96, { fit: 'cover' })
          .webp({ quality: 80 })
          .toBuffer()
      } catch (e) {
        console.error('[cover] Error generando miniatura:', e.message)
        // cover se queda null
      }

      // Enviar stickerPack sin description y con cover opcional
      const packMessage = {
        stickerPack: {
          name: packName,
          publisher: author,
          stickers: stickerList
        }
      }
      if (cover) packMessage.stickerPack.cover = cover

      await sock.sendMessage(msg.chat, packMessage, { quoted: msg })

      await msg.reply('✅ Paquete de stickers enviado.')

    } catch (e) {
      console.error('[stickerpack] Error:', e)
      const errorMsg = e.response?.data?.message || e.message || 'Error desconocido'
      return msg.reply(`❖ Ocurrió un error: ${errorMsg}`).catch(() => {})
    }
  }
}