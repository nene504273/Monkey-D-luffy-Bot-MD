import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { conn, text }) => {
  if (m.fromMe) return
  if (!text || !/^https?:\/\//.test(text)) 
    return m.reply(`🏴‍☠️ Por favor, ingresa la *url* de la página.`)

  let url = text
  await m.react('🕒')

  let res
  try {
    res = await fetch(url)
  } catch (e) {
    return m.reply('❌ Error al conectarse a la URL.')
  }

  const contentLength = res.headers.get('content-length')
  if (contentLength && +contentLength > 100 * 1024 * 1024 * 1024) {
    return m.reply('El archivo es demasiado grande (>100 GB).')
  }

  const contentType = res.headers.get('content-type') || ''
  const isText = /text|json/.test(contentType)

  if (isText) {
    let txt = await res.buffer()
    try {
      txt = format(JSON.parse(txt + ''))
    } catch (e) {
      txt = txt + ''
    }
    m.reply(txt.slice(0, 65536) + '')
    await m.react('✔️')
  } else {
    // Archivo binario: se descarga completamente y se envía como buffer
    let buffer = await res.buffer()
    let filename = 'file'
    try {
      const pathname = new URL(url).pathname
      filename = pathname.split('/').pop() || 'file'
    } catch (e) {}
    if (!filename.includes('.')) {
      const ext = contentType.split('/').pop().split(';')[0]
      filename = `file.${ext}`
    }
    await conn.sendFile(m.chat, buffer, filename, text, m)
    await m.react('✔️')
  }
}

handler.help = ['get']
handler.tags = ['owner']
handler.command = ['fetch', 'get']
handler.owner = true

export default handler