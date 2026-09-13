import axios from 'axios'
import db from '#db';

export default {
  command: ['gelbooru', 'gbooru'],
  category: 'nsfw',
  description: 'Buscar imágenes en Gelbooru.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    try {
      const chat = db.getChat(msg.chat);
      if (!chat.nsfw) return msg.reply(`ꕥ El contenido *NSFW* está desactivado en este grupo.\n\nUn *administrador* puede activarlo con el comando:\n» *${usedPrefix}nsfw on*`)
      if (!args[0]) return sock.reply(msg.chat, `《✧》 Debes especificar tags para buscar\n> Ejemplo » *${usedPrefix + command} neko*`, msg)
      await msg.react('🕒')
      const tag = args.join(' ').replace(/\s+/g, '_')
      const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=20&tags=${encodeURIComponent(tag)}&api_key=98f554258c88c44f4dd28ccde0c28f36682b2a992490ab35ebcc7baf7e196a86d7550b174bce577b8cc3f544e9b3ad0f6aeb09ad63bf89a9141cc3eddb6fbfd2&user_id=1917269`
      const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': 'https://gelbooru.com/', 'Accept': 'application/json' } })
      const data = res.data?.post || []
      if (!data.length) return sock.reply(msg.chat, `《✧》 No se encontraron resultados para ${tag}`, msg)
      const shuffled = data.sort(() => Math.random() - 0.5)
      let sent = false
      for (const post of shuffled) {
        const fileUrl = post.file_url || post.sample_url
        if (!fileUrl || !/\.(jpe?g|png|gif|mp4)(\?.*)?$/i.test(fileUrl)) continue
        try {
          const imgRes = await axios.get(fileUrl, { responseType: 'arraybuffer', headers: { 'Referer': 'https://gelbooru.com/', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, timeout: 15000 })
          const buffer = Buffer.from(imgRes.data)
          const isVideo = /\.mp4(\?.*)?$/i.test(fileUrl)
          const caption = `ꕥ Resultados para » ${tag}`
          if (isVideo) {
            await sock.sendMessage(msg.chat, { video: buffer, caption, mentions: [msg.sender] })
          } else {
            await sock.sendMessage(msg.chat, { image: buffer, caption, mentions: [msg.sender] })
          }
          sent = true
          break
        } catch {}
      }
      if (!sent) return sock.reply(msg.chat, `《✧》 No se encontraron resultados para ${tag}`, msg)
      await msg.react('✔️')
    } catch (e) {
      await msg.react('✖️')
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  }
}
