import db from "#db"
import { getDevice } from 'baileys';
import moment from 'moment-timezone';
import { commands } from '../../lib/system/comandos.js';

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      const now = new Date();
      const colombianTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/Bogota' })
      );
      const tiempo = colombianTime
        .toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        .replace(/,/g, '');
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A');

      const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net' || '';

      const botSettings = (await db.getSettings(botId)) || {}; 
      const botname = botSettings.namebot || '';
      const botname2 = botSettings.namebot2 || '';
      const owner = botSettings.owner || '';
      const link = botSettings.link || '';

      // ── IMAGEN DEL MENÚ: CAMBIA ESTA URL POR UNA DE CATBOX/IMGRUR/TELEGRAPH ──
      const banner = 'https://d.uguu.se/QabPZFiU.jpeg';

      const isOficialBot =
        botId === global?.sock ? global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' : ''
      const botType = isOficialBot ? 'Owner' : 'Sub Bot';

      const userr = (await db.getUser()) || {}; 
      const users = Object.keys(userr).length || 0;

      const time = sock.uptime
        ? formatearMs(Date.now() - sock.uptime)
        : 'Desconocido';
      const device = getDevice(msg.key.id);

      const own = (await db.getUser(owner)) || {}; 

      // ── Datos del canal ──
      const canal = '120363420846835529@newsletter';
      const canalNombre = '© powered by Luffy';

      // ── Cabecera con estilo de tripulación ──
      let menu = `｡•᎑•っ ¡Buenos días, tripulación del Sombrero de Paja! ☀️
${botname2} ha recibido una actualización. Revisen los comandos mejorados y disfruten.

✐ ֹ ִ𓏧𓏧𓏧𓏧 🍬 𓏧𓏧𓏧 🍭 𓏧𓏧𓏧𓏧𓏧𓏧𓏧𓏧

‧₊ ᵎᵎ 🍖 ✐ ֹ ִ INFORMACIÓN DEL BARCO 𓈒𓏸

✐ Capitán — ${owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? (own.name || owner) : owner) : 'Oculto por privacidad'}
✐ Tripulación — ${botType}
✐ Navegación — ${device}
✐ Fecha — ${tiempo}
✐ Hora — ${tiempo2}
✐ Nakamas — ${users.toLocaleString()}
✐ Rumbo activo — ${time}
✐ Póster de reclutamiento — ${link}

✐ ֹ ִ 🍭 𓏧𓏧𓏧 🍬 𓏧𓏧𓏧𓏧 ✐ ֹ ִ

‧₊ ᵎᵎ 🥤 ֹ ִ CANAL OFICIAL ✅ 𓈒𓏸

✐ ${canalNombre}
✐ ${canal}

✐ ֹ ִ 🍭 𓏧𓏧𓏧 🍬 𓏧𓏧𓏧𓏧 ✐ ֹ ִ

‧₊ ᵎᵎ 🥤 ֹ ִ FRUTAS DEL DIABLO (Comandos) ✅ 𓈒𓏸
`;

      const categoryArg = args[0]?.toLowerCase();
      const categories = {};

      for (const cmdItem of (commands || [])) {
        const category = cmdItem.category || 'otros';
        if (!categories[category]) categories[category] = [];
        categories[category].push(cmdItem);
      }

      if (categoryArg && !categories[categoryArg]) {
        return msg.reply(
          `《✤》 La categoría *${categoryArg}* no fue encontrada.`
        );
      }

      for (const [category, cmds] of Object.entries(categories)) {
        if (categoryArg && category.toLowerCase() !== categoryArg) continue;
        const catName = category.charAt(0).toUpperCase() + category.slice(1);

        menu += `\n✐ ֹ ִ 🍬 𓏧𓏧𓏧 𓏧𓏧𓏧 𓏧𓏧𓏧 ✐ ֹ ִ
‧₊ ᵎᵎ 🏴☠️ ֹ ִ ${catName} 𓈒𓏸\n`;

        cmds.forEach((cmd) => {
          const cmdAliases = cmd.alias || cmd.aliases || cmd.command || [];
          const aliases = Array.isArray(cmdAliases) 
            ? cmdAliases.map((a) => {
                const aliasClean = String(a)
                  .split(/[\/#!+.\-]+/)
                  .pop()
                  .toLowerCase()
                return `${prefix}${aliasClean}`
              }).join(' › ')
            : String(cmdAliases);

          menu += `✐ ${aliases} ${cmd.uso ? `— ${cmd.uso}` : ''}\n`;
          menu += `  ✺ ${cmd.desc || 'Sin descripción'}\n`;
        });
      }

      menu += `\n✐ ֹ ִ 🍭 𓏧𓏧𓏧 🍬 𓏧𓏧𓏧𓏧 ✐ ֹ ִ

ε´｡•᎑•っ ¡Disfruten la estancia, nakamas! Usen los comandos con moderación.

> Gomu Gomu no... ¡${botname2}! Desarrollado por Luffy ૮(˶ᵔᵕᵔ˶)ა
> 〜 El Rey de los Piratas no se rinde jamás. 🏴☠️`;

      const contextBase = {
        mentionedJid: null,
        isForwarded: false
      };

      // ── PROTECCIÓN PERMANENTE: si la imagen falla, envía solo el texto ──
      try {
        await sock.sendMessage(
          msg.chat,
          { image: { url: banner }, caption: menu.trim(), contextInfo: contextBase },
          { quoted: msg }
        );
      } catch (imgErr) {
        // Si la imagen no carga, manda el menú en texto para que nunca falle
        await sock.sendMessage(
          msg.chat,
          { text: menu.trim(), contextInfo: contextBase },
          { quoted: msg }
        );
      }
    } catch (e) {
      console.error('🔴 ERROR EN EL MENÚ:', e);
      const errorMsg = typeof msgglobal !== 'undefined' ? msgglobal : `✿⸝꙳.˖ Ocurrió un error al generar el menú. Revisa la consola del bot.`;
      await msg.reply(errorMsg);
    }
  },
};

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  return [dias && `${dias}d`, `${horas % 24}h`, `${minutos % 60}m`, `${segundos % 60}s`]
    .filter(Boolean)
    .join(' ');
}