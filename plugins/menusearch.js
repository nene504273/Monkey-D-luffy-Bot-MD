let handler = async (m, { conn }) => {
  const texto = `
🔍⊹ *𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐁𝐮́𝐬𝐪𝐮𝐞𝐝𝐚* ⊹🔎

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#tiktoksearch • #tiktoks*  
> ✦ Buscador de videos de TikTok.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#tweetposts*  
> ✦ Buscador de posts de Twitter/X.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#ytsearch • #yts*  
> ✦ Realiza búsquedas en YouTube.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#githubsearch*  
> ✦ Buscador de usuarios de GitHub.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#cuevana • #cuevanasearch*  
> ✦ Buscador de películas/series por Cuevana.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#google*  
> ✦ Realiza búsquedas en Google.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#pin • #pinterest*  
> ✦ Buscador de imágenes de Pinterest.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#animeinfo • #animei*  
> ✦ Buscador de información de un animé.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#imagen • #image*  
> ✦ Buscador de imágenes en Google.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#animesearch • #animess*  
> ✦ Buscador de animes en TioAnime.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#infoanime*  
> ✦ Info de anime/manga.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#hentaisearch*  
> ✦ Buscador de hentai.

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#xnxxsearch • #xvsearch • #pornhubsearch*  
> ✦ Buscador de contenido +18 (XNXX, XVideos, Pornhub).

⌈ ׄ 𝅄ׁ֢◯⃟▒ ꕀ▿⃟⃞🪴 ◯⃝◦・ׄ. *#npmjs*  
> ✦ Buscador de paquetes en npmjs.
`.trim();

  conn.sendFile(m.chat, 'https://files.catbox.moe/juor2l.jpg', 'busquedas.jpg', texto, m, false, {
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '🔍 Búsquedas Inteligentes con Ruby Hoshino',
        body: 'Explora TikTok, YouTube, GitHub y más',
        thumbnailUrl: 'https://files.catbox.moe/juor2l.jpg',
        mediaType: 1,
        showAdAttribution: true,
        mediaUrl: 'https://whatsapp.com/channel/0029VakLbM76mYPPFL0IFI3P',
        sourceUrl: 'https://whatsapp.com/channel/0029VakLbM76mYPPFL0IFI3P',
        newsletterJid: '120363335626706839@newsletter',
        newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡'
      }
    }
  });
};
handler.command = ['menusearch', 'searchmenu', 'menubusquedas'];
export default handler;
