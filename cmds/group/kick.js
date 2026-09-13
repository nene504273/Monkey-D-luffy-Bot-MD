import db from '#db';
export default {
  command: ['kick', 'ban', 'bang'],
  category: 'group',
  description: 'Expulsar a un usuario del grupo.',
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, args, usedPrefix, command, groupMetadata, participants }) => {
    const ownerGroup = groupMetadata?.owner || msg.chat.split('-')[0] + '@s.whatsapp.net';
    const ownerBot = global.owner + '@s.whatsapp.net';
    const botId = sock.decodeJid(sock.user.id);
    if (args[0] === 'num' || args[0] === 'listnum') {
      if (!args[1]) return msg.reply(`《✧》 Ingrese algún prefijo de un país\n> ✎ Ejemplo: *${usedPrefix + command} num +54*`);
      const prefix = args[1].replace(/[+]/g, '');
      const allUsersWithPrefix = participants.map(p => p.id).filter(jid => jid && jid !== botId && jid.split('@')[0].startsWith(prefix));
      if (allUsersWithPrefix.length === 0) return msg.reply(`《✧》 Aquí no hay ningún número con el prefijo +${prefix}`);
      if (args[0] === 'listnum') {
        const numeros = allUsersWithPrefix.map(v => '⭔ @' + v.replace(/@.+/, ''));
        return sock.reply(msg.chat, `《✧》 *Lista de usuarios con prefijo +${prefix}* (${allUsersWithPrefix.length})\n\n${numeros.join('\n')}`, msg, { mentions: allUsersWithPrefix });
      }
      const usersToKick = allUsersWithPrefix.filter(jid => {
        const p = participants.find(x => x.id === jid);
        if (!p) return false;
        if (p.admin === 'admin' || p.admin === 'superadmin') return false;
        if (jid === ownerGroup || jid === ownerBot) return false;
        return true;
      });
      if (usersToKick.length === 0) return msg.reply(`《✧》 Hay usuarios con prefijo +${prefix} pero todos son admins o propietarios.`);
      await msg.reply(`《✧》 *Eliminando usuarios con prefijo +${prefix}* (${usersToKick.length} de ${allUsersWithPrefix.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0, errores = [], noEliminados = allUsersWithPrefix.length - usersToKick.length;
      for (const jid of usersToKick) {
        try { await sock.groupParticipantsUpdate(msg.chat, [jid], 'remove'); eliminados++; await new Promise(r => setTimeout(r, 3000)); }
        catch (e) { errores.push(`@${jid.split('@')[0]}: ${e.message}`); }
      }
      let res = `《✧》 Proceso completado.\n> Usuarios eliminados: *${eliminados}*`;
      if (noEliminados > 0) res += `\n> Usuarios omitidos (admins/owners): *${noEliminados}*`;
      if (errores.length > 0) res += `\n> Errores: *${errores.length}*\n${errores.join('\n')}`;
      return msg.reply(res);
    }
    if (args[0] === 'all') {
      const usersToKick = participants.filter(p => p.id && p.id !== botId && p.id !== ownerGroup && p.id !== ownerBot && p.admin !== 'admin' && p.admin !== 'superadmin').map(p => p.id);
      if (usersToKick.length === 0) return msg.reply('《✧》 No hay usuarios para eliminar (todos son admins o propietarios).');
      await msg.reply(`《✧》 *Eliminando todos los usuarios* (${usersToKick.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0, errores = [], noEliminados = participants.length - usersToKick.length;
      for (const jid of usersToKick) {
        try { await sock.groupParticipantsUpdate(msg.chat, [jid], 'remove'); eliminados++; await new Promise(r => setTimeout(r, 3000)); }
        catch (e) { errores.push(`@${jid.split('@')[0]}: ${e.message}`); }
      }
      let res = `《✧》 Proceso completado.\n> Usuarios eliminados: *${eliminados}*`;
      if (noEliminados > 0) res += `\n> Usuarios omitidos (admins/owners): *${noEliminados}*`;
      if (errores.length > 0) res += `\n> Errores: *${errores.length}*\n${errores.join('\n')}`;
      return msg.reply(res);
    }
    if (args[0] === 'inactive' || args[0] === 'listinactive') {
      const allChatUsers = db.getChatUser(msg.chat);
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      let sider = [];
      for (const participant of participants) {
        const jid = participant.id;
        if (!jid || jid === botId || jid === ownerGroup || jid === ownerBot) continue;
        if (participant.admin === 'admin' || participant.admin === 'superadmin') continue;
        const userStats = allChatUsers.find(u => u.user_id === jid || u.user_id?.split('@')[0] === jid.split('@')[0]);
        if (userStats) {
          const days = Object.entries(userStats.stats || {}).filter(([date]) => new Date(date) >= cutoff);
          const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0);
          if (totalMsgs === 0) sider.push(jid);
        } else {
          sider.push(jid);
        }
      }
      if (sider.length === 0) return msg.reply('《✧》 Este grupo es activo, no tiene inactivos.');
      if (args[0] === 'listinactive')
        return sock.reply(msg.chat, `《✧》 *Lista de inactivos* (${sider.length})\n\n${sider.map(v => '⭔ @' + v.replace(/@.+/, '')).join('\n')}`, msg, { mentions: sider });
      await msg.reply(`《✧》 *Eliminando inactivos* (${sider.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0, errores = [];
      for (const jid of sider) {
        try { await sock.groupParticipantsUpdate(msg.chat, [jid], 'remove'); eliminados++; await new Promise(r => setTimeout(r, 3000)); }
        catch (e) { errores.push(`@${jid.split('@')[0]}: ${e.message}`); }
      }
      let res = `《✧》 Proceso completado. usuarios eliminados: *${eliminados}*`;
      if (errores.length > 0) res += `\n> Errores: *[${errores.join('\n')}]*`;
      return msg.reply(res);
    }
    if (!msg.mentionedJid[0] && !msg.quoted) {
      return msg.reply(`《✧》 Por favor, Etiqueta o responde al *mensaje* de la *persona* que quieres eliminar.\n\n✎ *Opciones especiales:*\n> *${usedPrefix + command} num +57* - Eliminar todos los usuarios con prefijo +57\n> *${usedPrefix + command} listnum +56* - Listar usuarios con prefijo +56\n> *${usedPrefix + command} all* - Eliminar todos los usuarios\n> *${usedPrefix + command} inactive* - Eliminar usuarios inactivos últimos (30 días)\n> *${usedPrefix + command} listinactive* - Listar usuarios inactivos`);
    }
    const targetRaw = msg.mentionedJid[0] ? msg.mentionedJid[0] : msg.quoted.sender;
    const userBase = targetRaw.split('@')[0];
    const participant = participants.find(p => p.id?.split('@')[0] === userBase || p.lid?.split('@')[0] === userBase);
    if (!participant) return sock.reply(msg.chat, `《✧》 *@${userBase}* ya no está en el grupo.`, msg, { mentions: [targetRaw] });
    const realJid = participant.id || targetRaw;
    if (realJid === sock.decodeJid(sock.user.id)) return msg.reply('《✧》 No puedo eliminar al *bot* del grupo');
    if (realJid === ownerGroup) return msg.reply('《✧》 No puedo eliminar al *propietario* del grupo');
    if (realJid === ownerBot)   return msg.reply('《✧》 No puedo eliminar al *propietario* del bot');
    try {
      await sock.groupParticipantsUpdate(msg.chat, [realJid], 'remove');
      sock.reply(msg.chat, `✎ @${userBase} *eliminado* correctamente`, msg, { mentions: [targetRaw] });
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  },
};