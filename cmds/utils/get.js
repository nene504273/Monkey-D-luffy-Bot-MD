import fetch from 'node-fetch';
import { format } from 'util';

export default {
  command: ['get', 'fetch'],
  category: 'utils',
  description: 'Realizar solicitudes GET a páginas web.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const text = args[0];
    if (!text) return msg.reply('《✧》 Ingresa un enlace para realizar la solicitud.');
    if (!/^https?:\/\//.test(text)) {
      return msg.reply('《✧》 Ingresa un enlace válido que comience con http o https');
    }
    try {
      const _url = new URL(text);
      const params = new URLSearchParams(_url.searchParams);
      const url = `${_url.origin}${_url.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';
      const contentLength = parseInt(res.headers.get('content-length') || '0');
      if (contentLength > 100 * 1024 * 1024) {
        return msg.reply(`《✧》 El archivo es demasiado grande.\nContent-Length: ${contentLength} bytes`);
      }
      if (/text|json/.test(contentType)) {
        const buffer = await res.buffer();
        const content = buffer.toString();
        if (content.length > 500 && /html|css|javascript|json|xml|plain/.test(contentType)) {
          const ext = getExtension(contentType, url);
          await sock.sendCodeMessage(msg.chat, `code_${Date.now()}${ext}`, content, msg);
        } else {
          try {
            const json = JSON.parse(content);
            return msg.reply(format(json).slice(0, 65536));
          } catch {
            return msg.reply(content.slice(0, 65536));
          }
        }
      } else {
        const buffer = await res.buffer();
        return sock.sendFile(msg.chat, buffer, 'file', text, msg);
      }
    } catch (e) {
      console.error(e);
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};

function getExtension(contentType, url) {
  const match = url.match(/\.(\w+)(?:\?|$)/);
  if (match) return `.${match[1]}`;
  const map = { 'text/html': '.html', 'text/css': '.css', 'text/javascript': '.js', 'application/javascript': '.js', 'application/json': '.json', 'text/xml': '.xml', 'text/plain': '.txt' };
  return map[contentType] || '.txt';
}
