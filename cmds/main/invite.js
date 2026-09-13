import db from '#db';
const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})(?:\s+[0-9]{1,3})?/i;

async function getGroupName(sock, chatId) {
  try {
    const metadata = await sock.groupMetadata(chatId);
    return metadata.subject || 'Grupo desconocido';
  } catch {
    return 'Chat privado';
  }
}

export default {
  command: ['invite', 'invitar'],
  category: 'main',
  description: 'Invitar el bot a un grupo.',
  run: async ({ msg, sock, args }) => {
    db.setCreate('users', [msg.sender], 'jointime', 0);
    let user = db.getUser(msg.sender);
    const grupo = msg.isGroup ? await getGroupName(sock, msg.chat) : 'Chat privado';
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botSettings = db.getSettings(botId) || {};
    const botname = botSettings.botname || 'Bot';
    const dueño = botSettings.owner || '';
    const cooldown = 3600000;
    const nextTime = user.jointime + cooldown;
    if (Date.now() - user.jointime < cooldown) {
      return msg.reply(`ꕥ Espera *${msToTime(nextTime - Date.now())}* para volver a enviar otra invitacion.`);
    }
    if (!args || !args.length) {
      return msg.reply('《✧》 Ingresa el enlace para invitar al bot a tu grupo.');
    }
    const link = args.join(' ');
    const match = link.match(linkRegex);
    if (!match || !match[1]) {
      return msg.reply('《✧》 El enlace ingresado no es válido o está incompleto.');
    }
    const isOficialBot = botId === ((global.sock?.user?.id?.split(':')[0] ?? null) && ((global.sock?.user?.id?.split(':')[0] ?? null) && (global.sock.user.id.split(':')[0] + '@s.whatsapp.net')));
    const botType = isOficialBot ? 'Principal/Owner' : 'Sub Bot';
    const pp = await sock.profilePictureUrl(msg.sender, 'image').catch(() => 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg');
    const userName = user?.name || 'Usuario';
    const sugg = `❀ 𝗦𝗢𝗟𝗜𝗖𝗜𝗧𝗨𝗗 𝗥𝗘𝗖𝗜𝗕𝗜𝗗𝗔
    
✩ *Usuario ›* ${userName}
✿ *Enlace ›* ${args.join(' ')}
✿ *Chat ›* ${grupo}

➤ 𝗜𝗡𝗙𝗢 𝗕𝗢𝗧
♡ *Socket ›* ${botType}
★ *Nombre ›* ${botname}
❐ *Versión ›* @latest`;
    if (typeof sugg !== 'string' || !sugg.trim()) return;
    if (isOficialBot) {
      for (const num of global.owner) {
        try {
          await sock.sendMessage(`${num}@s.whatsapp.net`, { text: sugg });
        } catch {}
      }
    } else {
      const destino = dueño || botId;
      try {
        await sock.sendMessage(destino, { text: sugg });
      } catch {}
    }
    await sock.reply(msg.chat, '❀ El enlace fue enviado correctamente. ¡Gracias por tu invitación! ฅ^•ﻌ•^ฅ', msg);
    db.setUser(msg.sender, 'jointime', Date.now());
  },
};

function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  return `${minutes} Minuto(s) ${seconds} Segundo(s)`;
}