import axios from "axios"

export default {
  command: ["instagram", "ig", "reel"],
  category: "downloader",

  run: async ({ msg, sock, args }) => {
    // 1. Validar que haya enlaces
    if (!args.length) {
      return msg.reply("✎ Ingrese uno o varios enlaces de *Instagram*.")
    }

    // 2. Filtrar solo enlaces válidos de Instagram
    const urls = args.filter(arg =>
      arg.match(/instagram\.com\/(p|reel|share|tv)\//)
    )

    if (!urls.length) {
      return msg.reply("✿ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*")
    }

    // 3. Procesar cada enlace (máximo 10)
    for (const url of urls.slice(0, 10)) {
      try {
        // 4. Llamar a la API de alyacore
        const { data } = await axios.get(
          `${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`
        )

        // 5. Verificar que la API respondió bien
        if (!data.status || !data.data?.dl) {
          console.log("Instagram: API sin datos", JSON.stringify(data))
          await sock.reply(msg.chat, "✿ No se pudo *obtener* el contenido", msg)
          continue
        }

        const dl = data.data.dl
        console.log("Instagram: enlace obtenido ->", dl.slice(0, 80) + "...")

        // 6. Detectar si es video por la extensión del enlace
        const esVideo = /\.(mp4|mov|webm)(\?|$)/i.test(dl)

        // 7. Enviar según el tipo
        if (esVideo) {
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

        console.log("Instagram: enviado correctamente")
      } catch (e) {
        // 8. Mostrar el error real en consola
        console.log("Instagram: ERROR ->", e?.response?.data || e?.message || e)
        await sock.reply(msg.chat, "✿ Ocurrió un problema al procesar el enlace.", msg)
      }
    }
  }
}