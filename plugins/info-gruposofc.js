let handler = async (m, { conn }) => {
  let texto = `*¡Hola! Te invito a unirte a los grupos oficiales del Bot para convivir con la comunidad.....*

- *Grupo Oficial*
> *❀* ${gp1}

- *Comunidad Oficial*
> *❀* ${comunidad1}

*ׄ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ*

⚘ *¿Enlace anulado? Entra aquí!*

- *Canal Oficial*
> *❀* ${channel}

> ${dev}`

  await conn.sendFile(m.chat, banner, 'grupos.jpg', texto, m)
  await m.react('🏴‍☠️')
}

handler.help = ['grupos']
handler.tags = ['info']
handler.command = ['grupos', 'links', 'groups']

export default handler