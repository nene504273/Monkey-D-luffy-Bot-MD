import { readFileSync, existsSync, writeFileSync } from 'fs'

const CDN_UPLOAD = 'https://cdn.adoolab.xyz/api/upload'

async function uploadToCDN(filePath, filename, mimetype = 'video/mp4') {
  const base64 = readFileSync(filePath).toString('base64')
  const res = await fetch(CDN_UPLOAD, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, data: base64, mimetype, expiration: 'never' })
  })
  const json = await res.json()
  if (!json.url) throw new Error(JSON.stringify(json))
  return json.url
}

let handler = async (m, { conn }) => {
  const quoted = m.quoted
  if (!quoted?.download) return conn.sendMessage(m.chat, { text: '❌ Cita un archivo para subir' }, { quoted: m })

  await conn.sendMessage(m.chat, { text: '⏳ Subiendo archivo al CDN...' }, { quoted: m })

  const mime = quoted.mimetype || 'application/octet-stream'
  const ext = mime.split('/')[1]?.split(';')[0] || 'bin'
  const filename = `upload_${Date.now()}.${ext}`
  const tmpPath = `/tmp/${filename}`

  const buffer = await quoted.download()
  writeFileSync(tmpPath, buffer)

  try {
    const url = await uploadToCDN(tmpPath, filename, mime)
    await conn.sendMessage(m.chat, { text: `✅ *Subido!*\n\n🔗 ${url}` }, { quoted: m })
  } catch (e) {
    await conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m })
  } finally {
    try { if (existsSync(tmpPath)) unlinkSync(tmpPath) } catch {}
  }
}

handler.command = ['subir', 'upload']
handler.tags = ['owner']
handler.owner = true

export default handler