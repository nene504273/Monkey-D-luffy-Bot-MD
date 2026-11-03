import axios from "axios"

export default {
  command: ["tiktokaudio", "tta", "ttmp3"],
  category: "downloader",
  isSocket: true,
  run: async ({ msg, sock, args, command }) => {
    if (!args.length) {
      return msg.reply("✿ Ingresa un término o enlace de TikTok.")
    }

    const urls = args.filter(arg => arg.includes("tiktok.com"))

    const buildCaption = (data) => {
      const {
        title = "Sin título",
        author = {},
        stats = {},
        music_info = {},
        duration,
        id
      } = data

      const tiktokLink = `https://www.tiktok.com/@${author.unique_id || "unknown"}/video/${id}`

      return (
        `ㅤ۟∩　ׅ　★ ໌　ׅ　🎧 𝗧𝗶𝗸𝗧𝗼𝗸 𝗔𝘂𝗱𝗶𝗼　ᰙ\n\n` +
        `𖣣ֶㅤ֯⌗ ✿ ⬭ Título: ${title}\n` +
        `𖣣ֶㅤ֯⌗ ★ ⬭ Autor: ${author.nickname || author.unique_id || "Desconocido"}\n` +
        `𖣣ֶㅤ֯⌗ ❖ ⬭ Duración: ${duration || music_info?.duration || "N/A"}\n` +
        `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes: ${(stats.likes || 0).toLocaleString()}\n` +
        `𖣣ֶㅤ֯⌗ ꕥ ⬭ Comentarios: ${(stats.comments || 0).toLocaleString()}\n` +
        `𖣣ֶㅤ֯⌗ ❒ ⬭ Vistas: ${(stats.plays || stats.views || 0).toLocaleString()}\n` +
        `𖣣ֶㅤ֯⌗ ☄︎ ⬭ Compartidos: ${(stats.shares || 0).toLocaleString()}\n` +
        `𖣣ֶㅤ֯⌗ ❍ ⬭ Enlace: ${tiktokLink}\n` +
        `𖣣ֶㅤ֯⌗ ❖ ⬭ Audio: ${music_info?.title ? music_info.title + " - " : "Desconocido"}${music_info?.author || ""}`
      )
    }

    const sendAudio = async (data) => {
      const caption = buildCaption(data)

      if (data.thumbnail) {
        await sock.sendMessage(msg.chat, { image: { url: data.thumbnail }, caption }, { quoted: msg })
      }

      await sock.sendMessage(msg.chat, {
        audio: { url: data.dl },
        mimetype: "audio/mpeg",
        fileName: `${data.music_info?.title || data.title || "audio"}.mp3`,
        ptt: true
      }, { quoted: msg })
    }

    const download = async (url) => {
      const apiUrl = `${api.url}/dl/tiktokmp3?url=${encodeURIComponent(url)}&key=${api.key}`
      const res = await axios.get(apiUrl)
      return res.data?.data
    }

    if (urls.length) {
      const url = urls[0]
      try {
        const data = await download(url)
        if (!data) return msg.reply(`✿ No se pudo obtener el audio de: ${url}`)

        await sendAudio(data)
      } catch (e) {
        console.error(e)
        await msg.reply(msgglobal)
      }
      return
    }

    const query = args.join(" ")
    if (!query) return msg.reply("✿ Ingresa un término de búsqueda.")

    try {
      const searchUrl = `${api.url}/search/tiktok?query=${encodeURIComponent(query)}&key=${api.key}`
      const res = await axios.get(searchUrl)
      const results = res.data?.result

      if (!results || results.length === 0) {
        return msg.reply(`❖ No se encontraron resultados para: ${query}`)
      }

      const chosen = results[0]
      const tiktokUrl = `https://www.tiktok.com/@${chosen.author?.unique_id}/video/${chosen.id}`

      const data = await download(tiktokUrl)
      if (!data) return msg.reply("✿ No se pudo obtener el audio de este video.")

      await sendAudio(data)
    } catch (e) {
      console.error(e)
      await msg.reply(msgglobal)
    }
  },
}