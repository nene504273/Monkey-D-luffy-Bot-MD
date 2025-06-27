import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;

  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: "0@s.whatsapp.net"
  }

  const username = encodeURIComponent(m.messageStubParameters[0].split('@')[0])
  const guildName = encodeURIComponent(groupMetadata.subject)
  const memberCount = participants.length + (m.messageStubType == 27 ? 1 : 0) - ((m.messageStubType == 28 || m.messageStubType == 32) ? 1 : 0)
  const avatar = encodeURIComponent(await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://files.catbox.moe/emwtzj.png'))

  const backgroundWelcome = encodeURIComponent('https://i.ibb.co/4YBNyvP/images-76.jpg')
  const backgroundGoodbye = encodeURIComponent('https://i.ibb.co/9b8MdJr/farewell-anime.jpg')

  const welcomeApiUrl = `https://api.siputzx.my.id/api/canvas/welcomev1?username=${username}&guildName=${guildName}&memberCount=${memberCount}&avatar=${avatar}&background=${backgroundWelcome}&quality=80`
  const goodbyeApiUrl = `https://api.siputzx.my.id/api/canvas/welcomev1?username=${username}&guildName=${guildName}&memberCount=${memberCount}&avatar=${avatar}&background=${backgroundGoodbye}&quality=80`

  async function fetchImage(url, fallbackUrl) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('No se pudo descargar')
      return await res.buffer()
    } catch {
      const resFallback = await fetch(fallbackUrl)
      return await resFallback.buffer()
    }
  }

  let chat = global.db.data.chats[m.chat]
  let txtWelcome = 'ゲ◜៹ New Member ៹◞ゲ'
  let txtGoodbye = 'ゲ◜៹ Bye Member ៹◞ゲ'

  if (chat.welcome) {
    if (m.messageStubType == 27) {
      let imgBuffer = await fetchImage(welcomeApiUrl, avatar)
      let bienvenida = `❀ *Bienvenido/a* a ${groupMetadata.subject}\n✰ @${username}\n${global.welcom1}\n✦ Ahora somos ${memberCount} miembros.\n> Usa *#help* si no sabes por dónde empezar.`
      await conn.sendMini(m.chat, txtWelcome, dev, bienvenida, imgBuffer, imgBuffer, redes, fkontak)
    } else if (m.messageStubType == 28 || m.messageStubType == 32) {
      let imgBuffer = await fetchImage(goodbyeApiUrl, avatar)
      let despedida = `❀ *Adiós* de ${groupMetadata.subject}\n✰ @${username}\n${global.welcom2}\n✦ Ahora somos ${memberCount} miembros.\n> ¡Vuelve pronto si lo deseas!`
      await conn.sendMini(m.chat, txtGoodbye, dev, despedida, imgBuffer, imgBuffer, redes, fkontak)
    }
  }
}
