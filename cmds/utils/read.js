import { downloadContentFromMessage, extractMessageContent } from 'baileys';

export default {
  command: ['readviewonce', 'read', 'readvo'],
  category: 'utils',
  description: 'Convertir imagen/video de una vista a contenido.',
  run: async ({ msg, sock, usedPrefix, command }) => {
    const quoted = msg.quoted;
    if (!quoted) {
      return msg.reply('《✧》 Por favor, responde a un mensaje "ViewOnce" para ver su contenido.');
    }
    try {
      await msg.react('🕒');
      const content = extractMessageContent(quoted.message || quoted);
      if (!content) {
        return msg.reply('《✧》 No se pudo extraer el contenido.');
      }
      const messageType = Object.keys(content)[0];
      const mediaMessage = content[messageType];
      const stream = await downloadContentFromMessage(mediaMessage, messageType.replace('Message', '').toLowerCase());
      if (!stream) {
        return msg.reply('《✧》 No se pudo descargar el contenido.');
      }
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      if (/video/i.test(messageType)) {
        await sock.sendMessage(msg.chat, { video: buffer, caption: mediaMessage.caption || '', mimetype: 'video/mp4' }, { quoted: msg });
      } else if (/image/i.test(messageType)) {
        await sock.sendMessage(msg.chat, { image: buffer, caption: mediaMessage.caption || '' }, { quoted: msg });
      } else if (/audio/i.test(messageType)) {
        await sock.sendMessage(msg.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: mediaMessage.ptt || false }, { quoted: msg });
      }      
      await msg.react('✔️');
    } catch (e) {
      await msg.react('✖️');
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};