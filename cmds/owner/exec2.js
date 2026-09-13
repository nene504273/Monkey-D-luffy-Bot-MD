import cp, { exec as _exec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(_exec).bind(cp);

export default {
  command: ['r'],
  category: 'owner',
  description: 'Ejecutar comandos del sistema.',
  isOwner: true,
  run: async ({ msg, sock, text }) => {
    if (!text.trim()) {
      return sock.reply(msg.chat, '《✧》 Debes escribir un comando a ejecutar.', msg);
    }    
    let o;
    try {
      await msg.react('🕒');
      o = await exec(text.trim());
      await msg.react('✔️');
    } catch (e) {
      o = e;
      await msg.react('✖️');
    } finally {
      const { stdout, stderr } = o;
      if (stdout?.trim()) sock.reply(msg.chat, stdout, msg);
      if (stderr?.trim()) sock.reply(msg.chat, stderr, msg);
    }
  }
};