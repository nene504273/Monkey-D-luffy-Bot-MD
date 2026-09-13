import syntaxerror from 'syntax-error';
import { format } from 'util';
import { createRequire } from 'module';

export default {
  command: ['ex', 'e'],
  category: 'owner',
  description: 'Ejecutar código JavaScript en el bot.',
  isOwner: true,
  run: async ({ msg, sock, args, command, text, __dirname }) => {
    const require = createRequire(__dirname);
    if (!text.trim()) {
      return sock.reply(msg.chat, '《✧》 Debes escribir un comando a ejecutar.', msg);
    }    
    let _text = (command === 'e' ? 'return ' : '') + text;
    let _return, _syntax = '';    
    try {
      await msg.react('🕒');
      let i = 15;
      let f = { exports: {} };
      let exec = new (async () => {}).constructor('print', 'msg', 'sock', 'require', 'Array', 'process', 'args', 'module', 'exports', 'argument', _text);      
      _return = await exec.call(sock, (...args) => {
        if (--i < 1) return;
        return sock.reply(msg.chat, format(...args), msg);
      }, msg, sock, require, Array, process, args, f, f.exports, [sock]);      
      await msg.react('✔️');
    } catch (e) {
      let err = syntaxerror(_text, 'Execution Function', { allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true, sourceType: 'module' });      
      if (err) _syntax = '```' + err + '```\n\n';
      _return = e;
      await msg.react('✖️');
    } finally {
      sock.reply(msg.chat, _syntax + format(_return), msg);
    }
  }
};
