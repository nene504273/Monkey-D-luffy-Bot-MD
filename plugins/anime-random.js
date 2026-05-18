import fetch from 'node-fetch'

// ⚠️ Asegúrate de tener definida tu API key (si la API la requiere)
const API_KEY = 'LUFFY-GEAR4'

const handler = async (m, { conn, command, usedPrefix }) => {
  // Determinar el usuario objetivo: mencionado, citado o el propio remitente
  let mentionedJid = m.mentionedJid || []
  let userId = mentionedJid.length > 0 
    ? mentionedJid[0] 
    : (m.quoted ? m.quoted.sender : m.sender)

  // Obtener nombres de forma simple
  const fromName = m.pushName || m.sender.split('@')[0]
  let whoName = userId === m.sender 
    ? fromName 
    : (await conn.getName(userId).catch(() => userId.split('@')[0]))

  // Tabla de interacciones (clave: tipo)
  const interactions = {
    angry: 'angry', bath: 'bath', bite: 'bite', bleh: 'bleh', blush: 'blush',
    bored: 'bored', clap: 'clap', coffee: 'coffee', cry: 'cry', cuddle: 'cuddle',
    dance: 'dance', drunk: 'drunk', eat: 'eat', happy: 'happy', hug: 'hug',
    kill: 'kill', kiss: 'kiss', laugh: 'laugh', lick: 'lick', slap: 'slap',
    sleep: 'sleep', smoke: 'smoke', spit: 'spit', step: 'step', think: 'think',
    love: 'love', pat: 'pat', pout: 'pout', punch: 'punch', run: 'run',
    sad: 'sad', scared: 'scared', seduce: 'seduce', shy: 'shy', walk: 'walk',
    dramatic: 'dramatic', kisscheek: 'kisscheek', wink: 'wink', cringe: 'cringe',
    smug: 'smug', smile: 'smile', highfive: 'highfive', handhold: 'handhold',
    bully: 'bully', wave: 'wave', impregnate: 'impregnate', bonk: 'bonk'
  }

  // Alias en español → inglés
  const aliases = {
    enojado: 'angry', bañarse: 'bath', morder: 'bite', lengua: 'bleh',
    sonrojarse: 'blush', aburrido: 'bored', aplaudir: 'clap', cafe: 'coffee',
    café: 'coffee', llorar: 'cry', acurrucarse: 'cuddle', bailar: 'dance',
    borracho: 'drunk', comer: 'eat', palmada: 'bonk', feliz: 'happy',
    abrazar: 'hug', matar: 'kill', muak: 'kiss', reirse: 'laugh', lamer: 'lick',
    bofetada: 'slap', dormir: 'sleep', fumar: 'smoke', escupir: 'spit',
    pisar: 'step', pensar: 'think', enamorado: 'love', enamorada: 'love',
    palmadita: 'pat', picar: 'pat', pucheros: 'pout', pegar: 'punch',
    golpear: 'punch', preg: 'impregnate', preñar: 'impregnate',
    embarazar: 'impregnate', correr: 'run', triste: 'sad', asustada: 'scared',
    asustado: 'scared', seducir: 'seduce', timido: 'shy', timida: 'shy',
    caminar: 'walk', drama: 'dramatic', beso: 'kisscheek', guiñar: 'wink',
    avergonzarse: 'cringe', presumir: 'smug', sonreir: 'smile',
    '5': 'highfive', bullying: 'bully', mano: 'handhold', hello: 'wave'
  }

  // Obtener el tipo de interacción
  const cmd = aliases[command] || command
  const type = interactions[cmd]

  if (!type) {
    return conn.sendMessage(m.chat, { text: `Acción no reconocida: ${command}` }, { quoted: m })
  }

  // Construir el texto del mensaje (sin módulo de traducción)
  const isSelf = userId === m.sender
  let caption
  if (isSelf) {
    caption = `@${m.sender.split('@')[0]} se ha hecho ${type} a sí mismo.`
  } else {
    caption = `@${m.sender.split('@')[0]} le ha hecho ${type} a @${userId.split('@')[0]}.`
  }

  if (m.isGroup) {
    try {
      const res = await fetch(`https://api.alyacore.xyz/anime/interaction?type=${type}&key=${API_KEY}`)
      const json = await res.json()

      if (!json.status || !json.result) {
        return conn.sendMessage(m.chat, { text: 'No se encontró ningún GIF.' }, { quoted: m })
      }

      conn.sendMessage(m.chat, {
        video: { url: json.result },
        gifPlayback: true,
        caption: caption,
        mentions: [m.sender, userId]
      }, { quoted: m })
    } catch (e) {
      conn.sendMessage(m.chat, {
        text: `Error al obtener el GIF: ${e.message}\nUsa ${usedPrefix}${command} de nuevo.`
      }, { quoted: m })
    }
  }
}

// Lista de comandos (ayuda, etiquetas, comandos)
handler.help = [
  'angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua',
  'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee',
  'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar',
  'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug',
  'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick',
  'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit',
  'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado',
  'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar',
  'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste',
  'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido',
  'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso',
  'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile',
  'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold',
  'hello', 'wave', 'impregnate', 'bonk'
]
handler.tags = ['anime']
handler.command = [
  'angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua',
  'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee',
  'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar',
  'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug',
  'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick',
  'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit',
  'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado',
  'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar',
  'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste',
  'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido',
  'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso',
  'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile',
  'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold',
  'hello', 'wave', 'impregnate', 'bonk'
]
handler.group = true

export default handler