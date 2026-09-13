import fetch from 'node-fetch'

export default {
  command: ['drive', 'gdrive'],
  category: 'downloads',
  description: 'Descargar un archivo de Google Drive.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    if (!args[0]) {
      return msg.reply('《✧》 Por favor, ingresa un link de Google Drive.')
    }    
    const url = args[0]
    if (!url.match(/drive\.google\.com\/(file\/d\/|open\?id=|uc\?id=)/)) {
      return msg.reply('《✧》 La URL no parece válida de Google Drive.')
    }    
    try {
      const result = await gdriveScraper(url)
      if (!result.status) {
        return msg.reply('《✧》 No se pudo obtener el archivo. Intenta con otro enlace.')
      }      
      const { fileName, fileSize, mimetype, downloadUrl } = result.data
      const caption = `۟　ꕥ ᩧ　𓈒　ׄ　𝖦oogle 𝖣𝗋𝗂𝗏𝖾　ׅ　✿۟\n\n ׄ ﹙ׅ☆﹚ּ *Nombre* › ${fileName}\n ׄ ﹙ׅ☆﹚ּ *Tamaño* › ${fileSize}\n ׄ ﹙ׅ☆﹚ּ *Tipo* › ${mimetype}\n\n𖣣ֶㅤ֯⌗ ☆  ⬭ *Enlace* › ${url}`      
      await sock.sendMessage(msg.chat, { document: { url: downloadUrl }, mimetype, fileName, caption }, { quoted: msg })      
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  }
}

async function gdriveScraper(url) {
  try {
    let id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1]
    if (!id) throw new Error('No se encontró ID de descarga')   
    let res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, { method: 'post', headers: { 'accept-encoding': 'gzip, deflate, br', 'content-length': 0, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', origin: 'https://drive.google.com', 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36', 'x-sock-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=', 'x-drive-first-party': 'DriveWebUi', 'x-json-requested': 'true' }})    
    let { fileName, sizeBytes, downloadUrl } = JSON.parse((await res.text()).slice(4))
    if (!downloadUrl) throw new Error('Se excedió el número de descargas del link')
    let data = await fetch(downloadUrl)
    if (data.status !== 200) throw new Error(data.statusText)
    return { status: true, data: { downloadUrl, fileName, fileSize: `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`, mimetype: data.headers.get('content-type') }}
  } catch (error) {
    return { status: false, message: error.message }
  }
}