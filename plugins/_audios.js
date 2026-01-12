import fetch from 'node-fetch'
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

const handler = m => m
handler.all = async function (m) {
  // 1. Validaciones básicas de grupo y texto
  if (!m.isGroup || m.isBaileys || !m.text || !this) return !0

  // --- LÓGICA DE CONTROL DE BOT PRIMARIO ---
  let chat = global.db.data.chats[m.chat]
  if (!chat) return !0

  // Si existe un bot primario configurado y NO soy yo (mi JID), me detengo.
  let selfJid = this.user.jid.split(':')[0] + '@s.whatsapp.net'
  if (chat.primaryBot && chat.primaryBot !== selfJid) {
    return !0 // Silencio total para este bot
  }
  // ------------------------------------------

  if (!chat.audios || m.text.length > 40) return !0

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
      if (audio.convert !== false) {
        await this.sendPresenceUpdate('recording', m.chat)
      }

      const response = await fetch(encodeURI(audio.link))
      if (!response.ok) return !0
      const buffer = await response.buffer()

      if (audio.convert === false) {
        return await this.sendMessage(m.chat, { 
          audio: buffer, 
          mimetype: audio.link.includes('.mp4') ? 'audio/mp4' : 'audio/mpeg', 
          ptt: false 
        }, { quoted: m })
      }

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
        await this.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mp4', ptt: false }, { quoted: m })
      } finally {
        if (existsSync(tempIn)) unlinkSync(tempIn)
        if (existsSync(tempOut)) unlinkSync(tempOut)
      }
    }
  } catch (e) {
    console.error(e)
  }
  return !0
}

export default handler
