import db from '#db';
export default {
  command: ['setbotowner', 'setowner'],
  category: 'socket',
  description: 'Cambiar el dueño del bot.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    let config = db.getSettings(idBot) || {};
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(msg.sender);
    if (!isOwner2) return msg.reply(global.mess.socket);
    const text = args.join(' ').trim();
    const actual = config.owner || '';
    if (text.toLowerCase() === 'clear') {
      if (!actual) return msg.reply('❀ No hay ningún propietario asignado actualmente.');
      db.setSettings(idBot, 'owner', '');
      return msg.reply('❀ Se ha eliminado el propietario del Socket.');
    }
    const who = msg.mentionedJid?.[0] || msg.quoted?.sender || null;
    const limpio = text.replace(/[^0-9]/g, '');
    const nuevo = who || (limpio.length >= 10 ? (limpio.startsWith('52') && limpio.length === 12 ? `52${limpio[2] !== '1' ? '1' : ''}${limpio.slice(2)}@s.whatsapp.net` : `${limpio}@s.whatsapp.net`) : null);
    if (actual && ((!msg.quoted && msg.mentionedJid.length === 0 && !text) || (nuevo && actual === nuevo))) {
      return sock.sendMessage(msg.chat, { text: `ꕥ Ya tienes un dueño asignado @${actual.split('@')[0]}.\n\n✿ Si quieres cambiarlo usa:\n> *${usedPrefix + command}* @${idBot.split('@')[0]}\n\n✿ Si quieres eliminar el dueño asignado usa:\n> *${usedPrefix + command} clear*`, mentions: [actual, idBot] }, { quoted: msg });
    }
    if (!nuevo) return sock.reply(msg.chat, `✐ Debes mencionar al nuevo dueño del Socket.\n> Ejemplo: *${usedPrefix + command}* @${idBot.split('@')[0]}`, msg, { mentions: [idBot] });
    const [ownerActual, ownerNuevo] = [actual ? actual.split('@')[0] : null, nuevo.split('@')[0]];
    db.setSettings(idBot, 'owner', nuevo);
    return sock.sendMessage(msg.chat, { text: actual && actual !== nuevo ? `✿ El dueño del sokect ha sido cambiado de @${ownerActual} a @${ownerNuevo}!` : `❀ Se asignó a @${ownerNuevo} como nuevo propietario de *${config.namebot || 'Bot'}*!`, mentions: [nuevo, ...(actual && actual !== nuevo ? [actual] : [])] }, { quoted: msg });
  },
};