import { search, download } from 'aptoide-scraper'
import { getBuffer } from "#serialize"

export default {
  command: ['apk', 'aptoide', 'apkdl'],
  category: 'downloads',
  description: 'Buscar y descargar aplicaciones de Aptoide.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {    if (!args || !args.length) {
      return msg.reply('《✧》 Por favor, ingresa el nombre de la aplicación.')
    }
    const query = args.join(' ').trim()
    try {
      const searchA = await search(query)
      if (!searchA || searchA.length === 0) {
        return msg.reply('《✧》 No se encontraron resultados.')
      }
      const apkInfo = await download(searchA[0].id)
      if (!apkInfo) {
        return msg.reply('《✧》 No se pudo obtener la información de la aplicación.')
      }
      const { name, package: id, size, icon, dllink: downloadUrl, lastup } = apkInfo
      const caption = `✰ ᩧ　𓈒　ׄ　Aptoide 　ׅ　✿\n\n➩ *Nombre ›* ${name}\n❖ *Paquete ›* ${id}\n✿ *Última actualización ›* ${lastup}\n☆ *Tamaño ›* ${size}`
      const sizeBytes = parseSize(size)
      if (sizeBytes > 524288000) {
        return msg.reply(`《✧》 El archivo es demasiado grande (${size}).\n> Descárgalo directamente desde aquí:\n${downloadUrl}`)
      }
      await sock.sendMessage(msg.chat, { document: { url: downloadUrl }, mimetype: 'application/vnd.android.package-archive', fileName: `${name}.apk`, caption }, { quoted: msg })
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  },
}

function parseSize(sizeStr) {
  if (!sizeStr) return 0
  const parts = sizeStr.trim().toUpperCase().split(' ')
  const value = parseFloat(parts[0])
  const unit = parts[1] || 'B'
  switch (unit) {
    case 'KB': return value * 1024
    case 'MB': return value * 1024 * 1024
    case 'GB': return value * 1024 * 1024 * 1024
    default: return value
  }
}