import fetch from 'node-fetch';
import { getDevice, prepareWAMessageMedia } from 'baileys';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';
import { bodyMenu, menuObject } from '#system/commands';
import db from '#db';

function normalize(text = '') {
  text = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return text.endsWith('s') ? text.slice(0, -1) : text;
}

export default {
  command: ['allmenu', 'help', 'menu', 'ayuda'],
  category: 'main',
  description: 'Ver el menú de comandos.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    try {
      const now = new Date();
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Caracas' }));
      const tiempo = colombianTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, '');
      const tempo = moment.tz('America/Caracas').format('hh:mm A');
      const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = db.getSettings(botId) || {};
      const botname = botSettings.botname || '';
      const namebot = botSettings.namebot || '';
      const banner = botSettings.banner || '';
      const owner = botSettings.owner || '';
      const canalId = botSettings.newsletter_id || '';
      const canalName = botSettings.nameid || '';
      const prefix = botSettings.prefix;
      const link = botSettings.link || global.links?.api?.channel || '';
      const isOficialBot = botId === ((global.sock?.user?.id?.split(':')[0] ?? null) && ((global.sock?.user?.id?.split(':')[0] ?? null) && (global.sock.user.id.split(':')[0] + '@s.whatsapp.net')));
    const botType = isOficialBot ? 'Principal/Owner' : 'Sub Bot';
      const users = db.getUser();
      const usersCount = users?.length || 0;
      const device = getDevice(msg.key.id);
      const userGlobal = db.getUser(msg.sender);
      const sender = userGlobal?.name || msg.pushName || 'Usuario';
      const time = sock.uptime ? formatearMs(Date.now() - sock.uptime) : "Desconocido";
      const alias = {
        anime: ['anime', 'reacciones'],
        downloads: ['downloads', 'descargas'],
        economia: ['economia', 'economy', 'eco'],
        gacha: ['gacha', 'rpg'],
        grupo: ['grupo', 'group'],
        nsfw: ['nsfw', '+18'],
        profile: ['profile', 'perfil'],
        sockets: ['sockets', 'bots'],
        stickers: ['stickers', 'sticker'],
        utils: ['utils', 'utilidades', 'herramientas']
      };
      const input = normalize(args[0] || '');
      const cat = Object.keys(alias).find(k => alias[k].map(normalize).includes(input));
      const category = `${cat ? ` para \`${cat}\`` : '. *(˶ᵔ ᵕ ᵔ˶)*'}`;
      if (args[0] && !cat) {
        return msg.reply(`《✧》 La categoria *${args[0]}* no existe, las categorias disponibles son: *${Object.keys(alias).join(', ')}*.\n> Para ver la lista completa escribe *${usedPrefix}menu*\n> Para ver los comandos de una categoría escribe *${usedPrefix}menu [categoría]*\n> Ejemplo: *${usedPrefix}menu anime*`);
      }
      const sections = menuObject;
      const content = cat ? String(sections[cat] || '') : Object.values(sections).map(s => String(s || '')).join('\n\n');
      let menu = bodyMenu ? String(bodyMenu || '') + '\n\n' + content : content;
      const replacements = {
        $owner: owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? (db.getUser(owner))?.name || owner.split('@')[0] : owner) : 'Oculto por privacidad',
        $botType: botType,
        $device: device,
        $tiempo: tiempo,
        $tempo: tempo,
        $users: usersCount.toLocaleString(),
        $link: link,
        $cat: category,
        $sender: sender,
        $botname: botname,
        $namebot: namebot,
        $prefix: usedPrefix,
        $uptime: time
      };
      for (const [key, value] of Object.entries(replacements)) {
        menu = menu.replace(new RegExp(`\\${key}`, 'g'), value);
      }
      await sock.sendMessage(msg.chat, banner.includes('.mp4') || banner.includes('.webm') ? { video: { url: banner }, gifPlayback: true, caption: menu.trim(), contextInfo: { mentionedJid: [owner, msg.sender], isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: '0', newsletterName: canalName }}} : { text: menu.trim(), linkPreview: link && banner ? (await prepareWAMessageMedia({ image: { url: banner }}, { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }).then(({ imageMessage }) => ({ 'canonical-url': link, 'matched-text': link, title: botname, description: `${namebot}, mᥲძᥱ ᥕі𝗍һ ᑲᥡ ⁱᵃᵐ|𝔇ĕ𝐬†𝓻⊙γ𒆜`, jpegThumbnail: imageMessage?.jpegThumbnail ? Buffer.from(imageMessage.jpegThumbnail) : undefined, highQualityThumbnail: imageMessage || undefined }))) : undefined, contextInfo: { mentionedJid: [owner, msg.sender], isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: canalId, serverMessageId: '0', newsletterName: canalName }}}, { quoted: msg });
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  return [dias && `${dias}d`, `${horas % 24}h`, `${minutos % 60}m`, `${segundos % 60}s`].filter(Boolean).join(" ");
}