import fetch from 'node-fetch'
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

const handler = m => m
handler.all = async function (m) {
  if (!m.isGroup || m.isBaileys || !m.text || !this) return !0

  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.audios || m.text.length > 40) return !0

  try {
    const jsonPath = path.join(process.cwd(), 'src', 'database', 'audios.json')
    if (!existsSync(jsonPath)) return !0 

    const db_audios = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    const text = m.text.trim().toLowerCase()
    let audio = null

    for (const item of db_audios) {
      if (item.keywords.some(key => new RegExp(`\\b${key}\\b`, 'i').test(text))) {
        audio = item
        break 
      }
    }

    if (audio) {
      // 1. Mostrar estado según el modo
      if (audio.convert !== false) {
        await this.sendPresenceUpdate('recording', m.chat)
      }

      const response = await fetch(encodeURI(audio.link))
      if (!response.ok) return !0
      const buffer = await response.buffer()

      // --- MODO DESCARGA (convert: false) ---
      if (audio.convert === false) {
        return await this.sendMessage(m.chat, { 
          audio: buffer, 
          mimetype: audio.link.includes('.mp4') ? 'audio/mp4' : 'audio/mpeg', 
          ptt: false // Se envía como archivo descargable
        }, { quoted: m })
      }

      // --- MODO NOTA DE VOZ (FFmpeg a Opus) ---
      const tempIn = path.join(process.cwd(), `temp_in_${Date.now()}`)
      const tempOut = path.join(process.cwd(), `temp_out_${Date.now()}.opus`)
      writeFileSync(tempIn, buffer)

      try {
        await execPromise(`ffmpeg -y -i ${tempIn} -vn -c:a libopus -b:a 128k -vbr on -f ogg ${tempOut}`)
        const finalBuffer = readFileSync(tempOut)
        if (finalBuffer.length > 100) {
          await this.sendMessage(m.chat, { 
            audio: finalBuffer, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: true 
          }, { quoted: m })
        }
      } catch (e) {
        // Respaldo en caso de error de FFmpeg
        await this.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mp4', ptt: false }, { quoted: m })
      } finally {
        if (existsSync(tempIn)) unlinkSync(tempIn)
        if (existsSync(tempOut)) unlinkSync(tempOut)
      }
    }
  } catch (e) {}
  return !0
}

export default handler