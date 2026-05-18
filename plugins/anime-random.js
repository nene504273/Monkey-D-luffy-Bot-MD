import fetch from 'node-fetch'

const interactions = {
  angry: { verbSelf: 'está enojado/a', verbOther: 'está enojado/a con' },
  bath: { verbSelf: 'se está bañando', verbOther: 'se está bañando con' },
  bite: { verbSelf: 'muerde algo', verbOther: 'mordió a' },
  bleh: { verbSelf: 'saca la lengua', verbOther: 'le sacó la lengua a' },
  blush: { verbSelf: 'se sonroja', verbOther: 'se sonroja por' },
  bored: { verbSelf: 'está aburrido/a', verbOther: 'está aburrido/a con' },
  clap: { verbSelf: 'está aplaudiendo', verbOther: 'aplaude para' },
  coffee: { verbSelf: 'está tomando café', verbOther: 'está tomando café con' },
  cry: { verbSelf: 'está llorando', verbOther: 'llora con' },
  cuddle: { verbSelf: 'quiere acurrucarse', verbOther: 'se acurrucó con' },
  dance: { verbSelf: 'está bailando', verbOther: 'está bailando con' },
  drunk: { verbSelf: 'está borracho/a', verbOther: 'está borracho/a con' },
  eat: { verbSelf: 'come algo delicioso', verbOther: 'está comiendo con' },
  happy: { verbSelf: 'está feliz', verbOther: 'está feliz con' },
  hug: { verbSelf: 'necesita un abrazo', verbOther: 'abrazó a' },
  kill: { verbSelf: 'se puso peligroso/a', verbOther: 'mató a' },
  kiss: { verbSelf: 'manda un beso', verbOther: 'besó a' },
  laugh: { verbSelf: 'se está riendo', verbOther: 'se ríe con' },
  lick: { verbSelf: 'lamió algo', verbOther: 'lamió a' },
  slap: { verbSelf: 'dio una bofetada al aire', verbOther: 'le dio una bofetada a' },
  sleep: { verbSelf: 'se quedó dormido/a', verbOther: 'duerme junto a' },
  smoke: { verbSelf: 'está fumando', verbOther: 'está fumando con' },
  spit: { verbSelf: 'escupió', verbOther: 'escupió a' },
  step: { verbSelf: 'pisó el suelo con fuerza', verbOther: 'pisó a' },
  think: { verbSelf: 'está pensando', verbOther: 'está pensando en' },
  love: { verbSelf: 'está enamorado/a', verbOther: 'está enamorado/a de' },
  pat: { verbSelf: 'quiere una palmadita', verbOther: 'le dio una palmadita a' },
  pout: { verbSelf: 'hace pucheros', verbOther: 'hace pucheros frente a' },
  punch: { verbSelf: 'lanzó un golpe', verbOther: 'golpeó a' },
  run: { verbSelf: 'está corriendo', verbOther: 'corre junto a' },
  sad: { verbSelf: 'está triste', verbOther: 'está triste por' },
  scared: { verbSelf: 'está asustado/a', verbOther: 'se asustó con' },
  seduce: { verbSelf: 'intenta seducir', verbOther: 'sedujo a' },
  shy: { verbSelf: 'está tímido/a', verbOther: 'se puso tímido/a con' },
  walk: { verbSelf: 'está caminando', verbOther: 'camina junto a' },
  dramatic: { verbSelf: 'está haciendo drama', verbOther: 'hace drama con' },
  kisscheek: { verbSelf: 'manda un beso en la mejilla', verbOther: 'besó la mejilla de' },
  wink: { verbSelf: 'guiña un ojo', verbOther: 'le guiñó un ojo a' },
  cringe: { verbSelf: 'siente vergüenza ajena', verbOther: 'siente vergüenza ajena por' },
  smug: { verbSelf: 'presume con orgullo', verbOther: 'presume frente a' },
  smile: { verbSelf: 'sonríe', verbOther: 'sonríe para' },
  highfive: { verbSelf: 'quiere chocar los cinco', verbOther: 'chocó los cinco con' },
  handhold: { verbSelf: 'quiere tomar una mano', verbOther: 'tomó la mano de' },
  bully: { verbSelf: 'está molestando', verbOther: 'molestó a' },
  wave: { verbSelf: 'saluda', verbOther: 'saludó a' },
  impregnate: { verbSelf: 'está pensando en bebés', verbOther: 'embarazó a' },
  bonk: { verbSelf: 'recibió un bonk', verbOther: 'le dio un bonk a' }
}

