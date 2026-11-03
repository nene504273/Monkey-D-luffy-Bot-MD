import fetch from 'node-fetch';

export default {
  command: ['todos', 'invocar', 'tagall'],
  category: 'group',
  admin: true,
  group: true,
  needsParticipants: true,
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix, isAdmin, isOwner, participants = [] }) => {
    try {
      if (prefix === 'a' || prefix === 'A') return;

      const botname = global.botname || 'Ruby';
      const emoji = global.emoji || '⚡'; // Definido por seguridad si global.emoji no existe

      await msg.react('✅');

      if (!Array.isArray(participants) || !participants.length) {
        return sock.sendMessage(
          msg.chat, 
          { text: `${emoji} No pude obtener la lista de participantes del grupo.` }, 
          { quoted: msg }
        );
      }

      if (!(isAdmin || isOwner)) {
        if (typeof global.dfail === 'function') {
          return global.dfail('admin', msg, sock);
        } else {
          return sock.sendMessage(
            msg.chat, 
            { text: '¡Este comando solo puede ser usado por administradores!' }, 
            { quoted: msg }
          );
        }
      }

      let fkontak = null;
      try {
        const res = await fetch('https://i.postimg.cc/nhdkndD6/pngtree-yellow-bell-ringing-with-sound-waves-png-image-20687908.png');
        const thumb2 = Buffer.from(await res.arrayBuffer());
        fkontak = {
          key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
          message: {
            locationMessage: {
              name: `¡𝙈𝙀𝙉𝘾𝙄𝙊𝙉 𝙋𝘼𝙍𝘼 𝙏𝙊𝘿𝙊 𝙀𝙇 𝙂𝙍𝙐𝙋𝙊!`,
              jpegThumbnail: thumb2
            }
          },
          participant: '0@s.whatsapp.net'
        };
      } catch (e) {}

      const mensaje = args.join(' ') || 'Atención a todos';
      const titulo = `*─ᐅ「 𝗔𝗩𝗜𝗦𝗢 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 」*`;

      let texto = `${titulo}\n\n`;
      texto += `*Mensaje:* \`${mensaje}\`\n\n`;
      texto += `╭─「 *Invocando al grupo* 」\n`;

      const mentionIds = participants.map((member) => member?.id || member?.jid).filter(Boolean);
      for (const member of mentionIds) {
        texto += `│ ${emoji} @${member.split('@')[0]}\n`;
      }

      texto += `╰─「 ${botname} 」`;

      if (!mentionIds.length) {
        return sock.sendMessage(
          msg.chat, 
          { text: `${emoji} No hay participantes válidos para mencionar.` }, 
          { quoted: msg }
        );
      }

      await sock.sendMessage(
        msg.chat,
        { text: texto, mentions: mentionIds },
        { quoted: fkontak || msg }
      );

    } catch (e) {
      console.error('🔴 ERROR EN TAGALL:', e);
      await sock.sendMessage(
        msg.chat, 
        { text: '✿⸝꙳.˖ Ocurrió un error al ejecutar el comando tagall.' }, 
        { quoted: msg }
      );
    }
  },
};
