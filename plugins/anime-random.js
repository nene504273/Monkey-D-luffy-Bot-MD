import fetch from 'node-fetch'

// Textos directos en español, separados por acción y si es a uno mismo o a otro
const interactionMessages = {
  angry: {
    self: '*{from}* está enojado/a consigo mismo/a.',
    other: '*{from}* está enojado/a con *{who}*.'
  },
  bath: {
    self: '*{from}* se está bañando.',
    other: '*{from}* baña a *{who}*.'
  },
  bite: {
    self: '*{from}* se muerde a sí mismo/a.',
    other: '*{from}* muerde a *{who}*.'
  },
  bleh: {
    self: '*{from}* saca la lengua.',
    other: '*{from}* le saca la lengua a *{who}*.'
  },
  blush: {
    self: '*{from}* se sonroja.',
    other: '*{from}* se sonroja por *{who}*.'
  },
  bored: {
    self: '*{from}* está aburrido/a.',
    other: '*{from}* está aburrido/a de *{who}*.'
  },
  clap: {
    self: '*{from}* aplaude.',
    other: '*{from}* aplaude a *{who}*.'
  },
  coffee: {
    self: '*{from}* toma café.',
    other: '*{from}* toma café con *{who}*.'
  },
  cry: {
    self: '*{from}* está llorando.',
    other: '*{from}* llora por *{who}*.'
  },
  cuddle: {
    self: '*{from}* se acurruca.',
    other: '*{from}* se acurruca con *{who}*.'
  },
  dance: {
    self: '*{from}* está bailando.',
    other: '*{from}* baila con *{who}*.'
  },
  drunk: {
    self: '*{from}* está borracho/a.',
    other: '*{from}* está borracho/a gracias a *{who}*.'
  },
  eat: {
    self: '*{from}* está comiendo.',
    other: '*{from}* come con *{who}*.'
  },
  happy: {
    self: '*{from}* está feliz.',
    other: '*{from}* está feliz con *{who}*.'
  },
  hug: {
    self: '*{from}* se abraza a sí mismo/a.',
    other: '*{from}* abraza a *{who}*.'
  },
  kill: {
    self: '*{from}* se mata a sí mismo/a.',
    other: '*{from}* mata a *{who}*.'
  },
  kiss: {
    self: '*{from}* se besa a sí mismo/a.',
    other: '*{from}* besa a *{who}*.'
  },
  laugh: {
    self: '*{from}* se ríe.',
    other: '*{from}* se ríe de *{who}*.'
  },
  lick: {
    self: '*{from}* se lame.',
    other: '*{from}* lame a *{who}*.'
  },
  slap: {
    self: '*{from}* se abofetea.',
    other: '*{from}* le da una bofetada a *{who}*.'
  },
  sleep: {
    self: '*{from}* está durmiendo.',
    other: '*{from}* duerme con *{who}*.'
  },
  smoke: {
    self: '*{from}* está fumando.',
    other: '*{from}* fuma con *{who}*.'
  },
  spit: {
    self: '*{from}* escupe.',
    other: '*{from}* escupe a *{who}*.'
  },
  step: {
    self: '*{from}* pisa fuerte.',
    other: '*{from}* pisa a *{who}*.'
  },
  think: {
    self: '*{from}* está pensando.',
    other: '*{from}* piensa en *{who}*.'
  },
  love: {
    self: '*{from}* está enamorado/a.',
    other: '*{from}* está enamorado/a de *{who}*.'
  },
  pat: {
    self: '*{from}* se da palmaditas.',
    other: '*{from}* le da palmaditas a *{who}*.'
  },
  pout: {
    self: '*{from}* hace pucheros.',
    other: '*{from}* le hace pucheros a *{who}*.'
  },
  punch: {
    self: '*{from}* se golpea a sí mismo/a.',
    other: '*{from}* golpea a *{who}*.'
  },
  run: {
    self: '*{from}* está corriendo.',
    other: '*{from}* corre hacia *{who}*.'
  },
  sad: {
    self: '*{from}* está triste.',
    other: '*{from}* está triste por *{who}*.'
  },
  scared: {
    self: '*{from}* está asustado/a.',
    other: '*{from}* está asustado/a de *{who}*.'
  },
  seduce: {
    self: '*{from}* se seduce a sí mismo/a.',
    other: '*{from}* seduce a *{who}*.'
  },
  shy: {
    self: '*{from}* está tímido/a.',
    other: '*{from}* se pone tímido/a con *{who}*.'
  },
  walk: {
    self: '*{from}* está caminando.',
    other: '*{from}* camina junto a *{who}*.'
  },
  dramatic: {
    self: '*{from}* hace drama.',
    other: '*{from}* hace drama por *{who}*.'
  },
  kisscheek: {
    self: '*{from}* se besa la mejilla.',
    other: '*{from}* le da un beso en la mejilla a *{who}*.'
  },
  wink: {
    self: '*{from}* guiña un ojo.',
    other: '*{from}* le guiña un ojo a *{who}*.'
  },
  cringe: {
    self: '*{from}* siente vergüenza ajena.',
    other: '*{from}* siente vergüenza ajena por *{who}*.'
  },
  smug: {
    self: '*{from}* presume con aires de superioridad.',
    other: '*{from}* presume ante *{who}*.'
  },
  smile: {
    self: '*{from}* está sonriendo.',
    other: '*{from}* le sonríe a *{who}*.'
  },
  highfive: {
    self: '*{from}* choca los cinco consigo mismo/a.',
    other: '*{from}* choca los cinco con *{who}*.'
  },
  handhold: {
    self: '*{from}* se toma de la mano.',
    other: '*{from}* toma de la mano a *{who}*.'
  },
  bully: {
    self: '*{from}* se hace bullying a sí mismo/a.',
    other: '*{from}* le hace bullying a *{who}*.'
  },
  wave: {
    self: '*{from}* saluda.',
    other: '*{from}* saluda a *{who}*.'
  },
  impregnate: {
    self: '*{from}* intenta algo raro consigo mismo/a.',
    other: '*{from}* deja embarazada a *{who}*.'
  },
  bonk: {
    self: '*{from}* se da un bonk.',
    other: '*{from}* le da un bonk a *{who}*.'
  }
}

