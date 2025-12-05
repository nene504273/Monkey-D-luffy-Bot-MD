import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const username = `${conn.getName(m.sender)}`
  const sender = m.sender
  const isOwner = sender.includes('584244144821') // Detecta si el número es el del creador ɴ͡ᴇ͜ɴᴇ❀᭄☂️

  // Prompt base de Monkey D. Luffy
  const basePrompt = `
Eres Monkey D. Luffy, el capitán de los Piratas del Sombrero de Paja de One Piece. Tu personalidad es:

- **LIBERTAD**: Valorar la libertad por encima de todo
- **DETERMINACIÓN**: Nada te detiene para alcanzar tus sueños
- **LEALTAD**: Proteges a tus amigos/nakama con tu vida
- **SIMPLEZA**: Eres directo y sincero en todo
- **AMBICIÓN**: Tu sueño es convertirte en el Rey de los Piratas
- **AMOR POR LA COMIDA**: ¡Siempre tienes hambre, especialmente de carne!

**ESTILO DE RESPUESTA**:
- Si tu creador ɴ͡ᴇ͜ɴᴇ❀᭄☂️ te habla (+58 424-4144821), muéstrate respetuoso pero mantén tu esencia libre
- Con otros usuarios, sé entusiasta y directo como siempre
- Usa frases características: "¡Soy Luffy!", "¡Voy a ser el Rey de los Piratas!", "¡Shishishi!"
- Habla de comida, aventuras y libertad
- Incluye emojis relacionados: 🏴‍☠️🍖⚓👒

**EJEMPLOS**:
Usuario: "¿Cómo ser más fuerte?"
Luffy: "¡Shishishi! No se trata solo de fuerza 🏴‍☠️ Tienes que proteger a tus amigos y nunca rendirte. ¡Y comer mucha carne ayuda! 🍖"

Usuario: "Estoy aburrido"
Luffy: "¡Vamos a una aventura! 🏴‍☠️ La vida es demasiado corta para aburrirse. ¡Busca un tesoro o algo divertido! ⚓"

Ahora responde lo siguiente manteniendo tu personaje:`

  if (!text) {
    return conn.reply(m.chat, `*[ 🏴‍☠️ ] ¡Hey! Dime algo, ¡quiero una aventura!*`, m)
  }

  await conn.sendPresenceUpdate('composing', m.chat)

  try {
    const prompt = `${basePrompt} ${text}`
    const response = await luminsesi(text, username, prompt)
    await conn.reply(m.chat, response, m)
  } catch (error) {
    console.error('*[ ℹ️ ] Error al obtener la respuesta:*', error)
    await conn.reply(m.chat, '*¡Parece que me atraparon... intenta más tarde!*', m)
  }
}

handler.help = ['ia']
handler.tags = ['tools']
handler.register = true
handler.command = ['luffy', 'monkey']
export default handler

// Función para interactuar con la IA usando prompts
async function luminsesi(q, username, logic) {
  try {
    const response = await axios.get(
      `https://api-adonix.ultraplus.click/ai/geminiact?apikey=Adofreekey&text=${encodeURIComponent(q)}&role=${encodeURIComponent(logic)}`
    )
    return response.data.message
  } catch (error) {
    console.error('*[ ℹ️ ] Error al obtener:*', error)
    throw error
  }
}