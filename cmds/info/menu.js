import db from "#db";
import { getDevice } from 'baileys';
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

      const botId = sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' || '';

      // 1. Evitar crash si getSettings no retorna nada
      const botSettings = (await db.getSettings(botId)) || {}; 
      const botname2 = botSettings.namebot2 || botSettings.namebot || 'Bot';
      const owner = botSettings.owner || '';
      const link = botSettings.link || '';

      const officialJid = global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net';
      const isOficialBot = botId === officialJid;
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
      // Coloca aquí una URL fija/permanente (ej. Imgur, Catbox, Telegra.ph)
      const bannerImgUrl = 'https://i.imgur.com/8Q0yX3W.jpg';

      let menu = `> *¡ʜᴏʟᴀ!* ${msg.pushName || 'Usuario'}, ¿cómo está tu día? Mucho gusto, mi nombre es *${botname2}* ʚ♡⃛ɞ(ू•ᴗ•ू❁)*\n\n`;
      menu += `   ⌒࣪᷼⏜͡  ۪  ࿚ꨪᰰ࿙  ࣭࣪⢏࣭۟⢢࣭ׄ᎐፝֟᎐࣭ׄ⡔࣭۟⡹࣭ׄ  ࿚ꨪᰰ࿙  ۪  ͡⏜ׄ᷼⌒\n\n`;
      menu += `: ̗̀〄 *ᴅᴇᴠᴇʟᴏᴘᴇʀ ::* ${
        owner
          ? !isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))
            ? `${own.name || owner}`
            : owner
          : 'Oculto por privacidad'
      }\n`;
      menu += `: ̗̀ꕥ *ᴛɪᴘᴏ ::* ${botType}\n`;
      menu += `: ̗̀☄︎ *sɪsᴛᴇᴍᴀ/ᴏᴘʀ ::* ${device}\n\n`;
      menu += `: ̗̀❖ *ᴛɪᴍᴇ ::* ${tiempo}, ${tiempo2}\n`;
      menu += `: ̗̀❖ *ᴜsᴇʀs ::* ${users.toLocaleString()}\n`;
      menu += `: ̗̀❖ *ᴍɪ ᴛɪᴇᴍᴘᴏ ::* ${time}\n`;
      menu += `: ̗̀❖ *ᴜʀʟ ::* ${link}\n\n`;
      menu += `   ⌒࣪᷼⏜͡  ۪  ࿚ꨪᰰ࿙  ࣭࣪⢏࣭۟⢢࣭ׄ᎐፝֟᎐࣭ׄ⡔࣭۟⡹࣭ׄ  ࿚ꨪᰰ࿙  ۪  ͡⏜ׄ᷼⌒\n\n`;
      menu += `⋆｡ﾟ☁︎ ｡° *ᴄᴏᴍ꯭ᴀ꯭ɴᴅᴏs* ﾟ｡˚₊ 𓂃\n`;

      const categoryArg = args[0]?.toLowerCase();
      const categories = {};

      // 4. Asegurar que commands sea un array iterable
      for (const cmdItem of (commands || [])) {
        const category = cmdItem.category || 'otros';
        if (!categories[category]) categories[category] = [];
        categories[category].push(cmdItem);
      }

      if (categoryArg && !categories[categoryArg]) {
        return msg.reply(`《✤》 La categoría *${categoryArg}* no fue encontrada.`);
      }

      for (const [category, cmds] of Object.entries(categories)) {
        if (categoryArg && category.toLowerCase() !== categoryArg) continue;
        const catName = category.charAt(0).toUpperCase() + category.slice(1);
        menu += `\n╭╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭࣭ׄ࣪ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╮\n│❀ *${catName} ☆(ﾉ◕ヮ◕)ﾉ*\n├╾ׅ╴ׂ╌╶ׅ╌ׂ─ 〫─ׂ┄ׅ╴ׂ╌ׅ╶╼.  ╾ׅ╴ׂ╌╶ׅ╌ׂ\n`;

        cmds.forEach((cmd) => {
          const cmdAliases = cmd.alias || cmd.aliases || cmd.command || [];

          const aliases = Array.isArray(cmdAliases) 
            ? cmdAliases.map((a) => {
                const aliasClean = String(a).split(/[\/#!+.\-]+/).pop().toLowerCase();
                return `${prefix}${aliasClean}`;
              }).join(' › ')
            : String(cmdAliases);

          menu += `│✿ ${aliases} ${cmd.uso ? `+ ${cmd.uso}` : ''}\n`;
          menu += `> ✺ ${cmd.desc || 'Sin descripción'}\n`;
        });
        menu += `╰╼ׅࣶ፝֟╾╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╾╯ \n`;
      }

      menu += `\n> *${botname2} desarrollado por Luffy* ૮(˶ᵔᵕᵔ˶)ა`;

      // ══════════ OBTENER IMAGEN DE FORMA SEGURA ══════════
      let imageBuffer = null;
      try {
        const response = await axios.get(bannerImgUrl, { 
          responseType: 'arraybuffer', 
          timeout: 5000 
        });
        imageBuffer = Buffer.from(response.data);
      } catch (imgErr) {
        console.warn('⚠️ No se pudo descargar la imagen del menú, enviando solo texto:', imgErr.message);
      }

      // ══════════ ENVÍO DE MENSAJE ══════════
      if (imageBuffer) {
        await sock.sendMessage(
          msg.chat,
          {
            image: imageBuffer,
            caption: menu.trim()
          },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          msg.chat,
          { text: menu.trim() },
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
