import fetch from 'node-fetch'

// Si tu API requiere key, defínela aquí o impórtala de un config
const apikey = 'LUFFY-GEAR4' // ⚠️ cámbialo por tu key real

let handler = async (m, { conn, command, usedPrefix }) => {
  let mentionedJid = await m.mentionedJid
  let userId = mentionedJid.length > 0 ? mentionedJid[0] : (m.quoted ? await m.quoted.sender : m.sender)
  
  // Función para obtener el nombre de un usuario
  const getName = async (jid) => {
    // Si tienes una base de datos, podrías usar global.db.data.users[jid].name
    // Aquí intentamos obtener el nombre desde el contacto de WhatsApp
    try {
      let name = await conn.getName(jid)
      return name && name.trim() ? name : jid.split('@')[0]
    } catch {
      return jid.split('@')[0]
    }
  }
  
  let from = await getName(m.sender)
  let who = await getName(userId)
  
  const interactions = {
    'angry': 'angry',
    'bath': 'bath',
    'bite': 'bite',
    'bleh': 'bleh',
    'blush': 'blush',
    'bored': 'bored',
    'clap': 'clap',
    'coffee': 'coffee',
    'cry': 'cry',
    'cuddle': 'cuddle',
    'dance': 'dance',
    'drunk': 'drunk',
    'eat': 'eat',
    'happy': 'happy',
    'hug': 'hug',
    'kill': 'kill',
    'kiss': 'kiss',
    'laugh': 'laugh',
    'lick': 'lick',
    'slap': 'slap',
    'sleep': 'sleep',
    'smoke': 'smoke',
    'spit': 'spit',
    'step': 'step',
    'think': 'think',
    'love': 'love',
    'pat': 'pat',
    'pout': 'pout',
    'punch': 'punch',
    'run': 'run',
    'sad': 'sad',
    'scared': 'scared',
    'seduce': 'seduce',
    'shy': 'shy',
    'walk': 'walk',
    'dramatic': 'dramatic',
    'kisscheek': 'kisscheek',
    'wink': 'wink',
    'cringe': 'cringe',
    'smug': 'smug',
    'smile': 'smile',
    'highfive': 'highfive',
    'handhold': 'handhold',
    'bully': 'bully',
    'wave': 'wave',
    'impregnate': 'impregnate',
    'bonk': 'bonk'
  }

  // Alias en español (opcional, puedes dejar solo los comandos en inglés si prefieres)
  const aliases = {
    'enojado': 'angry',
    'bañarse': 'bath',
    'morder': 'bite',
    'lengua': 'bleh',
    'sonrojarse': 'blush',
    'aburrido': 'bored',
    'aplaudir': 'clap',
    'cafe': 'coffee',
    'café': 'coffee',
    'llorar': 'cry',
    'acurrucarse': 'cuddle',
    'bailar': 'dance',
    'borracho': 'drunk',
    'comer': 'eat',
    'palmada': 'bonk',
    'feliz': 'happy',
    'abrazar': 'hug',
    'matar': 'kill',
    'muak': 'kiss',
    'reirse': 'laugh',
    'lamer': 'lick',
    'bofetada': 'slap',
    'dormir': 'sleep',
    'fumar': 'smoke',
    'escupir': 'spit',
    'pisar': 'step',
    'pensar': 'think',
    'enamorado': 'love',
    'enamorada': 'love',
    'palmadita': 'pat',
    'picar': 'pat',
    'pucheros': 'pout',
    'pegar': 'punch',
    'golpear': 'punch',
    'preg': 'impregnate',
    'preñar': 'impregnate',
    'embarazar': 'impregnate',
    'correr': 'run',
    'triste': 'sad',
    'asustada': 'scared',
    'asustado': 'scared',
    'seducir': 'seduce',
    'timido': 'shy',
    'timida': 'shy',
    'caminar': 'walk',
    'drama': 'dramatic',
    'beso': 'kisscheek',
    'guiñar': 'wink',
    'avergonzarse': 'cringe',
    'presumir': 'smug',
    'sonreir': 'smile',
    '5': 'highfive',
    'bullying': 'bully',
    'mano': 'handhold',
    'hello': 'wave'  // solo una vez
  }

  const cmd = aliases[command] || command
  const interaction = interactions[cmd]

  if (!interaction) return m.reply('❌ Comando no reconocido. Usa uno de los disponibles.')

  const type = interaction
  const isSelf = from === who

  // Texto del mensaje (personalizable)
  const str = isSelf
    ? `*${from}* se ha hecho *${type}* a sí mism@.`
    : `*${from}* le ha hecho *${type}* a *${who}*.`

  if (m.isGroup) {
    try {
      const res = await fetch(`https://api.alyacore.xyz/anime/interaction?type=${type}&key=${apikey}`)
      const json = await res.json()

      if (!json.status || !json.result) {
        return m.reply('No se encontró animación para esta interacción.')
      }

      conn.sendMessage(m.chat, {
        video: { url: json.result },
        gifPlayback: true,
        caption: str,
        mentions: [userId]
      }, { quoted: m })
    } catch (e) {
      return m.reply(`Error al obtener la interacción: ${e.message}`)
    }
  } else {
    // Si no es grupo, solo envía el texto (o puedes omitir el comando en privado)
    m.reply(str)
  }
}

handler.help = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'hello', 'wave']
handler.tags = ['anime']
handler.command = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'hello', 'wave']
handler.group = true

export default handler