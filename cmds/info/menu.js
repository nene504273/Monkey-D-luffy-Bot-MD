import db from "#db"
import { getDevice, prepareWAMessageMedia } from 'baileys';
import fs from 'fs';
import fetch from 'node-fetch';
import axios from 'axios';
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

      // 1. Evitar crash si getSettings no retorna nada
      const botSettings = (await db.getSettings(botId)) || {}; 
      const botname = botSettings.namebot || '';
      const botname2 = botSettings.namebot2 || '';
      const owner = botSettings.owner || '';
      const link = botSettings.link || '';

      const isOficialBot =
        botId === global?.sock ? global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' : ''
      const botType = isOficialBot ? 'Owner' : 'Sub Bot';

      // 2. Evitar crash si getUser() retorna null/undefined
      const userr = (await db.getUser()) || {}; 
      const users = Object.keys(userr).length || 0;

      const time = sock.uptime
        ? formatearMs(Date.now() - sock.uptime)
        : 'Desconocido';
      const device = getDevice(msg.key.id);

      // 3. Evitar crash si el owner no está en la DB
      const own = (await db.getUser(owner)) || {}; 

      // ══════════ IMAGEN SUPERIOR (BANNER) ══════════
      const bannerImg = 'https://n.uguu.se/ZCHBYdRG.jpeg';

      let menu = `> *¡ʜᴏʟᴀ!* ${msg.pushName}, como está tu día?, mucho gusto mi nombre es *${botname2}* ʚ♡⃛ɞ(ू•ᴗ•ू❁)*

   ⌒࣪᷼⏜͡  ۪  ࿚ꨪᰰ࿙  ࣭࣪⢏࣭۟⢢࣭ׄ᎐፝֟᎐࣭ׄ⡔࣭۟⡹࣭ׄ  ࿚ꨪᰰ࿙  ۪  ͡⏜ׄ᷼⌒

: ̗̀〄 *ᴅᴇᴠᴇʟᴏᴘᴇʀ ::* ${
        owner
          ? !isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))
            ? `${own.name || owner}`
            : owner
          : 'Oculto por privacidad'
      }
: ̗̀ꕥ *ᴛɪᴘᴏ ::* ${botType}
: ̗̀☄︎ *sɪsᴛᴇᴍᴀ/ᴏᴘʀ ::* ${device}

: ̗̀❖ *ᴛɪᴍᴇ ::* ${tiempo}, ${tiempo2}
: ̗̀❖ *ᴜsᴇʀs ::* ${users.toLocaleString()}
: ̗̀❖ *ᴍɪ ᴛɪᴇᴍᴘᴏ ::* ${time}
: ̗̀❖ *ᴜʀʟ ::* ${link}

   ⌒࣪᷼⏜͡  ۪  ࿚ꨪᰰ࿙  ࣭࣪⢏࣭۟⢢࣭ׄ᎐፝֟᎐࣭ׄ⡔࣭۟⡹࣭ׄ  ࿚ꨪᰰ࿙  ۪  ͡⏜ׄ᷼⌒

⋆｡ﾟ☁︎ ｡° *ᴄᴏᴍ꯭ᴀ꯭ɴᴅᴏs* ﾟ｡˚₊ 𓂃\n`;

      const categoryArg = args[0]?.toLowerCase();
      const categories = {};

      // 4. Asegurar que commands sea un array iterable
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
         menu += `\n╭╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭࣭ׄ࣪ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╮\n│❀ *${catName} ☆(ﾉ◕ヮ◕)ﾉ*\n├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ╴ׂ╌ׅ╶╼.  ╾ׅ╴ׂ╌╶ׅ╌ׂ\n`;

        cmds.forEach((cmd) => {
          // 5. ARREGLO CRÍTICO: Soporte para alias, aliases o command
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

          menu += `│✿ ${aliases} ${cmd.uso ? `+ ${cmd.uso}` : ''}\n`
          menu += `> ✺ ${cmd.desc || 'Sin descripción'}\n`
        })
        menu += `╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ \n`
      }

      menu += `\n> *${botname2} desarrollado por Luffy* ૮(˶ᵔᵕᵔ˶)ა`;

      const contextBase = {
        mentionedJid: null,
        isForwarded: false
      };

      // ══════════ BOTÓN DEL CANAL (ABAJO) ══════════
      const canalUrl = 'https://whatsapp.com/channel/120363420846835529';
      const canalNombre = 'Monkey D. Luffy - MD Bot ⚡';

      const buttons = [
        {
          buttonId: canalUrl,
          buttonText: { displayText: `📢 ${canalNombre}` },
          type: 1,
          url: canalUrl  // <-- el botón lleva directo al canal
        }
      ];

      // ══════════ ENVÍO CON IMAGEN + BOTÓN ══════════
      await sock.sendMessage(
        msg.chat,
        {
          image: { url: bannerImg },
          caption: menu.trim(),
          buttons,
          viewOnce: true,
          contextInfo: contextBase
        },
        { quoted: msg }
      );

    } catch (e) {
      // 7. ESTO ES OBLIGATORIO PARA DEPURAR: Imprime el error real en tu consola/terminal
      console.error('🔴 ERROR EN EL MENÚ:', e);

      // Si msgglobal no existe, envía un mensaje de respaldo para que no crashee el catch
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