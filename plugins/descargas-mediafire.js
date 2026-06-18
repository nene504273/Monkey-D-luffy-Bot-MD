import fetch from 'node-fetch'

let handler = async (m, { conn: client, text, args, command }) => {
  
  if (!text) {
    return m.reply(`❍ Uso: /${command} <enlace de mediafire>`)
  }

  if (!/^(https?:\/\/)?(www\.)?mediafire\.com\//i.test(text)) {
    return m.reply(`❍ Por favor, proporciona un enlace válido de Mediafire`)
  }

  await client.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

  try {
    const res = await fetch(`https://api.alyacore.xyz/dl/mediafire?url=${encodeURIComponent(text)}&key=LUFFY-GEAR4`)
    const json = await res.json()

    if (!json.status || !json.result) {
      throw new Error(`❍ No se encontró el archivo o la API devolvió un error`)
    }

    const file = json.result

    let size = (file.filesize || '').toUpperCase()
    let sizeMB = 0

    if (size.includes('GB')) {
      sizeMB = parseFloat(size) * 1024
    } else if (size.includes('MB')) {
      sizeMB = parseFloat(size)
    }

    const MAX_MB = 1000

    if (sizeMB > MAX_MB) {
      return m.reply(`❍ El archivo excede el límite de ${MAX_MB} MB. Descárgalo directamente: ${file.download}`)
    }

    // CAMBIO CLAVE: Engañamos a Mediafire simulando un navegador real
    const fileRes = await fetch(file.download, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    })

    if (!fileRes.ok) {
      return m.reply(`❍ Error al descargar el archivo. Intenta directamente: ${file.download}`)
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer())

    // FILTRO DE SEGURIDAD: Si el archivo es sospechosamente pequeño y es HTML, Mediafire nos bloqueó
    if (buffer.length < 100000 && buffer.toString().includes('<!DOCTYPE html>')) {
      return m.reply(`❍ Mediafire bloqueó el acceso automatizado a este archivo. Descárgalo manualmente desde aquí:\n${file.download}`)
    }

    let type = null
    try {
      const { fileTypeFromBuffer } = await import('file-type')
      type = await fileTypeFromBuffer(buffer)
    } catch {}

    let mimetype = type?.mime || 'application/octet-stream'

    if (file.download?.includes('.apk') || file.filename?.endsWith('.apk')) {
      mimetype = 'application/vnd.android.package-archive'
    }

    let fileName = file.filename
    if (!fileName.includes('.') && file.download.includes('.')) {
      const parts = file.download.split('.')
      const ext = parts.pop().split('?')[0]
      fileName = `${fileName}.${ext}`
    }

    const caption = `¡! ׂׂૢ *Descarga de Mediafire*
✩̣̣̣̣̣ͯ┄•͙✧⃝•͙┄✩ͯ•͙͙✧⃝•͙͙✩ͯ

❍ *Nombre* › *${fileName}*
❍ *Tamaño* › *${file.filesize}*
❍ *Fecha* › *${file.uploaded}*
❍ *Tipo* › *${file.filetype || mimetype}*

──⇌••⇋──

\${dev}`

    await client.sendMessage(m.chat, {
      document: buffer,
      fileName: fileName,
      mimetype,
      caption
    }, { quoted: m })

    await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    m.reply(`❍ Error: ${e.message || e}`)
  }
}

handler.command = ['mf', 'mediafire']
handler.category = 'downloader'

export default handler
