import ytsearch from "yt-search"
import { getBuffer } from "#serialize"
import fetch from "node-fetch"

// Configuración de la API
const API_URL = "https://api.alyacore.xyz/dl/youtubeplay"
const API_KEY = "LUFFY-FIX67"

export default {
  command: ["play", "mp3", "ytmp3", "ytaudio", "playaudio"],
  category: "downloader",
  run: async ({ msg, sock, args }) => {
    try {
      if (!args[0]) {
        return msg.reply("《✧》 Por favor, menciona el nombre o URL del video que deseas descargar.")
      }

      const text = args.join(" ")
      
      // 1. Buscar el video para obtener metadatos y la URL real
      const searchResult = await ytsearch(text)
      if (!searchResult.videos || !searchResult.videos.length) {
        return msg.reply("《✧》 No se encontró información del video.")
      }

      const video = searchResult.videos[0]
      const { title, author, timestamp: duration, views, url, image } = video
      const vistas = (views || 0).toLocaleString()
      const canal = author?.name || "Desconocido"
      
      // 2. Obtener la miniatura
      const thumbBuffer = await getBuffer(image)

      const caption = `【 ✿ 】 _\`୨୧  Download\` ───── *${title}*_

> _✐ \`Canal\` ── ${canal}_
> _ⴵ \`Duración\` ── ${duration || 'N/A'}_
> _✰ \`Vistas\` ── ${vistas}_
> _🜸 \`Enlace\` ── ${url}_

> _──  ִ    ۟  *¡Enviando audio, por favor espera!*_`

      // Enviar mensaje de espera con la imagen
      await sock.sendMessage(msg.chat, { image: thumbBuffer, caption }, { quoted: msg })

      // 3. Llamar a la NUEVA API 
      // Usamos la 'url' del video encontrado para asegurar que se descargue exactamente ese video
      const dlEndpoint = `${API_URL}?query=${encodeURIComponent(url)}&key=${API_KEY}`
      
      const resDl = await fetch(dlEndpoint).then(r => r.json())
      
      // 4. Validar la respuesta de la nueva API (status: true y existencia de result.dl)
      if (!resDl?.status || !resDl?.result?.dl) {
        return msg.reply("《✧》 No se pudo descargar el *audio*. La API puede estar caída o el video no está disponible.")
      }

      // 5. Descargar el buffer de audio usando la URL proporcionada por la API
      const audioBuffer = await getBuffer(resDl.result.dl)
      
      // Usar el nombre de archivo que provee la API, o fallback al título limpio
      const fileName = resDl.result.fileName || `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`

      const mensaje = {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: fileName,
        ptt: true // true = nota de voz (verde), false = archivo de audio normal
      }

      await sock.sendMessage(msg.chat, mensaje, { quoted: msg })

    } catch (e) {
      // Esto evitará que el bot crashee silenciosamente y te dirá qué falló en la terminal
      console.error("🔴 ERROR EN COMANDO PLAY:", e)
      
      const errorMsg = typeof msgglobal !== 'undefined' 
        ? msgglobal 
        : "《✧》 Ocurrió un error al procesar tu solicitud. Revisa la consola del bot."
        
      await msg.reply(errorMsg)
    }
  }
}