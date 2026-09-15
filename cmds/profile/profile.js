import db from "#db"
import moment from 'moment-timezone';

export default {
  command: ['profile', 'perfil'],
  category: 'profile',
  run: async ({ msg, sock }) => {
    const texto = msg.mentionedJid
    const userId = texto.length > 0 ? texto[0] : msg.quoted ? msg.quoted.sender : msg.sender

    const chat = await db.getChat(msg.chat)
    const chatUsers = await db.getChatUser(msg.chat, userId)
    const globalUsers = await db.getUser(userId)
   const userss = await db.getChatUser(msg.chat, userId)

    if (!userss) {
      return msg.reply('✐ El usuario *mencionado* no está *registrado* en el bot')
    }

    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net' || ''
    const settings = await db.getSettings(idBot)
    const currency = settings.currency || ''

    const user = chatUsers || {}
    const user2 = globalUsers || {}

    const globalUsers2 = await db.getUser(user2.marry)
    const globalUsers3 = await db.getUser()

    const name = user2.name || ''
    const birth = user2.birth || 'Sin especificar'
    const genero = user2.genre || 'Oculto'
    const comandos = user2.usedcommands || '0'
    const pareja = user2.marry ? `${globalUsers2.name}` : 'Nadie'
    const estadoCivil =
      genero === 'Mujer' ? 'Casada con' : genero === 'Hombre' ? 'Casado con' : 'Casadx con'
    const desc = user2.description ? `\n\n${user2.description}` : ''
    const pasatiempo = user2.pasatiempo ? `${user2.pasatiempo}` : 'No definido'
    const exp = user2.exp || 0
    const nivel = user2.level || 0
    const chocolates = user.coins || 0
    const banco = user.bank || 0
    const totalCoins = chocolates + banco
    const harem = user?.characters?.length || 0

    const perfil = await sock
      .profilePictureUrl(userId, 'image')
      .catch((_) => 'https://h.uguu.se/PMBnVUgn.jpg')

const users = (globalUsers3 || []).map(u => ({...u, jid: u.id }))
const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0))
try {
  const rank = sortedLevel.findIndex(u => u.jid === userId) + 1

    const profileText = `- ׄ　ꕤ　ׅ ໌　۟　𝖯𝖾𝗋𝖿𝗂𝗅　ׅ　팅화　ׄ

𖣣ֶㅤ֯⌗ ❖ ׄ ⬭ Cumpleaños › *${birth}*
𖣣ֶㅤ֯⌗ ❀ ׄ ⬭ Pasatiempo › *${pasatiempo}*
𖣣ֶㅤ֯⌗ ⚥ ׄ ⬭ Género › *${genero}*
𖣣ֶㅤ֯⌗ ✿ ׄ ⬭ ${estadoCivil} › *${pareja}*${desc}

𖣣ֶㅤ֯⌗ ✧ ׄ ⬭ Nivel › *${nivel}*
𖣣ֶㅤ֯⌗ ✤ ׄ ⬭ Experiencia › *${exp.toLocaleString()}*
𖣣ֶㅤ֯⌗ ❒ ׄ ⬭ Puesto › *#${rank}*

𖣣ֶㅤ֯⌗ ꕥ ׄ ⬭ Harem › *${harem.toLocaleString()}*
𖣣ֶㅤ֯⌗ ⛁  ׄ ⬭ Dinero Total › *¥${totalCoins.toLocaleString()} ${currency}*
𖣣ֶㅤ֯⌗ ☄︎  ׄ ⬭ Comandos ejecutados › *${comandos.toLocaleString()}*`

   await sock.sendMessage(
      msg.chat,
      {
        image: { url: perfil },
        caption: profileText,
      },
      { quoted: msg },
    )
  } catch (e) {
  msg.reply(msgglobal)
  }
  }
};