
import axios from 'axios'
import sharp from 'sharp'

const SEARCH_API = 'https://api.alyacore.xyz/stickerly/search'
const KEY = 'LUFFY-GEAR4'

class StickerLy {
  async search(query) {
    const url = `${SEARCH_API}?query=${encodeURIComponent(query)}&key=${KEY}`
    const { data } = await axios.get(url)
    if (!data.status || !data.resultados?.length) return []

    const q = query.toLowerCase().trim()
    return data.resultados
      .map(p => ({
        name: p.name || 'Sin nombre',
        author: p.author || 'Desconocido',
        url: p.url,
        stickerCount: p.stickerCount || 0,
        viewCount: p.viewCount || 0,
        exportCount: p.exportCount || 0,
        isAnimated: p.isAnimated || false
      }))
      .filter(p => {
        if (!p.url || p.stickerCount < 3) return false
        const n = p.name.toLowerCase()
        if (['my stickers','test','sin nombre','mis pegatinas','minhas figurinhas'].some(v => n.includes(v))) return false
        return n.includes(q) || p.author.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        const aEx = a.name.toLowerCase().includes(q) ? 1e6 : 0
        const bEx = b.name.toLowerCase().includes(q) ? 1e6 : 0
        return (bEx + b.exportCount*2 + b.viewCount + b.stickerCount*50) -
               (aEx + a.exportCount*2 + a.viewCount + a.stickerCount*50)
      })
  }

  async detail(url) {
    const id = url.match(/\/s\/([^\/?#]+)/)?.[1]
    if (!id) throw new Error('URL inválida')
    const { data } = await axios.get(`https://api.sticker.ly/v4/stickerPack/${id}?needRelation=true`, {
      headers: {
        'user-agent': 'androidapp.stickerly/3.17.0 (Xiaomi; Android 12; es)',
        'content-type': 'application/json',
        'accept-encoding': 'gzip'
      }
    })
    if (!data.result) throw new Error('Paquete no encontrado')
    const stickers = data.result.stickers.map(s => ({
      fileName: s.fileName,
      isAnimated: s.isAnimated || false,
      imageUrl: s.resourceUrl || `${data.result.resourceUrlPrefix}${s.fileName}`
    })).filter(s => s.imageUrl)
    return {
      name: data.result.name || 'Sin nombre',
      author: data.result.user?.displayName || 'Desconocido',
      stickers,
      stickerCount: stickers.length
    }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Ejemplo: ${usedPrefix + command} Monkey D. Luffy`)
  await m.react('⏳')
  try {
    const api = new StickerLy()
    let pack

    if (text.includes('sticker.ly/s/')) {
      pack = await api.detail(text)
    } else {
      const results = await api.search(text)
      if (!results.length) {
        await m.react('❌')
        return m.reply(`No se encontraron paquetes para "${text}"`)
      }
      pack = await api.detail(results[0].url)
    }

    if (!pack.stickers?.length) {
      await m.react('❌')
      return m.reply('El paquete no tiene stickers válidos.')
    }

    m.reply(`📦 ${pack.name} (${pack.stickerCount} stickers) – por ${pack.author}\nEnviando...`)

    const max = Math.min(pack.stickers.length, 30)
    let stickersArray = []
    let coverBuffer = null

    for (let i = 0; i < max; i++) {
      const s = pack.stickers[i]
      try {
        const res = await axios.get(s.imageUrl, { responseType: 'arraybuffer', timeout: 15000 })
        let buf = Buffer.from(res.data)

        // Convertir a webp si no lo es (solo para imágenes estáticas)
        if (!res.headers['content-type']?.startsWith('image/webp')) {
          buf = await sharp(buf, { animated: false })
            .webp({ quality: 80 })
            .toBuffer()
        }

        // La portada (primer sticker) se guarda aparte
        if (i === 0) {
          coverBuffer = await sharp(buf, { animated: false })
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp({ quality: 60 })
            .toBuffer()
        }

        stickersArray.push({
          sticker: buf,               // ← propiedad corregida
          isAnimated: s.isAnimated,
          emojis: ['🎀']
        })
      } catch (e) {
        console.log(`Error sticker ${i+1}: ${e.message}`)
      }
    }

    if (!stickersArray.length) {
      await m.react('❌')
      return m.reply('No se pudo descargar ningún sticker.')
    }

    await conn.sendMessage(m.chat, {
      stickerPack: {
        name: pack.name,
        publisher: pack.author,
        description: 'Descargado con Stickerly',
        cover: coverBuffer,
        stickers: stickersArray
      }
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`Error: ${e.message}`)
  }
}

handler.help = ['stickerly <nombre/url>']
handler.tags = ['descargas']
handler.command = ['stickerly', 'sl', 'dlsticker']
handler.group = false

export default handler