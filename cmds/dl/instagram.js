import axios from "axios"

export default {
  command: ["instagram", "ig", "reel"],
  category: "downloader",
  run: async ({ msg, sock, args, api }) => {
    if (!args.length) {
      return msg.reply("✎ Ingrese uno o varios enlaces de *Instagram*.")
    }

    const urls = args.filter(arg => arg.match(/instagram\.com\/(p|reel|share|tv)\//))
    if (!urls.length) {
      return msg.reply("✿ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*")
    }

    for (const url of urls.slice(0, 10)) {
      try {
        const { data } = await axios.get(
          `${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`
        )

        if (!data.status || !data.data?.dl) {
          await sock.reply(msg.chat, "✿ No se pudo *obtener* el contenido", msg)
          continue
        }

        const dl = data.data.dl

        // Decidir por extensión del archivo, no por el "type" de la API
        const isVideo = /\.(mp4|mov|webm)(\?|$)/i.test(dl)

        if (isVideo) {
          await sock.sendMessage(
            msg.chat,
            {
              video: { url: dl },
              mimetype: "video/mp4",
              fileName: "instagram.mp4",
            },
            { quoted: msg }
          )
        } else {
          await sock.sendMessage(
            msg.chat,
            { image: { url: dl } },
            { quoted: msg }
          )
        }
      } catch {
        await sock.reply(msg.chat, msgglobal, msg)
      }
    }
  }
}