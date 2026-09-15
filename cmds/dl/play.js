import ytsearch from "yt-search"
import { getBuffer } from "#serialize"
import fetch from "node-fetch"

export default {
  command: ["play", "mp3", "ytmp3", "ytaudio", "playaudio"],
  category: "downloader",
  run: async ({ msg, sock, args }) => {

    try {
      if (!args[0]) {
        return msg.reply("《✧》Por favor, menciona el nombre o URL del video que deseas descargar")
      }

      const text = args.join(" ")

      // Buscar el video para obtener su URL de YouTube
      const searchResult = await ytsearch(text)
      if (!searchResult.videos || !searchResult.videos.length) {
        return msg.reply("《✧》 No se encontró información del video.")
      }
      const videoUrl = searchResult.videos[0].url

      const dlEndpoint = `${api.url}/dl/youtubeplay?query=${encodeURIComponent(videoUrl)}&key=${api.key}`
      const resDl = await fetch(dlEndpoint).then(r => r.json())

      if (!resDl?.status || !resDl?.result?.dl) {
        return msg.reply("《✧》 No se pudo descargar el *audio*, intenta más tarde.")
      }

      const { title, channel, duration, views, thumbnail, dl } = resDl.result
      const vistas = (views || 0).toLocaleString()
      const canal = channel || "Desconocido"
      const thumbBuffer = await getBuffer(thumbnail)

      const caption = `【　✿　】 _\`୨୧  Download\` ───── *${title}*_

> _✐ \`Canal\` ── ${canal}_
> _ⴵ \`Duración\` ── ${duration || ''}s_
> _✰ \`Vistas\` ── ${vistas}_
> _🜸 \`Enlace\` ── ${videoUrl}_

> _──  ִ    ۟  *¡Enviando audio, por favor espera!*_`

      await sock.sendMessage(msg.chat, { image: thumbBuffer, caption }, { quoted: msg })

      const audioBuffer = await getBuffer(dl)
      if (!audioBuffer || audioBuffer.length === 0) {
        return msg.reply("《✧》 No se pudo descargar el *audio*, intenta más tarde.")
      }

      const mensaje = {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false
      }

      await sock.sendMessage(msg.chat, mensaje, { quoted: msg })
    } catch (e) {
      await msg.reply(msgglobal)
    }
  }
}