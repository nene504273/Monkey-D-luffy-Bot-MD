import db from '#db';
export default {
  command: ['ping', 'p'],
  category: 'main',
  run: async ({ msg, sock }) => {
    const start = Date.now()
    const sent = await sock.sendMessage(msg.chat, { text: '`❏ ¡Pong!`' + `\n> *${db.getSettings(sock.user.id.split(':')[0] + "@s.whatsapp.net").namebot}*`}, { quoted: msg })
    const latency = Date.now() - start
    await sock.sendMessage(msg.chat, { text: `✿ *Pong!*\n> Tiempo ⴵ ${latency.toFixed(4).split(".")[0]}ms`, edit: sent.key }, { quoted: msg })
  },
};