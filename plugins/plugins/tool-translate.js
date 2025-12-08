import translate from '@vitalets/google-translate-api'
import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const defaultLang = 'es'
  const msg = `☠️ *¡GOMU GOMU NO... ERROR!*  
Debes escribir el idioma y el texto que quieres traducir.  
✏️ Ejemplo: *usedPrefix + command en Hola mundo*`

  if (!args || !args[0]) 
    if (m.quoted?.text) 
      args = [defaultLang, m.quoted.text]
     else 
      return m.reply(msg)
    

  let lang = args[0]
  let text = args.slice(1).join(' ')

  if ((args[0] || ”).length !== 2) 
    lang = defaultLang
    text = args.join(' ')
  

  try 
    await m.react('🌐')
    const res = await fetch(`https://api.lolhuman.xyz/api/translate/auto/{lang}?apikey=lolkeysapi   text={text}`)
    const json = await res.json()
    const result = json.result.translated

    await conn.reply(m.chat, `🌍 *Traducción (lang)*{result}`, m)
    await m.react('✅')
    } catch (err1) {
    await m.react('❌')
    await m.reply(`⚠️ *Falló lolhuman, intentando con Google...*`, m)

    try {
      const result2 = await translate(text, { to: lang, autoCorrect: true })
      await conn.reply(m.chat, `🌍 *Traducción (lang)*{result2.text}`, m)
      await m.react('✅')
    } catch (err2) {
      await m.react('❌')
      await m.reply(`☠️ *¡Ni Google ni lolhuman funcionaron!*  
Usa *usedPrefixreport* para informar el error.  
>{err2.message}`, m)
    }
  }
}

handler.help = ['translate <lang> <text>']
handler.tags = ['tools']
handler.command = ['translate', 'traducir', 'trad']
handler.group = true

export default handler
