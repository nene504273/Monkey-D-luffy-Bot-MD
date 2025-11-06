import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    // obtener texto después del comando: soporta "#qrcode texto..." o mensajes con solo comando
    const full = (m.text || m.message?.conversation || '') + ''
    const input = full.split(' ').slice(1).join(' ').trim()

    if (!input) {
      return await conn.sendMessage(m.chat, { text: '☆ Uso: #qrcode <texto>\nEjemplo: #qrcode Hola mundo' }, { quoted: m })
    }

    // límite opcional
    if (input.length > 2000) {
      return await conn.sendMessage(m.chat, { text: '☆ Texto demasiado largo. Máx 2000 caracteres.' }, { quoted: m })
    }

    const apiUrl = `https://ruby-core.vercel.app/api/tools/qr?text=${encodeURIComponent(input)}`
    const res = await fetch(apiUrl)

    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)

    const contentType = res.headers.get('content-type') || ''
    const buffer = await res.buffer()

    // verificar que la respuesta sea una imagen
    if (!contentType.startsWith('image')) {
      const body = buffer.toString('utf8').slice(0, 300)
      throw new Error(`Respuesta inesperada de la API: ${body}`)
    }

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `- QR generado para:\n${input}`
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { text: '🏴‍☠️ Ocurrió un error al generar el QR. Intenta de nuevo más tarde.' }, { quoted: m })
  }
}

handler.help = ['qrcode <texto>']
handler.tags = ['tools']
handler.command = ['qrcode', 'qr']

export default handler