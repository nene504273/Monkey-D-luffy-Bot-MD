import FormData from 'form-data';
import axios from 'axios';
import db from '#db';

const generateUniqueFilename = (mime) => {
  const ext = (mime || 'image/jpeg').split('/')[1]?.split(';')[0] || 'jpg';
  return `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
}

const uploadAdoFiles = async (buffer, mime) => {
  const filename = generateUniqueFilename(mime)
  const res = await axios.post("https://cdn.adoolab.xyz/api/upload", {
    filename,
    data: buffer.toString('base64'),
    expiration: "never"
  }, {
    headers: {
      "Content-Type": "application/json"
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })

  const url = res.data?.url
  if (!url || typeof url !== "string" || !url.startsWith("https://"))
    throw new Error("Respuesta inválida de AdoFiles: " + JSON.stringify(res.data))

  return url
}

const uploadFare = async (buffer, mime) => {
  const form = new FormData()
  form.append("file", buffer, generateUniqueFilename(mime))
  const res = await axios.post("https://u.fare.ink/api/upload", form, { headers: form.getHeaders(), maxContentLength: Infinity, maxBodyLength: Infinity })
  const url = res.data?.file?.publicUrl
  if (!url || typeof url !== "string" || !url.startsWith("https://"))
    throw new Error("Respuesta inválida de Fare: " + JSON.stringify(res.data))
  return url
}

const uploadUguu = async (buffer, mime) => {
  const form = new FormData()
  form.append("files[]", buffer, generateUniqueFilename(mime))
  const res = await axios.post("https://uguu.se/upload.php", form, { headers: form.getHeaders(), maxContentLength: Infinity, maxBodyLength: Infinity })
  const url = res.data?.files?.[0]?.url
  if (!url) throw new Error("Respuesta inválida de Uguu: " + JSON.stringify(res.data))
  return url
}

const uploadAuto = async (buffer, mime) => {
  for (const [fn, name] of [
    [() => uploadAdoFiles(buffer, mime), "adofiles"],
    [() => uploadFare(buffer, mime), "fare"],
    [() => uploadUguu(buffer, mime), "uguu"]
  ]) {
    try { return { link: await fn(), server: name } } catch {}
  }
  throw new Error("Todos los servidores fallaron")
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default {
  command: ['tourl'],
  category: 'utils',
  description: 'Convertir una imagen en un enlace.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const q = msg.quoted || msg
    const mime = (q.msg || q).mimetype || ''
    if (!mime) {
      return sock.reply(msg.chat, `《✧》 Por favor, responde a una imagen o video con *${usedPrefix + command} [servidor]* para convertirlo en URL.\n\n✿ Servidores disponibles:\n> › adofiles (permanente)\n> › fare\n> › uguu (temporal, 3h)\n> › auto (selecciona automáticamente)`, msg)
    }
    try {
      const media = await q.download()
      if (!media) return sock.reply(msg.chat, "ꕥ No se pudo descargar el archivo.", msg)
      const serverArg = args[0]?.toLowerCase() || "adofiles"
      const servers = {
        adofiles: () => uploadAdoFiles(media, mime).then(link => ({ link, server: "adofiles" })),
        fare: () => uploadFare(media, mime).then(link => ({ link, server: "fare" })),
        uguu: () => uploadUguu(media, mime).then(link => ({ link, server: "uguu" })),
        auto: () => uploadAuto(media, mime)
      }
      if (!servers[serverArg]) return sock.reply(msg.chat, `ꕥ Servidor no válido. Actuales disponibles: adofiles, fare, uguu o auto`, msg)
      const { link, server } = await servers[serverArg]()
      const user = db.getUser(msg.sender)
      await sock.reply(msg.chat, `𖹭 ❀ *Upload To ${server.toUpperCase()}*\n\nׅ  ׄ  ✿   ׅ り *Link ›* ${link}\nׅ  ׄ  ✿   ׅ り *Peso ›* ${formatBytes(media.length)}\nׅ  ׄ  ✿   ׅ り *Tipo ›* ${mime.split("/")[1].toUpperCase() || "UNKNOWN"}\nׅ  ׄ  ✿   ׅ り *Solicitado por ›* ${user?.name || msg.pushName || 'Usuario'}`, msg);
    } catch (e) {
      await sock.reply(msg.chat, `> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`, msg);
    }
  }
}
