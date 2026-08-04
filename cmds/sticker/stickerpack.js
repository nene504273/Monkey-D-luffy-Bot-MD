import axios from 'axios'
import sharp from 'sharp'

// ... (las funciones helper delay, toBuffer, toWebp, withRetry, searchStickerly, getPackDetail se mantienen igual) ...

export default {
  name: 'spack',
  alias: ['stickerpack', 'spack'],
  command: ['stickerpack', 'spack'],
  category: 'utils',
  run: async (client, m, args, command, text, prefix) => {
    try {
      if (!text) {
        return client.reply(
          m.chat,
          `❖ Ingresa un texto para buscar stickers.\n> Ejemplo: *${prefix + command} Alya Kujou*`,
          m
        )
      }

      await m.react('🕒')

      const user = globalThis.db?.data?.users?.[m.sender] || {}
      const name = user.name || m.sender.split('@')[0]
      const packName = user.metadatos || global.dev || 'StickerPack'
      const author = user.metadatos2 || `@${name}`

      const search = await searchStickerly(text)
      const resultados = search.resultados || search.result || []
      const freePacks = resultados.filter(p => !p.isPaid)

      if (!freePacks.length) {
        return client.reply(m.chat, `❖ No se encontraron stickers gratuitos para *${text}*.`, m)
      }

      const bestPack = freePacks[0]
      const detail = await getPackDetail(bestPack.url)

      if (!detail.status || !detail.detalles?.stickers?.length) {
        return client.reply(m.chat, `❖ No se pudo obtener el paquete de stickers.`, m)
      }

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

      if (!stickerList.length) {
        return client.reply(m.chat, `❖ No se pudieron procesar los stickers.`, m)
      }

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
            description: `${detalles.name} • ${global.botname || 'Bot'}`,
            cover,
            stickers: stickerList
          }
        },
        { quoted: m }
      )

      await m.react('✔️')

    } catch (e) {
      console.error('[spack]', e)
      await m.react('✖️')
      return m.reply(global.msgglobal || 'Error al procesar el paquete.')
    }
  }
}
