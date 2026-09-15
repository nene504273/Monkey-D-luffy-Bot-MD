import axios from "axios"

export default {
  command: ["instagram", "ig", "reel"],
  category: "downloader",
  run: async ({ msg, sock, args }) => {
    if (!args.length) {
      return msg.reply("✎ Ingrese uno o varios enlaces de *Instagram*.")
    }

    const urls = args.filter(arg => arg.match(/instagram\.com\/(p|reel|share|tv)\//))
    if (!urls.length) {
      return msg.reply("✿ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*")
    }

    try {
      // Procesa cada enlace (máx 10)
      for (const url of urls.slice(0, 10)) {
        const res = await axios.get(`${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`)
        const json = res.data

        if (!json.status || !json.data || !json.data.dl) {
          await sock.reply(msg.chat, "✿ No se pudo *obtener* el contenido", msg)
          continue
        }

        const { type, dl } = json.data

        if (type === "video") {
          await sock.sendMessage(
            msg.chat,
            { video: { url: dl }, mimetype: "video/mp4", fileName: "instagram.mp4" },
            { quoted: msg }
          )
        } else {
          // Imagen
          await sock.sendMessage(
            msg.chat,
            { image: { url: dl } },
            { quoted: msg }
          )
        }
      }
    } catch (e) {
      await sock.reply(msg.chat, msgglobal, msg)
    }
  }
}