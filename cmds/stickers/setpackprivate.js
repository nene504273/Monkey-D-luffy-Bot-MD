import db from '#db';
export default {
  command: ['setpackprivate', 'setpackpriv', 'packprivate'],
  category: 'stickers',
  description: 'Establecer un paquete de stickers como privado.',
  run: async ({ msg, args, usedPrefix, command }) => {
    try {
      if (!args.length) {
        return msg.reply('《✧》Debes especificar el nombre del paquete de stickers.')
      }
      const packName = args.join(' ').trim()
      const stickerPackData = db.getStickersPack(msg.sender)
      const packs = stickerPackData.packs || []
      if (!packs || packs.length === 0) {
        return msg.reply('《✧》No tienes paquetes creados.')
      }
      const pack = packs.find(p => p.name.toLowerCase() === packName.toLowerCase())
      if (!pack) {
        return msg.reply(`《✧》No se encontró el paquete de stickers \`${packName}\`.`)
      }
      if (pack.spackpublic === 0) {
        return msg.reply(`《✧》El paquete de stickers \`${pack.name}\` ya es privado.`)
      }
      pack.spackpublic = 0
      pack.lastModified = Date.now().toString()
      db.setStickersPack(msg.sender, 'packs', packs);
      msg.reply(`❀ El paquete de stickers \`${pack.name}\` ha sido establecido como privado!`)
    } catch (e) {
      msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
}