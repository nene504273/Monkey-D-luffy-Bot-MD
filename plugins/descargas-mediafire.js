import fetch from 'node-fetch'

let handler = async (client, m, args, command) => {
  const text = args.join(' ')

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

    if (!json.status || !json.data) {
      throw new Error(`❍ No se encontró el archivo`)
    }

    const file = json.data

    let size = (file.peso || '').toUpperCase()
    let sizeMB = 0

    if (size.includes('GB')) {
      sizeMB = parseFloat(size) * 1024
    } else if (size.includes('MB')) {
      sizeMB = parseFloat(size)
    }

    const MAX_MB = 1000

    if (sizeMB > MAX_MB) {
      return m.reply(`❍ El archivo excede el límite de ${MAX_MB} MB. Descárgalo directamente: ${file.dl}`)
    }

    const fileRes = await fetch(file.dl)

    if (!fileRes.ok) {
      return m.reply(`❍ Error al descargar. Intenta directamente: ${file.dl}`)
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer())

    let type = null
    try {
      const { fileTypeFromBuffer } = await import('file-type')
      type = await fileTypeFromBuffer(buffer)
    } catch {}

    let mimetype = type?.mime || file.tipo || 'application/octet-stream'

    if (file.title?.endsWith('.apk')) {
      mimetype = 'application/vnd.android.package-archive'
    }

    const caption = `¡! ׂׂૢ *Descarga de Mediafire*
✩̣̣̣̣̣ͯ┄•͙✧⃝•͙┄✩ͯ•͙͙✧⃝•͙͙✩ͯ

❍ *Nombre* › *${file.title}*
❍ *Tamaño* › *${file.peso}*
❍ *Fecha* › *${file.fecha}*
❍ *Tipo* › *${mimetype}*

──⇌••⇋──

\${dev}`

    await client.sendMessage(m.chat, {
      document: buffer,
      fileName: file.title,
      mimetype,
      caption
    }, { quoted: m })

    await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    m.reply(`❍ Error: ${e.message || e}`)
  }
}

// Asignación de propiedades al handler
handler.command = ['mf', 'mediafire']
handler.category = 'downloader' 
// Nota: Si tu bot usa 'tags' en lugar de 'category', puedes cambiarlo aquí abajo:
// handler.tags = ['downloader']
// handler.help = ['mediafire']

export default handler
