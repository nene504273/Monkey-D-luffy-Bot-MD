import fetch from 'node-fetch';
import db from '#db';

async function uploadImage(buffer, mime) {
  const base64Data = buffer.toString('base64');
  const extension = mime.split('/')[1] || 'jpg';
  
  const res = await fetch('https://cdn.adoolab.xyz/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: `icon.${extension}`,
      data: base64Data,
      expiration: 'never'
    })
  });
  
  const json = await res.json();
  if (json?.url) return json.url;
  throw new Error('Upload failed');
}

export default {
  command: ['seticon', 'setboticon'],
  category: 'socket',
  description: 'Cambiar el ícono del bot.',
  run: async ({ msg, sock, args }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    let config = db.getSettings(idBot) || {}
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(msg.sender)
    if (!isOwner2) return msg.reply(global.mess.socket)
    const value = args.join(' ').trim()
    if (!value && !msg.quoted && !msg.message?.imageMessage) {
      return msg.reply('✎ Debes enviar o citar una imagen para cambiar el icon del bot.')
    }
    if (value && value.startsWith('http')) {
      db.setSettings(idBot, 'icon', value)
      return msg.reply(`✿ Se ha actualizado el icon de *${config.namebot || 'Bot'}*!`)
    }
    const q = msg.quoted || msg
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/image\/(png|jpe?g)/.test(mime)) {
      return msg.reply('✎ Responde a una imagen válida.')
    }
    const media = await q.download()
    if (!media) return msg.reply('✎ No se pudo descargar la imagen.')
    const link = await uploadImage(media, mime)
    db.setSettings(idBot, 'icon', link)
    return msg.reply(`✿ Se ha actualizado el icon de *${config.namebot || 'Bot'}*!`)
  }
}
