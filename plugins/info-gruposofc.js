let handler = async (m, { conn }) => {
  // ⚠️ Cambia esta URL por la imagen que quieras usar
  let banner = 'https://i.imgur.com/xxxxx.jpg'  // o './imagenes/banner.jpg' si es local

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

  try {
    await conn.sendFile(m.chat, banner, 'grupos.jpg', texto, m)
  } catch {
    // Si la imagen no se encuentra, manda solo el texto
    await conn.reply(m.chat, texto, m)
  }

  await m.react('🏴‍☠️')
}

handler.help = ['grupos']
handler.tags = ['info']
handler.command = ['grupos', 'links', 'groups']

export default handler