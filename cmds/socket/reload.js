import { startSubBot } from './subs.js';
import fs from 'fs';
import path from 'path';
import { jidDecode } from 'baileys';
import db from '#db';

export default {
  command: ['reload'],
  category: 'socket',
  description: 'Recargar la sesión del bot.',
  run: async ({ msg, sock, args }) => {
    const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || '';
    const botSettings = db.getSettings(botId) || {};
    const isOwner2 = [botId, ...(botSettings.owner ? [botSettings.owner] : []), ...((global).owner || []).map((num) => num + '@s.whatsapp.net')].includes(msg.sender);
    if (!isOwner2) return sock.reply(msg.chat, '《✧》 Este comando solo puede ser ejecutado por un Socket.', msg);
    const rawId = sock.user?.id || '';
    const decoded = jidDecode(rawId);
    const cleanId = decoded?.user || rawId.split('@')[0];
    const sessionPath = path.join('Sessions', 'Subs', cleanId);
    if (!fs.existsSync(sessionPath)) {
      return msg.reply('《✧》 Este comando solo puede ser usado desde una instancia de Sub-Bot.');
    }
    const caption = '✿ *Sesión del bot reiniciada correctamente!*.';
    const phone = args[0] ? args[0].replace(/\D/g, '') : msg.sender.split('@')[0];
    startSubBot(msg, sock, caption, false, phone, msg.chat, true);
    await sock.reply(msg.chat, caption, msg);
  },
};
