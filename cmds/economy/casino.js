import { delay } from 'baileys';
import db from '#db';

let buatall = 1;
export default {
  command: ['apostar', 'casino'],
  category: 'economy',
  description: 'Apostar coins en el casino.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    const chatData = db.getChat(msg.chat)
    if (chatData.adminonly || !chatData.economy) {
      return msg.reply(`ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`);
    }        
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = db.getSettings(botId);
    const currency = bot.currency;
    const botname = bot.botname;    
    db.setCreate('chat_users', [msg.chat, msg.sender], 'lastApuesta', 0);
    const user = db.getChatUser(msg.chat, msg.sender);    
    let Aku = Math.floor(Math.random() * 101);
    let Kamu = Math.floor(Math.random() * 55);
    let count = args[0];
    const users = db.getUser(msg.sender);
    const userName = users?.name || msg.sender.split('@')[0];
    const tiempoEspera = 30 * 1000;
    const ahora = Date.now();        
    if (user.lastApuesta && ahora - user.lastApuesta < tiempoEspera) {
      const restante = user.lastApuesta + tiempoEspera - ahora;
      const tiempoRestante = formatTime(restante);
      return sock.reply(msg.chat, `ꕥ Debes esperar *${tiempoRestante}* para usar *${usedPrefix + command}* nuevamente.`, msg);
    }        
    db.setChatUser(msg.chat, msg.sender, 'lastApuesta', ahora);
    if (count && /all/i.test(count)) {
      count = Math.floor(users.limit / buatall);
    } else if (args[0]) {
      count = parseInt(args[0]);
    } else {
      count = 1;
    }        
    count = Math.max(1, count);
    if (args.length < 1) {
      return sock.reply(msg.chat, `❀ Ingresa la cantidad de *${currency}* que deseas aportar contra *${botname}*\n> Ejemplo: *${usedPrefix + command} 100*`, msg);
    }
    if (user.coins >= count) {
      db.setChatUser(msg.chat, msg.sender, 'coins', user.coins - count);
      let resultado = '';
      let ganancia = 0;
      if (Aku > Kamu) {
        resultado = `> ${userName}, *Perdiste ¥${formatNumber(count)} ${currency}*.`;
      } else if (Aku < Kamu) {
        ganancia = count * 2;
        db.setChatUser(msg.chat, msg.sender, 'coins', (user.coins - count) + ganancia);
        resultado = `> ${userName}, *Ganaste ¥${formatNumber(ganancia)} ${currency}*.`;
      } else {
        ganancia = count;
        db.setChatUser(msg.chat, msg.sender, 'coins', (user.coins - count) + ganancia);
        resultado = `> ${userName}, *Ganaste ¥${formatNumber(ganancia)} ${currency}*.`;
      }
      let { key } = await sock.sendMessage(msg.chat, { text: "🎲 El crupier lanza los dados... ¡Las apuestas están cerradas!" }, { quoted: msg });
      await delay(2000);
      await sock.sendMessage(msg.chat, { text: "❀ Los números están girando... ¡Prepárate para el resultado!", edit: key }, { quoted: msg });
      await delay(2000);
      const replyMsg = `❀ \`Veamos qué números tienen!\`\n\n➠ *${botname}* : ${Aku}\n➠ *${userName}* : ${Kamu}\n\n${resultado}`;
      await sock.sendMessage(msg.chat, { text: replyMsg.trim(), edit: key }, { quoted: msg });
    } else {
      sock.reply(msg.chat, `ꕥ No tienes *¥${formatNumber(count)} ${currency}* para apostar!`, msg);
    }
  }
};

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatTime(ms) {
  if (ms <= 0 || isNaN(ms)) return 'Ahora';
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const partes = [];
  if (min) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`);
  partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`);
  return partes.join(' ');
}