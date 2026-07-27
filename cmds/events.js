import { WAMessageStubType, prepareWAMessageMedia } from '@whiskeysockets/baileys'

const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⿻̸̷᮫̼̼፝͠🥨᪲ 𝐋𝗎𝖿𝖿𝗒 𝐆͢𝖾𝖺⃜𝗋 𝟧 ׅ ࿔𔗨̶🌊';

// ── Imágenes de bienvenida y despedida (estilo Luffy) ───────────────
const welcomeImage = 'https://n.uguu.se/LBkLPUzM.jpeg'   // Imagen de bienvenida
const byeImage = 'https://d.uguu.se/mEWKsMLi.jpeg'       // Imagen de despedida

// ── Utilidades (mantenidas) ──────────────────────────────────────────
function normalizeMentionJid(value) {
  if (!value) return null
  if (typeof value === 'object') value = value.id || value.jid || value.phoneNumber || value.lid || ''
  let text = String(value).trim()
  if (!text) return null
  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text)
      text = parsed.id || parsed.jid || parsed.phoneNumber || parsed.lid || text
    } catch {}
  }
  text = String(text).replace(/^@/, '').trim()
  if (/^\d+$/.test(text)) return `${text}@s.whatsapp.net`
  if (/^\d+@(?:s\.whatsapp\.net|lid)$/.test(text)) return text
  return text.includes('@') ? text : null
}

// ── Handler principal ────────────────────────────────────────────────
export async function before(m, { conn, participants = [], groupMetadata = {} } = {}) {
  if (!m.messageStubType || !m.isGroup) return true

  const chat = global.db.getChat(m.chat)
  if (!chat) return true

  const botJid = conn.user.jid.split('@')[0]
  const primaryBot = chat.botPrimario ? chat.botPrimario.split('@')[0] : null
  if (primaryBot && botJid !== primaryBot) return true

  const isWelcome = [
    WAMessageStubType.GROUP_PARTICIPANT_ADD,
    WAMessageStubType.GROUP_PARTICIPANT_INVITE,
    27, 31
  ].includes(m.messageStubType)

  const isBye = [
    WAMessageStubType.GROUP_PARTICIPANT_REMOVE,
    WAMessageStubType.GROUP_PARTICIPANT_LEAVE,
    28, 32
  ].includes(m.messageStubType)

  if (!isWelcome && !isBye) return true
  if ((isWelcome && !chat.welcome) || (isBye && !chat.bye)) return true

  const safeParticipants = Array.isArray(participants) ? participants : []
  const usuariosAfectados = Array.isArray(m.messageStubParameters) && m.messageStubParameters.length > 0
    ? m.messageStubParameters
    : [m.sender]

  const groupName = groupMetadata?.subject || 'este grupo'
  const desc = groupMetadata?.desc?.toString() || 'Sin descripción'
  const groupSize = (Array.isArray(groupMetadata?.participants) && groupMetadata.participants.length) || safeParticipants.length || 0

  const now = new Date()
  const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
  const tiempo = colombianTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, '')
  const tiempo2 = colombianTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const botLink ='🍃ᮢᩥ  𝖬𝗈𝗇𝗄𝖾𝗒 𝖣. 𝖫𝗎𝖿𝖿𝗒 '

  for (let userId of usuariosAfectados) {
    if (!userId) continue
    const targetJid = normalizeMentionJid(userId) || normalizeMentionJid(m.sender)
    if (!targetJid) continue
    const phone = targetJid.split('@')[0]
    const username = `@${phone}`

    try {
      const avatar = isWelcome ? welcomeImage : byeImage

      const linkPreview = botLink ? await prepareWAMessageMedia(
        { image: { url: avatar } },
        { upload: conn.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
      ).then(({ imageMessage }) => ({
        'canonical-url': botLink,
        'matched-text': botLink,
        title: isWelcome ? '⚓ ¡NUEVO NAKAMA! ⚓' : '⚓ ¡HASTA LUEGO, NAKAMA! ⚓',
        description: `🏴‍☠️ ${groupName} – ${groupSize} piratas`,
        jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined,
        highQualityThumbnail: imageMessage || undefined
      })) : undefined

      let caption
      if (isWelcome) {
        if (chat.welcomeText && chat.welcomeText.trim() !== '') {
          caption = chat.welcomeText
            .replace(/@user/g, username)
            .replace(/@subject/g, groupName)
            .replace(/@desc/g, desc)
            .replace(/@members/g, groupSize)
            .replace(/@time/g, `${tiempo} ${tiempo2}`)
        } else {
          // ── Plantilla bienvenida estilo Luffy ──────────────────────
          caption = `☠️⚓️  ꒰͡     𝖭 𝖠 𝖪 𝖠 𝖬 𝖠     
𑄹𑄹  »   ¡NUEVO PIRATA!   ✬✫

⪩⪩   ֹ  \`¡Bienvenido a la tripulación de\`
                 \`${groupName}\`  ꒱꒱ㅤㅤㅤ

*ֹ  ᦕ   ׄ                      _${username}_*

         ׅ     ⑅ ׄ     .˙ ¡Vamos por el One Piece! ֹ

な⃟   ۟  ─ _Ahora somos *${groupSize}* piratas!_

> Puedes usar \`/help\` para los comandos.
> ✐ 𝐋𝐢𝐧𝐤 » ${botLink || ''}`
        }
      } else {
        if (chat.byeText && chat.byeText.trim() !== '') {
          caption = chat.byeText
            .replace(/@user/g, username)
            .replace(/@subject/g, groupName)
            .replace(/@desc/g, desc)
            .replace(/@members/g, groupSize)
            .replace(/@time/g, `${tiempo} ${tiempo2}`)
        } else {
          // ── Plantilla despedida estilo Luffy ───────────────────────
          caption = `⚓💨  ꒰͡     𝖠 𝖣 𝖨 𝖮 𝖲     
𑄹𑄹  »   ¡HASTA LUEGO!   ✬✫

⪩⪩   ֹ  \`Un nakama se va de\`
                 \`${groupName}\`  ꒱꒱ㅤㅤㅤ

*ֹ  ᦕ   ׄ                      _${username}_*

         ׅ     ⑅ ׄ     .˙ ¡Siempre serás parte de la banda! ֹ

な⃟   ۟  ─ _Ahora somos *${groupSize}* piratas!_

> Puedes usar \`/help\` para los comandos.
> ✐ 𝐋𝐢𝐧𝐤 » ${botLink || ''}`
        }
      }

      await conn.sendMessage(m.chat, {
        text: caption,
        linkPreview: linkPreview,
        contextInfo: {
          mentionedJid: [targetJid],
          isForwarded: false,
          forwardedNewsletterMessageInfo: {
            newsletterJid: newsletterJid,
            newsletterName: newsletterName,
            serverMessageId: -1
          }
        }
      }, { quoted: null })

    } catch (error) {
      console.error('[welcome/bye] error procesando participante', error)
    }
  }
  return true
}

export default { before }