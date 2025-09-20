let handler = async (m, { conn }) => {}

handler.event = 'group-participants-update'
handler.disabled = false

handler.before = async function (m, { conn }) {
  let user = m.participants[0]
  let group = m.chat

  if (!global.db.data.chats[group].welcome) return

  try {
    if (m.action == 'add') {
      let pp = 'https:                                             
      let name = await conn.getName(user)
      let text = `✨ Bienvenido/a ${name} 👒 Al grupo de los piratas - Monkey D Luffy MD Lee las reglas, convive y prepárate para la aventura 🏴‍☠️⚔️`
      await conn.sendFile(group, pp, '//telegra.ph/file/265c672094dfa87caea19.jpg' 
      let name = await conn.getName(user)
      let text = `✨ Bienvenido/a ${name} 👒 Al grupo de los piratas - Monkey D Luffy MD Lee las reglas, convive y prepárate para la aventura 🏴‍☠️⚔️`
      await conn.sendFile(group, pp, 'welcome.jpg', text, m)
    } else if (m.action == 'remove' && m.participants[0] !== conn.user.jid) {
      let name = await conn.getName(user)
      let text = `🚫 ${name} ha sido eliminado del grupo. ¡No te preocupes, siempre serás recordado en Grand Line! 🌊😢`
      await conn.sendMessage(group, { text }, { quoted: m })
    } else if (m.action == 'remove') {
      let name = await conn.getName(user)
      let text = `👋 Adiós ${name} ¡Otro que no resistió la presión de Grand Line! 🌊☠️`
      await conn.sendMessage(group, { text }, { quoted: m })
    } 
  } catch (e) {
    console.error(e)
  }
}

export default handler