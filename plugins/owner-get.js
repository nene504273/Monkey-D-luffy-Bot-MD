import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { conn, text }) => {
  if (m.fromMe) return
  if (!text || !/^https?:\/\//.test(text)) 
    return m.reply(`🏴‍☠️ Por favor, ingresa una URL válida.`)

  await m.react('🕒')

  try {
    // Realizamos un solo GET
    const res = await fetch(text)
    
    if (!res.ok) throw new Error(`Error HTTP: ${res.status} ${res.statusText}`)

    const contentType = res.headers.get('content-type') || ''
    
    // 1. Si es texto, código o JSON, lo leemos y mostramos
    if (/text|json|javascript|application\/xml/.test(contentType)) {
      let txt = await res.text()
      try {
        // Intentamos formatear si es JSON para que se vea bonito
        txt = JSON.stringify(JSON.parse(txt), null, 2)
      } catch (e) {
        // Si no es JSON, se queda como texto plano
      }
      
      await m.reply(txt.slice(0, 65536))
      await m.react('✔️')
    } 
    
    // 2. Si es cualquier otra cosa (imagen, video, pdf, etc.)
    else {
      // Extraemos el nombre del archivo de la URL
      let filename = text.split('/').pop().split('?')[0] || 'file'
      
      // Si no tiene extensión, intentamos ponerle una basada en el content-type
      if (!filename.includes('.')) {
        const ext = contentType.split('/').pop().split(';')[0]
        filename = `${filename}.${ext}`
      }

      /* 
         IMPORTANTE: Pasamos 'text' (la URL) en lugar del buffer. 
         Esto hace que el bot NO descargue el archivo a su RAM, 
         sino que le diga a WhatsApp que lo jale directamente de la fuente.
      */
      await conn.sendFile(m.chat, text, filename, `🔗 Archivo detectado: ${filename}`, m)
      await m.react('✔️')
    }

  } catch (e) {
    console.error(e)
    await m.reply(`❌ Fallo: ${e.message}`)
    await m.react('✖️')
  }
}

handler.help = ['get']
handler.tags = ['owner']
handler.command = ['fetch', 'get']
handler.owner = true

export default handler
