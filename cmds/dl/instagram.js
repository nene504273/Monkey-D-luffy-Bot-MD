import axios from "axios"

export default {
  command: ["instagram", "ig", "reel"],
  category: "downloader",

  run: async ({ msg, sock, args }) => {
    if (!args.length) {
      return msg.reply("✎ Ingrese uno o varios enlaces de *Instagram*.")
    }

    const urls = args.filter(arg =>
      arg.match(/instagram\.com\/(p|reel|share|tv)\//)
    )

    if (!urls.length) {
      return msg.reply("✿ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*")
    }

    for (const url of urls.slice(0, 10)) {
      try {
        // 1. Pedir el enlace a la API
        const { data } = await axios.get(
          `${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`
        )

        if (!data.status || !data.data?.dl) {
          console.log("IG: API sin datos", JSON.stringify(data))
          await sock.reply(msg.chat, "✿ No se pudo *obtener* el contenido", msg)
          continue
        }

        const dl = data.data.dl
        console.log("IG: enlace ->", dl.slice(0, 60) + "...")

        // 2. Descargar el archivo como buffer (binario)
        const archivo = await axios.get(dl, { responseType: "arraybuffer" })

        // 3. Detectar tipo por extensión del enlace
        const esVideo = /\.(mp4|mov|webm)(\?|$)/i.test(dl)

        // 4. Enviar el archivo ya descargado
        if (esVideo) {
          await sock.sendMessage(
            msg.chat,
            {
              video: archivo.data,
              mimetype: "video/mp4",
              fileName: "instagram.mp4",
            },
            { quoted: msg }
          )
        } else {
          await sock.sendMessage(
            msg.chat,
            { image: archivo.data },
            { quoted: msg }
          )
        }

        console.log("IG: enviado correctamente")
      } catch (e) {
        console.log("IG-ERROR:", e?.response?.data || e?.message || e)
        await sock.reply(msg.chat, "✿ Ocurrió un problema al procesar el enlace.", msg)
      }
    }
  }
}