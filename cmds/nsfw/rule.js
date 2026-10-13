import db from "#db"
import fetch from 'node-fetch'

export default {
  command: ['r34', 'r34vid', 'rule34', 'rule34vid', 'rule', 'rulevid'],
  category: 'nsfw',
  run: async ({ msg, sock, args, command }) => {
    try {
      const chatId = msg.chat
     const chat = await db.getChat(msg.chat)

    if (!chat.nsfw)
      return msg.reply(
        mess.nsfw,
      )

      if (!args[0]) 
        return sock.reply(msg.chat, `✿ Debes especificar tags para buscar.`, msg)

      const tag = args[0].replace(/\s+/g, '_')
      let mediaList = []
      const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}&api_key=${process.env.R34_API_KEY}&user_id=${process.env.R34_USER_ID}`

      const res = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } 
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const text = await res.text()
      let json = []
      try {
        json = JSON.parse(text)
      } catch {
        json = []
      }

      const data = Array.isArray(json) ? json : json?.post || json?.data || []
      const valid = data
        .map(i => i?.file_url || i?.sample_url || i?.preview_url)
        .filter(u => typeof u === 'string' && /\.(jpe?g|png|gif|mp4)$/i.test(u))

      if (valid.length) {
        mediaList = [...new Set(valid)].sort(() => Math.random() - 0.5)
      }

      if (!mediaList.length) 
        return sock.reply(msg.chat, `❀ No se encontraron resultados para ${tag}`, msg)

      let filtered = []
      if (command === 'r34' || command === 'rule34' || command === 'rule') {
        filtered = mediaList.filter(u => /\.(jpe?g|png|gif)$/i.test(u))
      } else if (command === 'r34vid' || command === 'rule34vid' || command === 'rulevid') {
        filtered = mediaList.filter(u => /\.mp4$/i.test(u))
      }

      if (!filtered.length) 
        return sock.reply(msg.chat, `❀ No se encontraron ${command === 'r34' ? 'imágenes' : 'videos'} para ${tag}`, msg)

      const media = filtered[0]
      const caption = `✿ Resultados para » ${tag}`

      if (command === 'r34vid' || command === 'rule34vid' || command === 'rulevid') {
        await sock.sendMessage(msg.chat, { video: { url: media }, caption, mentions: [msg.sender] }, { quoted: msg })
      } else {
        await sock.sendMessage(msg.chat, { image: { url: media }, caption, mentions: [msg.sender] }, { quoted: msg })
      }

    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}