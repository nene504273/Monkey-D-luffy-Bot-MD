let handler = async (m, { conn }) => {
  const texto = `
⊹🌈 𝑪𝒐𝒎𝒂𝒏𝒅𝒐𝒔 𝒑𝒂𝒓𝒂 𝒍𝒂 𝒄𝒓𝒆𝒂𝒄𝒊𝒐𝒏 𝒚 𝒑𝒆𝒓𝒔𝒐𝒏𝒂𝒍𝒊𝒛𝒂𝒄𝒊𝒐𝒏 𝒅𝒆 𝒔𝒕𝒊𝒄𝒌𝒆𝒓𝒔 🌈⊹

ㅤۚ𑁯ׂᰍ  🪴 ᳴   ׅ  ׄʚ   ̶ *#brat*
> ✦ Convierte un texto a sticker.

ㅤۚ𑁯ׂᰍ  🪴 ᳴   ׅ  ׄʚ   ̶ *#emojimix*
> ✦ Crea un solo emoji con dos.

ㅤۚ𑁯ׂᰍ 🪴 ᳴ ׅ ׄʚ ̶ *#setmeta*
> ✦ Personaliza los nombres de los stickers que hagas en la bot. 

ㅤۚ𑁯ׂᰍ 🪴 ᳴ ׅ ׄʚ ̶ *#s • #sticker*
> ✦ Convierte una imagen a sticker.

ㅤۚ𑁯ׂᰍ 🪴 ᳴ ׅ ׄʚ ̶ *#toimg*
> ✦ Convierte un stickers a imagen.

ㅤۚ𑁯ׂᰍ 🪴 ᳴ ׅ ׄʚ ̶ *#wm*
> ✦  Personaliza los nombres de los stickers que respondas.

╰──── ੈ₊˚༅༴╰────︶.︶ ⸙ ͛ ͎ ͛ ︶.︶ ੈ₊˚༅
  `.trim();

  await conn.sendMessage(m.chat, {
    image: { url: 'https://files.catbox.moe/61219t.png' },
    caption: texto,
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '💫 Comandos de diferentes tipos generadores de stickers',
        body: 'Crea y personaliza tus propios stickers',
        thumbnailUrl: 'https://files.catbox.moe/hdr7oh.jpg',
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: true,
        mediaUrl: 'https://whatsapp.com/channel/0029VakLbM76mYPPFL0IFI3P',
        sourceUrl: 'https://whatsapp.com/channel/0029VakLbM76mYPPFL0IFI3P',
        newsletterJid: '120363335626706839@newsletter',
        newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 𝙍𝙪𝙗𝙮 𝙃𝙤𝙨𝙝𝙞𝙣𝙤 𝘽𝙤𝙩 』࿐⟡'
      }
    }
  }, { quoted: m });
};

handler.command = ['menusticker', 'stickersmenu', 'sticker'];
export default handler;