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

  try {
    // 1. Obtenemos la URL del video desde la API (CORREGIDA)
    const apiRes = await fetch(`https://api.alyacore.xyz/sfw/interaction?inter=${type}&key=${apikey}`)
    if (!apiRes.ok) throw new Error(`HTTP ${apiRes.status}`)

    const json = await apiRes.json()
    if (!json.status || !json.result) throw new Error('La API no devolvió un resultado válido')

    // 2. Descargamos el video desde la URL proporcionada por la API
    const videoRes = await fetch(json.result)
    if (!videoRes.ok) throw new Error(`Error al descargar el video: HTTP ${videoRes.status}`)

    const buffer = await videoRes.buffer()

    // 3. Enviamos el GIF
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

handler.help = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'hello', 'wave']
handler.tags = ['anime']
handler.command = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'hello', 'wave']
handler.group = true

export default handler