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

    // Validación adaptada a tu API ('result' en lugar de 'data')
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

    const fileRes = await fetch(file.download)

    if (!fileRes.ok) {
      return m.reply(`❍ Error al descargar el archivo. Intenta directamente: ${file.download}`)
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer())

    let type = null
    try {
      const { fileTypeFromBuffer } = await import('file-type')
      type = await fileTypeFromBuffer(buffer)
    } catch {}

    let mimetype = type?.mime || 'application/octet-stream'

    // Forzar el mimetype si es un APK
    if (file.download?.includes('.apk') || file.filename?.endsWith('.apk')) {
      mimetype = 'application/vnd.android.package-archive'
    }

    // Corrección de extensión: Si el filename no tiene punto pero la descarga sí, se la añadimos
    let fileName = file.filename
    if (!fileName.includes('.') && file.download.includes('.')) {
      const parts = file.download.split('.')
      const ext = parts.pop().split('?')[0] // Extrae 'apk', 'zip', etc.
      fileName = `${fileName}.${ext}`
    }

    const caption = `¡! ׂׂૢ *Descarga de Mediafire*
✩̣̣̣̣̣ͯ┄•͙✧⃝•͙┄✩ͯ•͙͙✧⃝•͙͙✩ͯ

❍ *Nombre* › *${fileName}*
❍ *Tamaño* › *${file.filesize}*
❍ *Fecha* › *${file.uploaded}*
❍ *Tipo* › *${file.filetype || mimetype}*

──⇌••⇋──

${dev}`

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

// Configuración para que el handler lo lea perfectamente abajo
handler.command = ['mf', 'mediafire']
handler.category = 'downloader'

export default handler
