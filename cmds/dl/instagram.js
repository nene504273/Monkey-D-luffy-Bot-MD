import axios from "axios"

export default {
  command: ["instagram", "ig", "reel"],
  category: "downloader",

  run: async ({ msg, sock, args }) => {
    // 1. Validar enlaces
    if (!args.length) {
      return msg.reply("✎ Ingrese uno o varios enlaces de *Instagram*.")
    }

    const urls = args.filter(arg =>
      arg.match(/instagram\.com\/(p|reel|share|tv)\//)
    )

    if (!urls.length) {
      return msg.reply("✿ El enlace no parece *válido*.")
    }

    // 2. Procesar cada enlace
    for (const url of urls.slice(0, 10)) {
      try {
        // 3. Pedir enlace a la API
        const { data } = await axios.get(
          `${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`
        )

        if (!data.status || !data.data?.dl) {
          console.log("IG: API sin datos ->", JSON.stringify(data))
          await sock.reply(msg.chat, "✿ No se pudo obtener el contenido.", msg)
          continue
        }

        const dl = data.data.dl
        console.log("IG: enlace obtenido")

        // 4. Descargar el archivo completo (buffer)
        const archivo = await axios.get(dl, { responseType: "arraybuffer" })
        console.log("IG: archivo descargado, tamaño:", archivo.data.byteLength, "bytes")

        // 5. Detectar tipo por extensión
        const esVideo = /\.(mp4|mov|webm)(\?|$)/i.test(dl)

        // 6. Enviar el archivo ya descargado
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