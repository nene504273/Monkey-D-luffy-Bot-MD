import axios from "axios"

export default {
  command: ["instagram", "ig", "reel"],
  category: "downloader",

  run: async ({ msg, sock, args }) => {
    if (!args.length) {
      return sock.sendMessage(msg.chat, { text: "✎ Ingrese uno o varios enlaces de *Instagram*." }, { quoted: msg })
    }

    const urls = args.filter(arg =>
      arg.match(/instagram\.com\/(p|reel|share|tv)\//)
    )

    if (!urls.length) {
      return sock.sendMessage(msg.chat, { text: "✿ El enlace no parece *válido*. Asegúrate de que sea de *Instagram*" }, { quoted: msg })
    }

    for (const url of urls.slice(0, 10)) {
      try {
        // 1. Pedir el enlace a la API
        const apiRes = await axios.get(
          `${api.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${api.key}`
        )
        
        const data = apiRes.data
        // LOG para depuración: Muestra en consola qué está devolviendo la API
        console.log("IG: Respuesta de API ->", JSON.stringify(data, null, 2))

        // 2. Extraer el enlace de descarga de forma flexible
        let dl = null
        if (data) {
          // Intenta buscar la URL en diferentes estructuras comunes de API
          if (data.status === true || data.status === "ok" || data.success === true) {
            dl = data.data?.dl || 
                 data.data?.url || 
                 data.dl || 
                 data.url || 
                 (Array.isArray(data.data) ? data.data[0] : null) || 
                 (Array.isArray(data.result) ? data.result[0] : null) ||
                 (typeof data.data === 'string' ? data.data : null)
          } else {
             // Si el status es falso, quizás el enlace de descarga esté directamente en la raíz
             dl = data.dl || data.url || (Array.isArray(data) ? data[0] : null)
          }
        }

        if (!dl) {
          console.log("IG: API sin datos o estructura desconocida", JSON.stringify(data))
          await sock.sendMessage(msg.chat, { text: "✿ No se pudo *obtener* el contenido. La API no devolvió un enlace válido." }, { quoted: msg })
          continue
        }

        console.log("IG: enlace ->", typeof dl === 'string' ? dl.slice(0, 60) + "..." : dl)

        // 3. Descargar el archivo como buffer (binario)
        const archivo = await axios.get(dl, { responseType: "arraybuffer" })

        // 4. Detectar tipo por extensión del enlace
        const esVideo = /\.(mp4|mov|webm)(\?|$)/i.test(dl)

        // 5. Enviar el archivo ya descargado
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
        await sock.sendMessage(msg.chat, { text: "✿ Ocurrió un problema al procesar el enlace." }, { quoted: msg })
      }
    }
  }
}