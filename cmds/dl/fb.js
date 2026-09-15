import axios from "axios"

export default {
  command: ["fb", "facebook"],
  category: "downloader",
  run: async ({ msg, sock, args, command }) => {

    if (!args.length) {
      return msg.reply("✎ Ingrese uno o varios enlaces o texto para buscar en *Facebook*")
    }

    const urls = args.filter(arg => arg.match(/facebook\.com|fb\.watch|video\.fb\.com/))

    // Descarga el video de la mejor calidad disponible
    const downloadVideo = async (url) => {
      const apiUrl = `${api.url}/dl/facebook?url=${encodeURIComponent(url)}&key=${api.key}`
      const res = await axios.get(apiUrl)
      const json = res.data

      if (!json.status || !json.resultados || !json.resultados.length) {
        return null
      }

      // Priorizar calidad: 1080p > 720p > 480p > 360p
      const qualityOrder = ["1080p", "720p", "480p", "360p", "1440p", "640p", "540p"]
      const sorted = [...json.resultados].sort((a, b) => {
        const ia = qualityOrder.indexOf(a.quality)
        const ib = qualityOrder.indexOf(b.quality)
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
      })

      const best = sorted[0]
      if (!best || !best.url || best.url === "/") return null

      // Descargar con headers para evitar el 403
      const dl = await axios.get(best.url, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://www.facebook.com/",
          "Accept": "video/webm,video/mp4,video/*;q=0.9,*/*;q=0.8"
        }
      })
      return Buffer.from(dl.data)
    }

    try {
      if (urls.length) {
        if (urls.length > 1) {
          const medias = []
          for (const url of urls.slice(0, 10)) {
            try {
              const buffer = await downloadVideo(url)
              if (buffer) medias.push({ type: "video", data: buffer })
            } catch (e) {
              continue
            }
          }
          if (medias.length) {
            await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
          } else {
            await msg.reply(`✿ No se pudieron procesar los enlaces.`)
          }
        } else {
          const buffer = await downloadVideo(urls[0])
          if (buffer) {
            await sock.sendMessage(
              msg.chat,
              { video: buffer, mimetype: "video/mp4", fileName: "fb.mp4" },
              { quoted: msg }
            )
          } else {
            await msg.reply(`✿ No se pudo descargar el video.`)
          }
        }
      } else {
        const query = args.join(" ")
        const searchUrl = `${api.url}/search/facebook?query=${encodeURIComponent(query)}&key=${api.key}`
        const res = await axios.get(searchUrl)
        const json = res.data

        if (!json.status || !json.data || !json.data.length) {
          return msg.reply(`✿ No se encontraron resultados para "${query}".`)
        }

        const medias = []
        for (const item of json.data.slice(0, 3)) {
          try {
            const buffer = await downloadVideo(item.url)
            if (buffer) medias.push({ type: "video", data: buffer })
          } catch (e) {
            continue
          }
        }

        if (medias.length) {
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg })
        } else {
          await msg.reply(`✿ No se pudieron descargar los resultados.`)
        }
      }
    } catch (e) {
      await msg.reply(msgglobal)
      console.log("ERROR FB:", e)
    }
  }
}