import * as Jimp from 'jimp';
import db from '#db';

async function resizeImage(media) {
  const jimp = await Jimp.read(media);
  const min = jimp.getWidth();
  const max = jimp.getHeight();
  const cropped = jimp.crop(0, 0, min, max);
  return { img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG), preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG) };
}

export default {
  command: ['setimage', 'setpfp'],
  category: 'socket',
  description: 'Cambiar la imagen de perfil del bot.',
  run: async ({ msg, sock, args }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const config = db.getSettings(idBot) || {};
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(msg.sender);
    if (!isOwner2) return msg.reply(global.mess.socket);
    const q = msg.quoted || msg;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    if (!/image/g.test(mime)) return msg.reply('✐ Debes enviar o citar una imagen para cambiar la foto de perfil del bot.');
    const media = await q.download();
    if (!media) return msg.reply('✎ No se pudo descargar la imagen.');
    if (args[1] === 'full') {
      const { img } = await resizeImage(media);
      await sock.query({ tag: 'iq', attrs, content: [{ tag: 'picture', attrs, content: img }] });
    } else {
      await sock.updateProfilePicture(idBot, media);
    }    
    return msg.reply(`✿ Se ha actualizado la foto de perfil de *${config.namebot || 'Bot'}*!`);
  },
};