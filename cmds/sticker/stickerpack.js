import axios from 'axios'
import sharp from 'sharp'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const toBuffer = async (url) =>
  Buffer.from((await axios.get(url, { responseType: 'arraybuffer' })).data)

const toWebp = async (buffer, isAnimated = false) => {
  const base = sharp(buffer, isAnimated ? { animated: true } : {})
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 80, ...(isAnimated ? { loop: 0 } : {}) })
  return base.toBuffer()
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
      params: { query, key: global.apikey }
    })
    return data
  })

const getPackDetail = (url) =>
  withRetry(async () => {
    const { data } = await axios.get('https://api.alyacore.xyz/stickerly/detail', {
      params: { url, key: global.apikey }
    })
    return data
  })

export default {
  command: ['stickerpack', 'spack'],
  category: 'utils',
  run: async ({ msg, sock, args }) => {
    try {
      const text = args.join(' ').trim()
      if (!text) {
        return msg.reply(
          `❖ Ingresa un texto para buscar stickers.\n> Ejemplo: *${msg.prefix || '/'}stickerpack Alya Kujou*`
        )
      }

      await msg.react('🕒')

      // ── Datos del usuario (si existe base de datos) ──────────
      const user = globalThis.db?.data?.users?.[msg.sender] || {}
      const name = user.name || msg.sender.split('@')[0]
      const packName = user.metadatos || global.dev || 'Stickers'
      const author = user.metadatos2 || `@${name}`

      // ── Buscar en Stickerly ──────────────────────────────────
      const search = await searchStickerly(text)
      const resultados = search.resultados || search.result || []
      const freePacks = resultados.filter(p => !p.isPaid)

      if (!freePacks.length) {
        return msg.reply(`❖ No se encontraron stickers gratuitos para *${text}*.`)
      }

      const bestPack = freePacks[0]
      const detail = await getPackDetail(bestPack.url)

      if (!detail.status || !detail.detalles?.stickers?.length) {
        return msg.reply(`❖ No se pudo obtener el paquete de stickers.`)
      }

      const { detalles } = detail
      const stickers = detalles.stickers.slice(0, 30)

      // ── Descargar y convertir stickers ──────────────────────
      const stickerList = (
        await Promise.allSettled(
          stickers.map(async (s) => {
            const buf = await toBuffer(s.imageUrl)
            const webp = await toWebp(buf, s.isAnimated)
            return {
              sticker: webp,
              isAnimated: s.isAnimated || false,
              isLottie: false,
              emojis: ['🎭']
            }
          })
        )
      )
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)

      if (!stickerList.length) {
        return msg.reply(`❖ No se pudieron procesar los stickers.`)
      }

      // ── Portada ─────────────────────────────────────────────
      const cover = await sharp(await toBuffer(detalles.thumbnailUrl))
        .resize(96, 96, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer()

      // ── Enviar paquete ──────────────────────────────────────
      await sock.sendMessage(
        msg.chat,
        {
          stickerPack: {
            name: packName,
            publisher: author,
            description: `${detalles.name} • ${global.botname}`,
            cover,
            stickers: stickerList
          }
        },
        { quoted: msg }
      )

      await msg.react('✔️')

    } catch (e) {
      console.error('[spack]', e)
      await msg.react('✖️')
      msg.reply(msgglobal) // variable global con mensaje de error
    }
  }
}