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

      // ── Estilo único para Luffy ──
      const botNameStyled = '୭౿ㅤׁ 🍃ᮢᩥ  𝖬𝗈𝗇𝗄𝖾𝗒 𝖣. 𝖫𝗎𝖿𝖿y .ᐟ  ֺ';

      // ── Canal ──
      const channelName = '𝖫𝗎𝖿𝖿𝗒';
      const channelId = '120363420846835529@newsletter';

      // 🖼️ Imagen fija (banner)
      const banner = 'https://cdn.dev-ander.xyz/a/y7PO.png';
      const link = (await db.getSettings(botId)).link || '';   // El resto de la info de DB

      const isOficialBot =
        botId === global?.sock ? global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' : '';
      const botType = isOficialBot ? 'Owner' : 'Sub Bot';

      const userr = await db.getUser();
      const users = Object.keys(userr).length || 0;

      const time = sock.uptime
        ? formatearMs(Date.now() - sock.uptime)
        : 'Desconocido';
      const device = getDevice(msg.key.id);

      // ── Menú con estilo Luffy ──
      let menu = `\n≿────── ≪🍖≫ ──────≾\n`;
      menu += `¡Hola ${msg.pushName}! Soy *${botNameStyled}*\n`;
      menu += `⏣ *Desarrollador:* Diego\n`;
      menu += `⏣ *Tipo:* ${botType}\n`;
      menu += `⏣ *Dispositivo:* ${device}\n`;
      menu += `⏣ *Hora:* ${tiempo}, ${tiempo2}\n`;
      menu += `⏣ *Usuarios:* ${users.toLocaleString()}\n`;
      menu += `⏣ *Activo:* ${time}\n`;
      menu += `⏣ *Canal:* ${channelName}\n`;
      menu += `≿────── ≪🍖≫ ──────≾\n\n`;

      const categoryArg = args[0]?.toLowerCase();
      const categories = {};

      for (const command of commands) {
        const category = command.category || 'otros';
        if (!categories[category]) categories[category] = [];
        categories[category].push(command);
      }

      if (categoryArg && !categories[categoryArg]) {
        return msg.reply(`《✤》 La categoría *${categoryArg}* no fue encontrada.`);
      }

      for (const [category, cmds] of Object.entries(categories)) {
        if (categoryArg && category.toLowerCase() !== categoryArg) continue;
        const catName = category.charAt(0).toUpperCase() + category.slice(1);
        menu += `╭─◂ ${catName} ▸───────────\n`;
        cmds.forEach((cmd) => {
          const aliases = cmd.alias
            .map((a) => `${prefix}${a.split(/[\/#!+.\-]+/).pop().toLowerCase()}`)
            .join(' › ');
          menu += `│ ✦ ${aliases} ${cmd.uso ? `+ ${cmd.uso}` : ''}\n`;
          menu += `│   ↳ ${cmd.desc}\n`;
        });
        menu += `╰────────────────────\n\n`;
      }

      menu += `≿────── ≪🍖≫ ──────≾\n*${botNameStyled}* – ¡Rumbo al One Piece!`;

      // ── Contexto para que aparezca como reenviado del canal ──
      const contextBase = {
        mentionedJid: null,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelId,
          newsletterName: channelName,
        },
      };

      // Enviamos la imagen siempre como vista previa (no es video)
      await sock.sendMessage(
        msg.chat,
        {
          text: menu.trim(),
          linkPreview: link
            ? await prepareWAMessageMedia(
                { image: { url: banner } },
                { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
              ).then(({ imageMessage }) => ({
                'canonical-url': link,
                'matched-text': link,
                title: botNameStyled,
                description: `${botNameStyled} – Bot de WhatsApp`,
                jpegThumbnail: imageMessage?.jpegThumbnail
                  ? Buffer.from(imageMessage.jpegThumbnail)
                  : undefined,
                highQualityThumbnail: imageMessage || undefined,
              }))
            : undefined,
          contextInfo: contextBase,
        },
        { quoted: msg }
      );
    } catch (e) {
      await msg.reply(msgglobal);
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