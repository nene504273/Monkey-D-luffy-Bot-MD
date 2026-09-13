import db from '#db';
const formatDate = (timestamp) => {
  const date = new Date(parseInt(timestamp))
  return date.toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
}

export default {
  command: ['packlist', 'stickerpacks'],
  category: 'stickers',
  description: 'Listar tus paquetes de stickers.',
  run: async ({ msg, sock, usedPrefix, command, text }) => {
    try {
      const stickerPackData = db.getStickersPack(msg.sender)
      const packs = stickerPackData.packs || []
      if (!packs.length) {
        return msg.reply('《✧》No tienes paquetes de stickers creados.')
      }
      let text = `*❀ Lista de tus paquetes de stickers:*\n`
      text += `> ❏ Total: \`${packs.length}\`\n`
      text += `> ❏ Usuario: @${msg.sender.split('@')[0]}\n\n`
      packs.forEach(pack => {
        const estado = pack.spackpublic === 1 ? 'Público' : 'Privado'
        text += `❖ *${pack.name || 'Sin nombre'}*\n`
        text += `> » Stickers: \`${pack.stickers?.length || 0}\`\n`
        text += `> » Modificado: \`${formatDate(pack.lastModified || pack.id)}\`\n`
        text += `> » Estado: \`${estado}\`\n\n`
      })
      await sock.sendMessage(msg.chat, { text, mentions: [msg.sender] }, { quoted: msg })
    } catch (e) {
      msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
}