const aliases = {
  enojado: 'angry', bañarse: 'bath', morder: 'bite', lengua: 'bleh',
  sonrojarse: 'blush', aburrido: 'bored', aplaudir: 'clap', cafe: 'coffee',
  café: 'coffee', llorar: 'cry', acurrucarse: 'cuddle', bailar: 'dance',
  borracho: 'drunk', comer: 'eat', feliz: 'happy', abrazar: 'hug',
  matar: 'kill', muak: 'kiss', reirse: 'laugh', lamer: 'lick',
  bofetada: 'slap', dormir: 'sleep', fumar: 'smoke', escupir: 'spit',
  pisar: 'step', pensar: 'think', enamorado: 'love', enamorada: 'love',
  palmadita: 'pat', picar: 'pat', pucheros: 'pout', pegar: 'punch',
  golpear: 'punch', preg: 'impregnate', preñar: 'impregnate',
  embarazar: 'impregnate', correr: 'run', triste: 'sad', asustada: 'scared',
  asustado: 'scared', seducir: 'seduce', timido: 'shy', timida: 'shy',
  caminar: 'walk', drama: 'dramatic', beso: 'kisscheek', guiñar: 'wink',
  avergonzarse: 'cringe', presumir: 'smug', sonreir: 'smile', 5: 'highfive',
  bullying: 'bully', mano: 'handhold', hola: 'wave', hello: 'wave', palmada: 'bonk'
}

const commands = [...new Set([...Object.keys(interactions), ...Object.keys(aliases)])]

const getDisplayName = async (conn, jid) => {
  const savedName = global.db?.data?.users?.[jid]?.name
  if (typeof savedName === 'string' && savedName.trim()) return savedName.trim()

  try {
    const name = await conn.getName(jid)
    if (typeof name === 'string' && name.trim()) return name.trim()
  } catch (e) { }

  return jid?.split('@')[0] || 'usuario'
}

const getAlyaCoreUrl = async (type) => {
  // Lógica de validación de tu llave original intacta
  const apiKey = global.apikey || global.APIKeys?.alyacore || global.APIKeys?.['api.alyacore.xyz'] || process.env.ALYACORE_APIKEY || process.env.ALYACORE_KEY;
  
  const params = new URLSearchParams({ type })
  // Corregido: La mayoría de las APIs esperan "apikey" y no "key", lo que a veces causa el 404
  if (apiKey) params.set('apikey', apiKey) 

  try {
    // Intento 1: AlyaCore (con una ruta alternativa común por si la principal falló)
    const res = await fetch(`https://api.alyacore.xyz/api/anime/interaction?${params.toString()}`)
    if (res.ok) {
      const json = await res.json()
      if (json?.status && json?.result) return json.result
    }

    // Intento 2: AlyaCore (tu ruta original)
    const res2 = await fetch(`https://api.alyacore.xyz/anime/interaction?${params.toString()}`)
    if (res2.ok) {
      const json2 = await res2.json()
      if (json2?.status && json2?.result) return json2.result
    }
  } catch (e) {
    console.log('[API] AlyaCore falló. Pasando al sistema de respaldo...');
  }

  // INTENTO 3: SISTEMA DE RESPALDO (Evita que el bot colapse si AlyaCore da 404 a cada rato)
  try {
    const waifuPicsTypes = ['bully', 'cuddle', 'cry', 'hug', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'bite', 'slap', 'kill', 'happy', 'wink', 'dance', 'cringe']
    
    if (waifuPicsTypes.includes(type)) {
      const resWaifu = await fetch(`https://api.waifu.pics/sfw/${type}`)
      if (resWaifu.ok) {
        const jsonWaifu = await resWaifu.json()
        return jsonWaifu.url // Devuelve una URL funcional sin importar si AlyaCore está caído
      }
    }
  } catch (e) {}

  throw new Error('Todas las APIs (AlyaCore y Respaldo) están caídas o no encontraron resultados.')
}

let handler = async (m, { conn, command, usedPrefix }) => {
  const type = aliases[command] || command
  const interaction = interactions[type]

  if (!interaction) return m.reply('❌ Interacción no reconocida.')

  const mentionedJid = m.mentionedJid || []
  const userId = mentionedJid.length > 0 ? mentionedJid[0] : (m.quoted?.sender || m.sender)
  const from = await getDisplayName(conn, m.sender)
  const who = await getDisplayName(conn, userId)
  const isSelf = userId === m.sender
  const caption = isSelf
    ? `\`${from}\` *${interaction.verbSelf}.*`
    : `\`${from}\` *${interaction.verbOther}* \`${who}\`.`

  try {
    const url = await getAlyaCoreUrl(type)
    await conn.sendMessage(m.chat, {
      video: { url },
      gifPlayback: true,
      caption,
      mentions: isSelf ? [m.sender] : [m.sender, userId]
    }, { quoted: m })
  } catch (e) {
    return m.reply(`❌ Error de conexión al buscar el GIF (404).\n\nEjemplo: *${usedPrefix}${command} @usuario*\n> ${e.message}`)
  }
}

handler.help = commands.map(command => `${command} @tag`)
handler.tags = ['anime']
handler.command = commands
handler.group = true

export default handler
