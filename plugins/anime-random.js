import fetch from 'node-fetch'

let handler = async (m, { conn, command, usedPrefix }) => {
let mentionedJid = await m.mentionedJid
let userId = mentionedJid.length > 0 ? mentionedJid[0] : (m.quoted ? await m.quoted.sender : m.sender)
let from = await (async () => global.db.data.users[m.sender].name || (async () => { try { const n = await conn.getName(m.sender); return typeof n === 'string' && n.trim() ? n : m.sender.split('@')[0] } catch { return m.sender.split('@')[0] } })())()
let who = await (async () => global.db.data.users[userId].name || (async () => { try { const n = await conn.getName(userId); return typeof n === 'string' && n.trim() ? n : userId.split('@')[0] } catch { return userId.split('@')[0] } })())()
let str, type

const key = "Duarte-zz12"
const interactions = {
'angry': { type: 'angry', str: (f, w) => f === w ? `\`${f}\` está enojado/a` : `\`${f}\` está enojado/a con \`${w}\`` },
'bath': { type: 'bath', str: (f, w) => f === w ? `\`${f}\` se está bañando` : `\`${f}\` está bañando a \`${w}\`` },
'bite': { type: 'bite', str: (f, w) => f === w ? `\`${f}\` se mordió a sí mismo/a` : `\`${f}\` mordió a \`${w}\`` },
'bleh': { type: 'bleh', str: (f, w) => f === w ? `\`${f}\` saca la lengua` : `\`${f}\` le sacó la lengua a \`${w}\`` },
'blush': { type: 'blush', str: (f, w) => f === w ? `\`${f}\` se sonrojó` : `\`${f}\` se sonrojó por \`${w}\`` },
'bored': { type: 'bored', str: (f, w) => f === w ? `\`${f}\` está aburrido/a` : `\`${f}\` está aburrido/a de \`${w}\`` },
'clap': { type: 'clap', str: (f, w) => f === w ? `\`${f}\` está aplaudiendo` : `\`${f}\` está aplaudiendo por \`${w}\`` },
'coffee': { type: 'coffee', str: (f, w) => f === w ? `\`${f}\` está tomando café` : `\`${f}\` está tomando café con \`${w}\`` },
'cry': { type: 'cry', str: (f, w) => f === w ? `\`${f}\` está llorando` : `\`${f}\` está llorando por \`${w}\`` },
'cuddle': { type: 'cuddle', str: (f, w) => f === w ? `\`${f}\` se acurrucó consigo mismo/a` : `\`${f}\` se acurrucó con \`${w}\`` },
'dance': { type: 'dance', str: (f, w) => f === w ? `\`${f}\` está bailando` : `\`${f}\` está bailando con \`${w}\`` },
'drunk': { type: 'drunk', str: (f, w) => f === w ? `\`${f}\` está borracho` : `\`${f}\` está borracho con \`${w}\`` },
'eat': { type: 'eat', str: (f, w) => f === w ? `\`${f}\` está comiendo` : `\`${f}\` está comiendo con \`${w}\`` },
'happy': { type: 'happy', str: (f, w) => f === w ? `\`${f}\` está feliz` : `\`${f}\` está feliz por \`${w}\`` },
'hug': { type: 'hug', str: (f, w) => f === w ? `\`${f}\` se abrazó a sí mismo/a` : `\`${f}\` abrazó a \`${w}\`` },
'kill': { type: 'kill', str: (f, w) => f === w ? `\`${f}\` se mató a sí mismo/a` : `\`${f}\` mató a \`${w}\`` },
'kiss': { type: 'kiss', str: (f, w) => f === w ? `\`${f}\` se besó a sí mismo/a` : `\`${f}\` besó a \`${w}\`` },
'laugh': { type: 'laugh', str: (f, w) => f === w ? `\`${f}\` se ríe` : `\`${f}\` se ríe de \`${w}\`` },
'lick': { type: 'lick', str: (f, w) => f === w ? `\`${f}\` se lamió a sí mismo/a` : `\`${f}\` lamió a \`${w}\`` },
'slap': { type: 'slap', str: (f, w) => f === w ? `\`${f}\` se golpeó a sí mismo/a` : `\`${f}\` le dio una bofetada a \`${w}\`` },
'sleep': { type: 'sleep', str: (f, w) => f === w ? `\`${f}\` está durmiendo profundamente` : `\`${f}\` duerme junto a \`${w}\`` },
'smoke': { type: 'smoke', str: (f, w) => f === w ? `\`${f}\` está fumando` : `\`${f}\` está fumando con \`${w}\`` },
'spit': { type: 'spit', str: (f, w) => f === w ? `\`${f}\` se escupió a sí mismo/a` : `\`${f}\` escupió a \`${w}\`` },
'step': { type: 'step', str: (f, w) => f === w ? `\`${f}\` se pisó a sí mismo/a` : `\`${f}\` pisó a \`${w}\` sin piedad` },
'think': { type: 'think', str: (f, w) => f === w ? `\`${f}\` está pensando` : `\`${f}\` está pensando en \`${w}\`` },
'love': { type: 'love', str: (f, w) => f === w ? `\`${f}\` está enamorado/a de sí mismo/a` : `\`${f}\` está enamorado/a de \`${w}\`` },
'pat': { type: 'pat', str: (f, w) => f === w ? `\`${f}\` se da palmaditas` : `\`${f}\` acaricia suavemente a \`${w}\`` },
'pout': { type: 'pout', str: (f, w) => f === w ? `\`${f}\` hace pucheros` : `\`${f}\` está haciendo pucheros por \`${w}\`` },
'punch': { type: 'punch', str: (f, w) => f === w ? `\`${f}\` se golpeó a sí mismo/a` : `\`${f}\` golpea a \`${w}\` con todas sus fuerzas` },
'run': { type: 'run', str: (f, w) => f === w ? `\`${f}\` está haciendo cardio` : `\`${f}\` sale disparado/a al ver a \`${w}\`` },
'sad': { type: 'sad', str: (f, w) => f === w ? `\`${f}\` está triste` : `\`${f}\` piensa en \`${w}\` con tristeza` },
'scared': { type: 'scared', str: (f, w) => f === w ? `\`${f}\` se asusta` : `\`${f}\` está asustado/a por \`${w}\`` },
'seduce': { type: 'seduce', str: (f, w) => f === w ? `\`${f}\` susurra palabras de amor al aire` : `\`${f}\` lanza una mirada que atrae a \`${w}\`` },
'shy': { type: 'shy', str: (f, w) => f === w ? `\`${f}\` está tímido/a` : `\`${f}\` baja la mirada tímidamente frente a \`${w}\`` },
'walk': { type: 'walk', str: (f, w) => f === w ? `\`${f}\` pasea` : `\`${f}\` está caminando con \`${w}\`` },
'dramatic': { type: 'dramatic', str: (f, w) => f === w ? `\`${f}\` está actuando dramáticamente` : `\`${f}\` está actuando por \`${w}\`` },
'kisscheek': { type: 'kisscheek', str: (f, w) => f === w ? `\`${f}\` se besó la mejilla` : `\`${f}\` besó la mejilla de \`${w}\`` },
'wink': { type: 'wink', str: (f, w) => f === w ? `\`${f}\` se guiñó el ojo` : `\`${f}\` le guiñó el ojo a \`${w}\`` },
'cringe': { type: 'cringe', str: (f, w) => f === w ? `\`${f}\` siente vergüenza` : `\`${f}\` siente vergüenza por \`${w}\`` },
'smug': { type: 'smug', str: (f, w) => f === w ? `\`${f}\` está presumiendo` : `\`${f}\` está presumiendo a \`${w}\`` },
'smile': { type: 'smile', str: (f, w) => f === w ? `\`${f}\` está sonriendo` : `\`${f}\` le sonrió a \`${w}\`` },
'highfive': { type: 'highfive', str: (f, w) => f === w ? `\`${f}\` se chocó los cinco` : `\`${f}\` chocó los cinco con \`${w}\`` },
'handhold': { type: 'handhold', str: (f, w) => f === w ? `\`${f}\` se dio la mano a sí mismo/a` : `\`${f}\` le agarró la mano a \`${w}\`` },
'bully': { type: 'bully', str: (f, w) => f === w ? `\`${f}\` se hace bullying solo` : `\`${f}\` está haciendo bullying a \`${w}\`` },
'wave': { type: 'wave', str: (f, w) => f === w ? `\`${f}\` se saludó a sí mismo/a` : `\`${f}\` está saludando a \`${w}\`` },
'impregnate': { type: 'impregnate', str: (f, w) => f === w ? `\`${f}\` se embarazó solo/a` : `\`${f}\` le regaló 9 meses de espera a \`${w}\`` },
'bonk': { type: 'bonk', str: (f, w) => f === w ? `\`${f}\` se dio un golpe` : `\`${f}\` le dio un bonk a \`${w}\`` }
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
'ola': 'wave',
'hola': 'wave'
}

const cmd = aliases[command] || command
const interaction = interactions[cmd]

if (!interaction) return m.reply('⚠︎ Comando no reconocido.')

str = interaction.str(from, who)
type = interaction.type

if (m.isGroup) {
try {
const res = await fetch(`https://rest.alyabotpe.xyz/sfw/interaction?type=${type}&key=${key}`)
const json = await res.json()

if (!json.status || !json.result) return m.reply('ꕥ No se encontraron resultados.')

conn.sendMessage(m.chat, { video: { url: json.result }, gifPlayback: true, caption: str, mentions: [userId] }, { quoted: m })
} catch (e) {
return m.reply(`⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`)
}}}

handler.help = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'ola', 'wave', 'hola']
handler.tags = ['anime']
handler.command = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'ola', 'wave', 'hola']
handler.group = true

export default handler