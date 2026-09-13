export default {
  command: ['hidetag', 'tag'],
  category: 'group',
  description: 'Enviar un mensaje mencionando a todos los usuarios del grupo.',
  isAdmin: true,
  run: async ({ msg, sock, args, usedPrefix, command, text, groupMetadata, participants }) => {
    const groupParticipants = participants || [];
    const mentions = groupParticipants.map(p => p.id).filter(Boolean);
    const userText = (args.join(' ') || '').trim();
    const src = msg.quoted || msg;
    const hasImage = Boolean(src.message?.imageMessage || src.mtype === 'imageMessage' || src.mimetype === 'image' || src.mediaType === 'image');
    const hasVideo = Boolean(src.message?.videoMessage || src.mtype === 'videoMessage' || src.mimetype === 'video'   || src.mediaType === 'video');
    const hasAudio = Boolean(src.message?.audioMessage || src.mtype === 'audioMessage' || src.mimetype === 'audio'   || src.mediaType === 'audio');
    const hasSticker = Boolean(src.message?.stickerMessage || src.mtype === 'stickerMessage' || src.mimetype === 'sticker' || src.mediaType === 'sticker');
    const isQuoted = Boolean(msg.quoted);
    const originalText = (src.caption || src.text || src.body || '').trim();
    try {
      if (hasImage || hasVideo) {
        const media = await src.download();
        const options = { quoted: null, mentions };
        if (isQuoted) {
          if (hasImage) return sock.sendMessage(msg.chat, { image: media, ...(originalText ? { caption: originalText } : {}), ...options });
          else return sock.sendMessage(msg.chat, { video: media, mimetype: 'video/mp4', ...(originalText ? { caption: originalText } : {}), ...options });
        } else {
          if (hasImage) return sock.sendMessage(msg.chat, { image: media, ...(userText ? { caption: userText } : {}), ...options });
          else return sock.sendMessage(msg.chat, { video: media, mimetype: 'video/mp4', ...(userText ? { caption: userText } : {}), ...options });
        }
      }
      if (hasAudio) { const media = await src.download(); return sock.sendMessage(msg.chat, { audio: media, mimetype: 'audio/mp4', fileName: 'hidetag.mp3', mentions }, { quoted: null }); }
      if (hasSticker) { const media = await src.download(); return sock.sendMessage(msg.chat, { sticker: media, mentions }, { quoted: null }); }
      if (isQuoted && originalText) return sock.sendMessage(msg.chat, { text: originalText, mentions }, { quoted: null });
      if (userText) return sock.sendMessage(msg.chat, { text: userText, mentions }, { quoted: null });
      return msg.reply(`《✧》 *Ingresa* un texto o *responde* a uno`);
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};
