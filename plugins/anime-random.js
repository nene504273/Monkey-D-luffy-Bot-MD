import fetch from 'node-fetch'
import { t } from '../locales/index.js'

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
    'hello': 'wave',
    'hello': 'wave'
  }

  const cmd = aliases[command] || command
  const interaction = interactions[cmd]

  if (!interaction) return m.reply(t('anime:interactions.not_recognized', conn.user.jid))

  type = interaction.type
  const isSelf = from === who
  const translationKey = `anime:interactions.${type}_${isSelf ? 'self' : 'other'}`
  str = t(translationKey, conn.user.jid, { from, who })

  if (m.isGroup) {
    try {
      const res = await fetch(`https://api.alyacore.xyz/anime/interaction?type=${type}&key=${apikey}`)
      const json = await res.json()

      if (!json.status || !json.result) {
        return m.reply(t('anime:interactions.no_results', conn.user.jid))
      }

      conn.sendMessage(m.chat, { 
        video: { url: json.result }, 
        gifPlayback: true, 
        caption: str, 
        mentions: [userId] 
      }, { quoted: m })
    } catch (e) {
      return m.reply(t('anime:interactions.error', conn.user.jid, { 
        prefix: usedPrefix, 
        error: e.message 
      }))
    }
  }
}

handler.help = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'hello', 'wave', 'hello']
handler.tags = ['anime']
handler.command = ['angry', 'enojado', 'bath', 'bañarse', 'bite', 'morder', 'bleh', 'lengua', 'blush', 'sonrojarse', 'bored', 'aburrido', 'clap', 'aplaudir', 'coffee', 'cafe', 'café', 'cry', 'llorar', 'cuddle', 'acurrucarse', 'dance', 'bailar', 'drunk', 'borracho', 'eat', 'comer', 'palmada', 'feliz', 'happy', 'hug', 'abrazar', 'kill', 'matar', 'kiss', 'muak', 'laugh', 'reirse', 'lick', 'lamer', 'slap', 'bofetada', 'sleep', 'dormir', 'smoke', 'fumar', 'spit', 'escupir', 'step', 'pisar', 'think', 'pensar', 'love', 'enamorado', 'enamorada', 'pat', 'palmadita', 'pout', 'pucheros', 'punch', 'pegar', 'golpear', 'preg', 'preñar', 'embarazar', 'run', 'correr', 'sad', 'triste', 'scared', 'asustada', 'asustado', 'seduce', 'seducir', 'shy', 'timido', 'timida', 'walk', 'caminar', 'dramatic', 'drama', 'kisscheek', 'beso', 'wink', 'guiñar', 'cringe', 'avergonzarse', 'smug', 'presumir', 'smile', 'sonreir', 'highfive', '5', 'bully', 'bullying', 'mano', 'handhold', 'hello', 'wave', 'hello']
handler.group = true

export default handler