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
  run: async (client, m, args, command, text, prefix) => {
    // --- CORRECCIÓN: método react seguro ---
    if (typeof m.react !== 'function') {
      m.react = async (emoji) => {
        try {
          await client.sendMessage(m.chat, { react: { text: emoji, key: m.key } })
        } catch {}
      }
    }
    // ----------------------------------------

    try {
      if (!text)
        return client.reply(
          m.chat,
          `❖ Ingresa un texto para buscar stickers.\n> Ejemplo: *${prefix + command} Alya Kujou*`,
          m
        )

      await m.react('🕒')

      const user = globalThis.db.data.users[m.sender] || {}
      const name = user.name || m.sender.split('@')[0]
      const packName = user.metadatos || global.dev
      const author = user.metadatos2 || `@${name}`

      const search = await searchStickerly(text)
      const resultados = search.resultados || search.result || []
      const freePacks = resultados.filter(p => !p.isPaid)

      if (!freePacks.length)
        return client.reply(m.chat, `❖ No se encontraron stickers gratuitos para *${text}*.`, m)

      const bestPack = freePacks[0]
      const detail = await getPackDetail(bestPack.url)

      if (!detail.status || !detail.detalles?.stickers?.length)
        return client.reply(m.chat, `❖ No se pudo obtener el paquete de stickers.`, m)

      const { detalles } = detail
      const stickers = detalles.stickers.slice(0, 30)

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

      if (!stickerList.length)
        return client.reply(m.chat, `❖ No se pudieron procesar los stickers.`, m)

      const cover = await sharp(await toBuffer(detalles.thumbnailUrl))
        .resize(96, 96, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer()

      await client.sendMessage(
        m.chat,
        {
          stickerPack: {
            name: packName,
            publisher: author,
            description: `${detalles.name} • ${global.botname}`,
            cover,
            stickers: stickerList
          }
        },
        { quoted: m }
      )

      await m.react('✔️')

    } catch (e) {
      console.error('[spack]', e)
      try { await m.react('✖️') } catch {}
      return client.reply(m.chat, '❖ Ocurrió un error al procesar el stickerpack.', m)
    }
  }
}