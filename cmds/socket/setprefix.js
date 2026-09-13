import GraphemeSplitter from 'grapheme-splitter';
import db from '#db';

export default {
  command: ['setprefix', 'setbotprefix'],
  category: 'socket',
  description: 'Cambiar el prefijo del bot.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const idBot = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    let config = db.getSettings(idBot) || {};
    const isOwner2 = [idBot, ...(config.owner ? [config.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(msg.sender);
    if (!isOwner2) return sock.reply(msg.chat, global.mess.socket, msg);
    const value = args.join(' ').trim();
    const defaultPrefix = ["#", "/", "!", "."];
    if (!value) {
      const lista = config.prefix === 1 ? '`sin prefijos`' : (Array.isArray(config.prefix) ? config.prefix : [config.prefix || '/']).map(p => `\`${p}\``).join(', ');
      return msg.reply(`❀ Por favor, elige cualquiera de los siguientes métodos de prefijos.\n\n> *○ Only-Prefix* » ${usedPrefix + command} *.*\n> *○ Multi-Prefix* » ${usedPrefix + command} *!/.#*\n> *○ No-Prefix* » ${usedPrefix + command} *noprefix*\n\nꕥ Actualmente se está usando: ${lista}`);
    }
    if (value.toLowerCase() === 'reset') {
      db.setSettings(idBot, 'prefix', defaultPrefix);
      return sock.reply(msg.chat, `❀ Se han restaurado los prefijos predeterminados: *${defaultPrefix.join(' ')}*`, msg);
    }
    if (value.toLowerCase() === 'noprefix') {
      db.setSettings(idBot, 'prefix', 1);
      return msg.reply(`❀ Se cambio al modo sin prefijos para el Socket correctamente\n> Ahora el bot responderá a comandos *sin prefijos*.`);
    }
    const splitter = new GraphemeSplitter();
    const graphemes = splitter.splitGraphemes(value);
    const lista = [];
    for (const g of graphemes) {
      if (/^[a-zA-Z]+$/.test(g)) continue;
      if (!lista.includes(g)) lista.push(g);
    }
    if (lista.length === 0) return sock.reply(msg.chat, 'ꕥ No se detectaron prefijos válidos. Debes incluir al menos un símbolo o emoji.', msg);
    if (lista.length > 6) return sock.reply(msg.chat, 'ꕥ Máximo 6 prefijos permitidos.', msg);
    db.setSettings(idBot, 'prefix', lista);
    return sock.reply(msg.chat, `❀ Se cambió el prefijo del Socket a *${lista.join(' ')}* correctamente.`, msg);
  },
};