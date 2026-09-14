import fetch from 'node-fetch'

export default {
  command: ['pinterest', 'pin'],
  category: 'downloads',
  description: 'Buscar y descarga imágenes y videos de Pinterest.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const text = args.join(' ')
    const isPinterestUrl = /^https?:\/\//.test(text)

    if (!text) {
      return msg.reply('《✧》 Por favor, ingresa un término de búsqueda o un enlace de Pinterest.')
    }

    try {
      if (isPinterestUrl) {
        const data = await getPinterestDownload(text)

        if (!data) return msg.reply('ꕥ No se pudo obtener el contenido.')

        const caption = `ㅤ۟∩　ׅ　★　ׅ　🅟𝖨𝖭 🅓ownload　ׄᰙ　\n\n${data.title ? `ֶㅤ֯⌗ ☆  ⬭ *Título* › ${data.title}\n` : ''}${data.description ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Descripción* › ${data.description}\n` : ''}${data.author ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Autor* › ${data.author}\n` : ''}${data.username ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Usuario* › ${data.username}\n` : ''}${data.followers ? `𖣣ㅤ֯⌗ ☆  ⬭ *Seguidores* › ${data.followers}\n` : ''}${data.uploadDate ? `𖣣ֶㅤ⌗ ☆  ⬭ *Fecha* › ${data.uploadDate}\n` : ''}${data.likes ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Likes* › ${data.likes}\n` : ''}${data.comments ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Comentarios* › ${data.comments}\n` : ''}${data.views ? `𖣣ֶㅤ֯ ☆  ⬭ *Vistas* › ${data.views}\n` : ''}${data.saved ? `𖣣ֶ֯⌗ ☆  ⬭ *Guardados* › ${data.saved}\n` : ''}${data.format ? `𖣣ֶ֯⌗ ☆  ⬭ *Formato* › ${data.format}\n` : ''}𖣣ֶㅤ֯⌗ ☆  ⬭ *Enlace* › ${text}`

        if (data.type === 'video') {
          await sock.sendMessage(
            msg.chat,
            {
              video: { url: data.url },
              caption,
              mimetype: 'video/mp4',
              fileName: data.filename || 'pin.mp4'
            },
            { quoted: msg }
          )
        } else if (data.type === 'image') {
          await sock.sendMessage(
            msg.chat,
            {
              image: { url: data.url },
              caption
            },
            { quoted: msg }
          )
        } else {
          throw new Error('Contenido no soportado.')
        }
      } else {
        const results = await getPinterestSearch(text)

        if (!results || results.length === 0) {
          return msg.reply(`《✧》 No se encontraron resultados para *${text}*.`)
        }

        const medias = results
          .slice(0, 10)
          .filter(r => r.image)
          .map(r => ({
            type: r.type === 'video' ? 'video' : 'image',
            data: { url: r.image },
            caption: `۟∩　ׅ　★　ׅ　🅟𝖨𝖭 🅢earch　ׄ　\n\n${r.title ? `ֶㅤ֯⌗ ☆  ⬭ *Título* › ${r.title}\n` : ''}${r.description ? `𖣣ֶㅤ֯⌗ ☆  ⬭ *Descripción* › ${r.description}\n` : ''}${r.author ? `𖣣ֶ֯⌗ ☆  ⬭ *Autor* › ${r.author}\n` : ''}${r.username ? `𖣣ֶ֯⌗ ☆  ⬭ *Usuario* › ${r.username}\n` : ''}${r.followers ? `𖣣ֶ֯⌗ ☆  ⬭ *Seguidores* › ${r.followers}\n` : ''}${r.likes ? `𖣣ㅤ֯⌗ ☆  ⬭ *Likes* › ${r.likes}\n` : ''}${r.created_at ? `ֶㅤ֯ ☆  ⬭ *Fecha* › ${r.created_at}\n` : ''}${r.url ? `𖣣ֶㅤ⌗ ☆  ⬭ *Enlace* › ${r.url}\n` : ''}`
          }))

        if (!medias.length) {
          return msg.reply(`《✧》 No se pudieron obtener descargas válidas para *${text}*.`)
        }

        await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
      }
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  }
}

async function getPinterestDownload(url) {
  // Extraer el ID del pin de la URL
  const pinIdMatch = url.match(/pin\/(\d+)/)
  if (!pinIdMatch) {
    return null
  }
  
  const pinId = pinIdMatch[1]
  const endpoint = `https://api.alyacore.xyz/pinterest/download?id=${pinId}&key=LUFFY-FIX67`

  try {
    const res = await fetchJson(endpoint)

    if (!res.status || !res.data) return null

    const data = res.data
    const imageUrl = data.hd || data.mini || null
    
    if (!imageUrl) return null

    const isVideo = /\.mp4(?:$|\?)/i.test(imageUrl)
    const ext = imageUrl.split('.').pop().split('?')[0] || (isVideo ? 'mp4' : 'jpg')

    return {
      type: isVideo ? 'video' : 'image',
      id: data.id || null,
      title: data.title || null,
      description: data.description || null,
      author: data.full_name || null,
      username: data.username || null,
      followers: data.followers || null,
      uploadDate: data.created || null,
      likes: data.likes || null,
      comments: null,
      views: null,
      saved: null,
      format: ext,
      url: imageUrl,
      thumbnail: data.mini || imageUrl,
      filename: `pinterest_${data.id || 'download'}.${ext}`
    }
  } catch {
    // Fallback: intentar obtener la imagen directamente
    try {
      const searchEndpoint = `https://api.alyacore.xyz/search/pinterest?query=${encodeURIComponent(url)}&key=LUFFY-FIX67`
      const res = await fetchJson(searchEndpoint)
      
      if (res.status && res.data && res.data.length > 0) {
        const item = res.data[0]
        const imageUrl = item.hd || item.mini
        const isVideo = /\.mp4(?:$|\?)/i.test(imageUrl)
        const ext = imageUrl.split('.').pop().split('?')[0] || (isVideo ? 'mp4' : 'jpg')
        
        return {
          type: isVideo ? 'video' : 'image',
          id: item.id || null,
          title: item.title || null,
          description: item.description || null,
          author: item.full_name || null,
          username: item.username || null,
          followers: item.followers || null,
          uploadDate: item.created || null,
          likes: item.likes || null,
          comments: null,
          views: null,
          saved: null,
          format: ext,
          url: imageUrl,
          thumbnail: item.mini || imageUrl,
          filename: `pinterest_${item.id || 'download'}.${ext}`
        }
      }
    } catch {
      return null
    }
  }
}

async function getPinterestSearch(query) {
  const endpoint = `https://api.alyacore.xyz/search/pinterest?query=${encodeURIComponent(query)}&key=LUFFY-FIX67`

  try {
    const res = await fetchJson(endpoint)

    if (!res.status || !Array.isArray(res.data) || !res.data.length) return []

    return res.data.map(d => {
      const imageUrl = d.hd || d.mini || null
      const isVideo = /\.mp4(?:$|\?)/i.test(imageUrl || '')

      return {
        type: isVideo ? 'video' : 'image',
        title: d.title || null,
        description: d.description || null,
        author: d.full_name || null,
        username: d.username || null,
        followers: d.followers || null,
        likes: d.likes || null,
        created_at: d.created || null,
        image: imageUrl,
        url: `https://pinterest.com/pin/${d.id}`,
        source: `https://pinterest.com/pin/${d.id}`,
        thumbnail: d.mini || imageUrl
      }
    })
  } catch {
    return []
  }
}

async function fetchJson(url, timeout = 30000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'
      }
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}