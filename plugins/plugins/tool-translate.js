import translate from '@vitalets/google-translate-api'
import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const defaultLang = 'es' // Idioma por defecto
  const msg = `☠️ *¡GOMU GOMU NO... ERROR!* Debes escribir el idioma y el texto que quieres traducir. 
✏️ Ejemplo: *${usedPrefix}${command} en Hola mundo*`

  let lang = defaultLang
  let text = ''

  // 1. Manejo de argumentos (lenguaje y texto)
  if (!args || args.length === 0) {
    if (m.quoted?.text) {
      // Si hay un mensaje citado, usa el idioma por defecto y el texto citado
      text = m.quoted.text
    } else {
      // Si no hay argumentos ni texto citado, muestra el mensaje de error
      return m.reply(msg)
    }
  } else if (args[0].length === 2 && args.length > 1) {
    // Si el primer argumento es un código de 2 letras y hay más argumentos
    lang = args[0].toLowerCase() // El código de idioma debe ser de 2 letras y minúscula
    text = args.slice(1).join(' ')
  } else {
    // Si solo se proporciona texto sin especificar un idioma (usará el por defecto)
    text = args.join(' ')
    lang = defaultLang
  }
  
  if (!text) return m.reply(msg) // Verificación final de que hay texto para traducir

  // --- Inicio de la Traducción ---
  try {
    await m.react('🌐')

    // 2. Intento con lolhuman (Usando backticks y ${} para la URL)
    const url = `https://api.lolhuman.xyz/api/translate/auto/${lang}?apikey=lolkeysapi&text=${encodeURIComponent(text)}`
    
    const res = await fetch(url)
    const json = await res.json()

    // 3. Verificación de la respuesta de lolhuman
    if (json.status === 200 && json.result && json.result.translated) {
      const result = json.result.translated
      // 4. Uso correcto de plantillas de string para la respuesta
      await conn.reply(m.chat, `🌍 *Traducción (${lang.toUpperCase()})*\n\n${result}`, m)
      await m.react('✅')
      return // Terminamos aquí si tiene éxito
    } else {
        // Si lolhuman falla pero responde, vamos al bloque catch para Google
        throw new Error('La API de Lolhuman falló o devolvió un error.')
    }
    
  } catch (err1) {
    // 5. El error de lolhuman se maneja aquí
    console.error('Error con lolhuman:', err1) // Muestra el error en la consola
    await m.react('❌')
    await m.reply(`⚠️ *Falló lolhuman, intentando con Google...*`, m)

    // 6. Intento con Google Translate (Usando @vitalets/google-translate-api)
    try {
      const result2 = await translate(text, { to: lang, autoCorrect: true })
      await conn.reply(m.chat, `🌍 *Traducción (${lang.toUpperCase()})*\n\n${result2.text}`, m)
      await m.react('✅')
    } catch (err2) {
      // 7. Error final si Google falla
      console.error('Error con Google Translate:', err2) // Muestra el error en la consola
      await m.react('❌')
      await m.reply(`☠️ *¡Ni Google ni lolhuman funcionaron!* Asegúrate de que el código de idioma sea correcto (ej: *en*, *es*, *fr*).
>${err2.message}`, m)
    }
  }
}

handler.help = ['translate <lang> <text>']
handler.tags = ['tools']
handler.command = ['translate', 'traducir', 'trad']
// handler.group = true // Quité esta línea, a menos que solo quieras que funcione en grupos

export default handler