let handler = async (m, { conn, command, usedPrefix }) => {
  let mentionedJid = await m.mentionedJid
  let userId = mentionedJid.length > 0 ? mentionedJid[0] : (m.quoted ? await m.quoted.sender : m.sender)
  let from = await (async () => global.db.data.users[m.sender].name || (async () => { try { const n = await conn.getName(m.sender); return typeof n === 'string' && n.trim() ? n : m.sender.split('@')[0] } catch { return m.sender.split('@')[0] } })())()
  let who = await (async () => global.db.data.users[userId].name || (async () => { try { const n = await conn.getName(userId); return typeof n === 'string' && n.trim() ? n : userId.split('@')[0] } catch { return userId.split('@')[0] } })())()
  let str, type

  const interactions = {
    'angry': { type: 'angry' },
    'bath': { type: 'bath' },
    'bite': { type: 'bite' },
    'bleh': { type: 'bleh' },
    'blush': { type: 'blush' },
    'bored': { type: 'bored' },
    'clap': { type: 'clap' },
    'coffee': { type: 'coffee' },
    'cry': { type: 'cry' },
    'cuddle': { type: 'cuddle' },
    'dance': { type: 'dance' },
    'drunk': { type: 'drunk' },
    'eat': { type: 'eat' },
    'happy': { type: 'happy' },
    'hug': { type: 'hug' },
    'kill': { type: 'kill' },
    'kiss': { type: 'kiss' },
    'laugh': { type: 'laugh' },
    'lick': { type: 'lick' },
    'slap': { type: 'slap' },
    'sleep': { type: 'sleep' },
    'smoke': { type: 'smoke' },
    'spit': { type: 'spit' },
    'step': { type: 'step' },
    'think': { type: 'think' },
    'love': { type: 'love' },
    'pat': { type: 'pat' },
    'pout': { type: 'pout' },
    'punch': { type: 'punch' },
    'run': { type: 'run' },
    'sad': { type: 'sad' },
    'scared': { type: 'scared' },
    'seduce': { type: 'seduce' },
    'shy': { type: 'shy' },
    'walk': { type: 'walk' },
    'dramatic': { type: 'dramatic' },
    'kisscheek': { type: 'kisscheek' },
    'wink': { type: 'wink' },
    'cringe': { type: 'cringe' },
    'smug': { type: 'smug' },
    'smile': { type: 'smile' },
    'highfive': { type: 'highfive' },
    'handhold': { type: 'handhold' },
    'bully': { type: 'bully' },
    'wave': { type: 'wave' },
    'impregnate': { type: 'impregnate' },
    'bonk': { type: 'bonk' }
  }

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
    'hello': 'wave'
  }

  const cmd = aliases[command] || command
  const interaction = interactions[cmd]

  if (!interaction) return m.reply('❌ Esa interacción no está disponible.')

  type = interaction.type
  const isSelf = from === who
  const messages = interactionMessages[type]
  if (!messages) return m.reply('❌ Texto no encontrado para esta acción.')

  // Reemplaza las variables en el texto según si es a uno mismo o a otro
  let template = isSelf ? messages.self : messages.other
  str = template.replace('{from}', from).replace('{who}', who)

  if (m.isGroup) {
    try {
      // ⚠️ CAMBIA 'apikey' POR TU API KEY REAL
      const apikey = 'LUFFY-GEAR4'
      const res = await fetch(`https://api.alyacore.xyz/anime/interaction?type=${type}&key=${apikey}`)
      const json = await res.json()

      if (!json.status || !json.result) {
        return m.reply('⚠️ No se encontraron resultados.')
      }

      conn.sendMessage(m.chat, { 
        video: { url: json.result }, 
        gifPlayback: true, 
        caption: str, 
        mentions: [userId] 
      }, { quoted: m })
    } catch (e) {
      return m.reply(`❌ Ocurrió un error: ${e.message}`)
    }
  }
}

handler.help = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'hello', 'wave', 'hello']
handler.tags = ['anime']
handler.command = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'hello', 'wave', 'hello']
handler.group = true

export default handler