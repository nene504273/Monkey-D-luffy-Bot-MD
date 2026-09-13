import yts from 'yt-search'
import { getBuffer } from '#serialize'

export default {
  command: ['ytsearch', 'search', 'yts'],
  category: 'downloads',
  description: 'Buscar videos de YouTube.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    if (!args || !args[0]) {
      return msg.reply('《✧》 Por favor, Ingrese el título de un vídeo.')
    }    
    const ress = await yts(`${args[0]}`)
    const armar = ress.all
    const Ibuff = await getBuffer(armar[0].image)    
    let teks2 = armar.map((v) => {
      switch (v.type) {
        case 'video':
          return `➩ *Título ›* *${v.title}* 

> ⴵ *Duración ›* ${v.timestamp}
> ❖ *Subido ›* ${v.ago}
> ✿ *Vistas ›* ${v.views}
> ❒ *Url ›* ${v.url}`.trim()
        case 'channel':
          return `
> ❖ Canal › *${v.name}*
> ❒ Url › ${v.url}
> ❀ Subscriptores › ${v.subCountLabel} (${v.subCount})
> ✿ Videos totales › ${v.videoCount}`.trim()
      }
    }).filter((v) => v).join('\n\n╾۪〬─ ┄۫╌ ׄ┄┈۪ ─〬 ׅ┄╌ ۫┈ ─ׄ─۪〬 ┈ ┄۫╌ ─ׄ〬╼\n\n')    
    sock.sendMessage(msg.chat, { image: Ibuff, caption: teks2 }, { quoted: msg }).catch((e) => {
      msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    })
  },
}