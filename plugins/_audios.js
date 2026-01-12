import fetch from 'node-fetch'
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

const handler = m => m
handler.all = async function (m) {
  if (!m.isGroup || m.isBaileys || !m.text || !this.user) return !0

  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.audios || m.text.length > 40) return !0

  // --- LÓGICA DE RESPUESTA ÚNICA ALEATORIA ---
  // Obtenemos todos los bots presentes en el grupo (usando la base de datos de participantes)
  const groupMetadata = await this.groupMetadata(m.chat)
  const botParticipants = groupMetadata.participants
    .filter(p => p.admin !== null || p.id) // Filtro simple de miembros
    .map(p => p.id)
    .filter(id => id.includes(':') || id === this.user.jid) // Aproximación para detectar bots si no tienes una lista fija

  // Si hay más de un bot, usamos el ID del mensaje como semilla para elegir uno solo
  // Esto asegura que todos los bots elijan al MISMO ganador para ese mensaje específico
  const seed = m.key.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const botList = [this.user.jid.replace(/:.*@/, '@')] 
  
  // Si no queremos complicarnos con listas, usamos una probabilidad basada en el tiempo
  // Si el bot no tiene suerte en este milisegundo, se detiene.
  const luckyNumber = parseInt(m.key.id.substring(0, 5), 16) % 3 // Ajusta el 3 según cuántos bots tengas
  const myIndex = parseInt(this.user.jid.replace(/[^0-9]/g, '').substring(0, 1)) % 3
  
  // Simplificación definitiva: Solo un bot responde basado en el hash del mensaje
  if (seed % 2 !== 0 && this.user.jid.includes('tu_otro_bot_id')) return !0 
  // La mejor forma sin configurar nada es que el bot decida callarse si no es "su turno"
  // pero para evitar que NINGUNO responda, lo mejor es dejar el primaryBot o un delay.
  
  // --- MEJOR SOLUCIÓN: Verificación de disponibilidad rápida ---
  if (chat.primaryBot && chat.primaryBot !== this.user.jid.replace(/:.*@/, '@')) return !0
  // ------------------------------------------

  try {
    const jsonPath = path.join(process.cwd(), 'src', 'database', 'audios.json')
    if (!existsSync(jsonPath)) return !0 

    const db_audios = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    const text = m.text.trim().toLowerCase()
    
    let audio = db_audios.find(item => 
      item.keywords.some(key => new RegExp(`\\b${key}\\b`, 'i').test(text))
    )

    if (audio) {
      if (audio.convert !== false) await this.sendPresenceUpdate('recording', m.chat)

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
  } catch (e) {}
  return !0
}

export default handler
