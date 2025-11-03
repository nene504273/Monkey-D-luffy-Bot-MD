import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fsPromises } from "fs";
const fs = { ...fsPromises, existsSync };
import path, { join } from 'path';
import ws from 'ws';

let handler = async (m, { conn: _envio, command, usedPrefix, args, text, isOwner }) => {
  const isDeleteSession = /^(deletesesion|deletebot|deletesession|deletesesaion)$/i.test(command);
  const isPauseBot = /^(stop|pausarai|pausarbot)$/i.test(command);
  const isShowBots = /^(bots|sockets|socket)$/i.test(command);

  const reportError = async (e) => {
    await m.reply(`⚠️ Ocurrió un error inesperado, lo siento mucho...`)
    console.error(e);
  };

  switch (true) {
    case isDeleteSession: {
      const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
      const uniqid = `${who.split('@')[0]}`;
      const dirPath = `./${jadi}/${uniqid}`;

      if (!await fs.existsSync(dirPath)) {
        await conn.sendMessage(m.chat, {
          text: `🚫 Sesión no encontrada. No tienes una sesión activa.\n\nCrea una con: ${usedPrefix}serbot` // Simplificando mensaje
        }, { quoted: m });
        return;
      }

      if (global.conn.user.jid !== conn.user.jid) {
        await conn.sendMessage(m.chat, {
          text: `💬 Este comando solo puede usarse desde el Bot Principal.\n\n🔗 Accede aquí:\nhttps://api.whatsapp.com/send/?phone=${global.conn.user.jid.split`@`[0]}&text=${usedPrefix + command}&type=phone_number&app_absent=0`
        }, { quoted: m });
        return;
      }

      await conn.sendMessage(m.chat, {
        text: `🗑️ Tu sesión como Sub-Bot ha sido eliminada con éxito.`
      }, { quoted: m });

      try {
        fs.rmdir(`./${jadi}/${uniqid}`, { recursive: true, force: true });
        await conn.sendMessage(m.chat, {
          text: `🌈 ¡Todo limpio! Tu sesión ha sido borrada por completo.`
        }, { quoted: m });
      } catch (e) {
        reportError(e);
      }
      break;
    }

    case isPauseBot: {
      if (global.conn.user.jid == conn.user.jid) {
        conn.reply(m.chat, `🚫 No puedes pausar el bot principal.\nSi deseas ser un Sub-Bot, contacta con el número principal.`, m);
      } else {
        await conn.reply(m.chat, `🔕 ${botname} ha sido pausada.`, m);
        conn.ws.close();
      }
      break;
    }

    case isShowBots: {
      // Filtra solo las conexiones activas
      const users = [...new Set([...global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)])];

      // Función para calcular tiempo activo (Se mantiene, es útil)
      const convertirMsADiasHorasMinutosSegundos = (ms) => {
        let segundos = Math.floor(ms / 1000);
        let minutos = Math.floor(segundos / 60);
        let horas = Math.floor(minutos / 60);
        let días = Math.floor(horas / 24);
        segundos %= 60;
        minutos %= 60;
        horas %= 24;

        return [
          días ? `${días} día(s)` : '',
          horas ? `${horas} hora(s)` : '',
          minutos ? `${minutos} minuto(s)` : '',
          segundos ? `${segundos} segundo(s)` : '',
        ].filter(Boolean).join(', ');
      };

      // Formato simple: Nombre y Número (y tiempo activo como detalle)
      const listaSubBots = users.map((v, i) => 
`[${i + 1}] 👤 ${v.user.name || 'Sub-Bot'}
» Número: wa.me/${v.user.jid.replace(/[^0-9]/g, '')}
» Online: ${v.uptime ? convertirMsADiasHorasMinutosSegundos(Date.now() - v.uptime) : 'Desconocido'}`
      )
      .join('\n───────────────\n'); // Separador simple

      const finalMessage = listaSubBots.length === 0
        ? 'No hay Sub-Bots activos.'
        : listaSubBots;

      // Mensaje final limpio y directo
      const msg = `
💬 Lista de Sub-Bots Activos: ${users.length} Sesiones
────────────────
${finalMessage}
`.trim();

      await _envio.sendMessage(m.chat, {
        text: msg,
        // Se mantiene parseMention solo por si el nombre contiene menciones
        mentions: _envio.parseMention(msg) 
      }, { quoted: m });
      break;
    }
  }
};

handler.tags = ['serbot'];
handler.help = ['sockets', 'deletesesion', 'pausarai'];
handler.command = [
  'deletesesion', 'deletebot', 'deletesession', 'deletesesaion',
  'stop', 'pausarai', 'pausarbot',
  'bots', 'sockets', 'socket'
];

export default handler;