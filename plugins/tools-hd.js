import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})

  const quoted = m.quoted ? m.quoted : m
  const mime = quoted.mimetype || quoted.msg?.mimetype || ''

  if (!/image\/(jpe?g|png)/i.test(mime)) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.reply(m.chat, `🏴‍☠️ *Responde a una imagen*`, m, rcanal)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })
    conn.reply(m.chat, `♻️ *Procesando imagen...*`, m, ctxWarn)  

    const media = await quoted.download()
    const base64 = media.toString('base64')


    let resultBuffer
    try {
      const res = await fetch('https://api.ryzendesu.vip/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      })
      const json = await res.json()

      if (json?.status && json?.image) {
        resultBuffer = Buffer.from(json.image, 'base64')
      } else throw new Error('API 1 falló')
    } catch {

      const form = new FormData()
      form.append('file', media, 'image.jpg')

      const uploadRes = await fetch('https://telegra.ph/upload', {
        method: 'POST',
        body: form
      })
      const uploadJson = await uploadRes.json()

      if (!uploadJson?.[0]?.src) throw new Error('No se pudo subir la imagen')

      const imageUrl = 'https://telegra.ph' + uploadJson[0].src

      const res = await fetch(`https://api.betabotz.eu.org/api/tools/remini?url=${encodeURIComponent(imageUrl)}&apikey=beta-Itachi09`, {
        method: 'GET'
      })
      const json = await res.json()

      if (!json?.status || !json?.url) throw new Error('API no respondió')

      const imageRes = await fetch(json.url)
      resultBuffer = Buffer.from(await imageRes.arrayBuffer())
    }

    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption: `✨ *Imagen Mejorada HD*\n💫 *luffy-sempai*`
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    conn.reply(m.chat, `❎️ *Error:* ${err.message}`, m, ctxErr)
  }
}

handler.help = ["hd"]
handler.tags = ["imagen"] 
handler.command = ["hd", "remini", "mejorar"]

export default handler