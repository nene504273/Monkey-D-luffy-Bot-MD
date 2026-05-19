import fetch from 'node-fetch'

const apikey = 'LUFFY-GEAR4'

let handler = async (m, { conn, command, usedPrefix }) => {
  let mentionedJid = await m.mentionedJid
  let userId = mentionedJid.length > 0 ? mentionedJid[0] : (m.quoted ? await m.quoted.sender : m.sender)

  const getName = async (jid) => {
    try {
      if (global.db?.data?.users?.[jid]?.name) return global.db.data.users[jid].name
    } catch {}
    try {
      const n = await conn.getName(jid)
      return (typeof n === 'string' && n.trim()) ? n : jid.split('@')[0]
    } catch {
      return jid.split('@')[0]
    }
  }

  let from = await getName(m.sender)
  let who = await getName(userId)

  const interactions = {
    angry: 'enojado/a', bath: 'bañándose', bite: 'mordiendo', bleh: 'sacando la lengua',
    blush: 'sonrojado/a', bored: 'aburrido/a', clap: 'aplaudiendo', coffee: 'tomando café',
    cry: 'llorando', cuddle: 'acurrucándose', dance: 'bailando', drunk: 'borracho/a',
    eat: 'comiendo', happy: 'feliz', hug: 'abrazando', kill: 'matando', kiss: 'besando',
    laugh: 'riéndose', lick: 'lamiendo', slap: 'abofeteando', sleep: 'durmiendo',
    smoke: 'fumando', spit: 'escupiendo', step: 'pisando', think: 'pensando',
    love: 'enamorado/a', pat: 'acariciando', pout: 'haciendo pucheros', punch: 'golpeando',
    run: 'corriendo', sad: 'triste', scared: 'asustado/a', seduce: 'seduciendo',
    shy: 'tímido/a', walk: 'caminando', dramatic: 'dramático/a', kisscheek: 'besando en la mejilla',
    wink: 'guiñando el ojo', cringe: 'avergonzándose', smug: 'presumiendo', smile: 'sonriendo',
    highfive: 'chocando los cinco', handhold: 'tomados de la mano', bully: 'molestando',
    wave: 'saludando', impregnate: 'embarazando', bonk: 'dando un palmazo'
  }

  const aliases = {
    'enojado': 'angry', 'bañarse': 'bath', 'morder': 'bite', 'lengua': 'bleh',
    'sonrojarse': 'blush', 'aburrido': 'bored', 'aplaudir': 'clap', 'cafe': 'coffee',
    'café': 'coffee', 'llorar': 'cry', 'acurrucarse': 'cuddle', 'bailar': 'dance',
    'borracho': 'drunk', 'comer': 'eat', 'palmada': 'bonk', 'feliz': 'happy',
    'abrazar': 'hug', 'matar': 'kill', 'muak': 'kiss', 'reirse': 'laugh', 'lamer': 'lick',
    'bofetada': 'slap', 'dormir': 'sleep', 'fumar': 'smoke', 'escupir': 'spit',
    'pisar': 'step', 'pensar': 'think', 'enamorado': 'love', 'enamorada': 'love',
    'palmadita': 'pat', 'picar': 'pat', 'pucheros': 'pout', 'pegar': 'punch',
    'golpear': 'punch', 'preg': 'impregnate', 'preñar': 'impregnate', 'embarazar': 'impregnate',
    'correr': 'run', 'triste': 'sad', 'asustada': 'scared', 'asustado': 'scared',
    'seducir': 'seduce', 'timido': 'shy', 'timida': 'shy', 'caminar': 'walk',
    'drama': 'dramatic', 'beso': 'kisscheek', 'guiñar': 'wink', 'avergonzarse': 'cringe',
    'presumir': 'smug', 'sonreir': 'smile', '5': 'highfive', 'bullying': 'bully',
    'mano': 'handhold', 'hello': 'wave'
  }

  const cmd = aliases[command] || command
  const accion = interactions[cmd]
  if (!accion) return conn.sendMessage(m.chat, { text: '❌ Interacción no reconocida.' }, { quoted: m })

  const type = cmd
  const esMismo = from === who
  const mensaje = esMismo ? `✨ *${from}* está ${accion}` : `💫 *${from}* está ${accion} a *${who}*`

  if (!m.isGroup) return conn.sendMessage(m.chat, { text: mensaje }, { quoted: m })

  // 💥 OBTENEMOS EL VIDEO DIRECTAMENTE (SIN JSON)
  try {
    const res = await fetch(`https://api.alyacore.xyz/anime/interaction?type=${type}&key=${apikey}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    // Verificamos el tipo de contenido para evitar HTML
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
      throw new Error('La API devolvió HTML en lugar de un video')
    }

    // Convertimos la respuesta en buffer (video/gif)
    const buffer = await res.buffer()

    await conn.sendMessage(m.chat, {
      video: buffer,
      gifPlayback: true,
      caption: mensaje,
      mentions: [userId]
    }, { quoted: m })

  } catch (e) {
    conn.sendMessage(m.chat, { text: `❌ Error al obtener la interacción: ${e.message}` }, { quoted: m })
  }
}

handler.help = ['angry', 'enojado', 'bath', 'bañarse', ...]  // (mantén igual los arrays)
handler.tags = ['anime']
handler.command = ['angry', 'enojado', 'bath', 'bañarse', ...] // (mantén igual)
handler.group = true

export default handler