import db from "#db";
import { getDevice, getChannelMetadata } from 'baileys'; // Importamos getChannelMetadata para traer info del canal
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

      // --- DATOS DEL CANAL SOLICITADOS ---
      const channelId = "120363420846835529@newsletter";
      const channelName = "© powered by Luffy";
      // ------------------------------------

      let menuText = `> *¡ʜᴏʟᴀ!* ${msg.pushName}, como está tu día?, mucho gusto mi nombre es *${botname2}* ʚ♡ɞ(ू•ᴗ•ू❁)*

   ⌒᷼⏜  ۪  ꨪᰰ࿙  ࣭࣪⢏࣭۟⢢࣭ׄ᎐֟᎐ׄ⡔۟⡹ׄ  ࿚ᰰ  ۪  ͡⏜᷼⌒

: ̗̀〄 *ᴅᴇᴠᴇʟᴏᴇʀ ::* ${
        owner
          ? !isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))
            ? `${own.name || owner}` 
            : owner
          : 'Oculto por privacidad'
      }
: ̗̀ꕥ *ᴛɪᴘᴏ ::* ${botType}
: ̗̀☄︎ *sɪsᴛᴍᴀ/ᴏᴘʀ ::* ${device}

: ̗̀❖ *ᴛᴍᴇ ::* ${tiempo}, ${tiempo2}
: ̗̀❖ *ᴜsᴇʀs ::* ${users.toLocaleString()}
: ̗̀❖ *ᴍɪ ᴛɪᴇᴍᴘᴏ ::* ${time}
: ̗̀❖ *ᴜʀʟ ::* ${link}

   ⌒࣪᷼⏜͡  ۪  ꨪᰰ࿙  ࣭࣪⢏۟⢢ׄ᎐֟᎐ׄ⡔۟⡹ׄ  ࿚ᰰ࿙  ۪  ⏜ׄ⌒

｡ﾟ☁︎ ｡° *ᴄᴏᴍ꯭ᴀ꯭ɴᴅᴏs* ｡˚₊ 𓂃\n`;

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
         menuText += `\n╭╼ׅ፝֟╌ֵ╾͜─ํ͜┈ְ ࣭࣪⢏࣭⢢࣭᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ׅ፝֟╾\n│❀ *${catName} ☆(ﾉ◕ヮ)ﾉ*\n├ׅ╴ׂ╶ׅ╌ׂ─ 〫─ׂ┄╴ׂ╌╶╼.  ׅ╴ׂ╶ׅ╌ׂ\n`;

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

          menuText += `│✿ ${aliases} ${cmd.uso ? `+ ${cmd.uso}` : ''}\n`
          menuText += `> ✺ ${cmd.desc || 'Sin descripción'}\n`
        })
        menuText += `╰╼ׅ፝֟╌ֵ╾─ํ͜┈ְ ࣭࣭࣪ࣧ⢢࣭ׄ᎐፝֟͟͝᎐࣭ׄ⡔࣭ࣧ⡹࣭ׄ ְ┈ํ͜─͜╼ꨪᰰ╾࣮╌╼ࣶׅ፝֟╯ \n`
      }

      // --- PIE DE PÁGINA MODIFICADO SEGÚN TU PEDIDO ---
      menuText += `\n> *${channelName}*`; 
      // --------------------------------------------------

      const menuImageURL = "https://d.uguu.se/QabpZFiU.jpeg";

      // 1. Intentar obtener metadatos del canal para mostrarlo correctamente
      let channelInfo = null;
      try {
        channelInfo = await getChannelMetadata(sock, channelId);
      } catch (e) {
        console.log("No se pudo cargar metadata del canal, enviando solo texto.");
      }

      // 2. Enviar aviso del Canal (Si se cargó bien la metadata)
      if (channelInfo) {
        await sock.sendMessage(msg.chat, {
          text: `📢 Únete a nuestro canal oficial:\n\n${channelInfo.name}\n${channelInfo.description || ''}`,
          contextInfo: {
            externalAdReply: {
              title: channelInfo.name,
              body: "Actualizaciones y noticias",
              thumbnailUrl: channelInfo.icon || "",
              sourceUrl: `https://whatsapp.com/channel/${channelId.split('@')[0]}`,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: msg });
        
        // Pequeña pausa opcional para que no parezca spam inmediato
        await new Promise(r => setTimeout(r, 500)); 
      } else {
        // Fallback si falla la metadata: Solo mencionar el canal en texto simple
        await sock.sendMessage(msg.chat, {
          text: `📢 Sigue el canal: https://whatsapp.com/channel/${channelId.split('@')[0]} (${channelName})`
        }, { quoted: msg });
      }

      // 3. Enviar el MENÚ PRINCIPAL con la imagen
      await sock.sendMessage(
        msg.chat,
        { 
          image: { url: menuImageURL },
          caption: menuText.trim(),
          mentions: [],
          contextInfo: {
             externalAdReply: {
               title: botname2 || "Menu Principal",
               body: "Comandos disponibles",
               thumbnailUrl: menuImageURL,
               sourceUrl: link || "",
               showAdAttribution: false,
               renderLargerThumbnail: true
             }
          }
        },
        { quoted: msg }
      );

    } catch (e) {
      console.error('🔴 ERROR EN EL MENÚ:', e);
      const errorMsg = typeof msgglobal !== 'undefined' ? msgglobal : `✿⸝꙳. Ocurrió un error al generar el menú. Revisa la consola del bot.`;
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