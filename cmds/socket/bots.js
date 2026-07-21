import db from "#db";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const bannerImage = 'https://h.uguu.se/LVWkJOez.jpeg'; // Imagen del Jolly Roger

export default {
  command: ['bots', 'sockets'],
  category: 'socket',
  run: async ({ msg, sock }) => {
    // ─── Datos del barco actual ───
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const from = msg.key.remoteJid;

    // Obtener participantes si es grupo
    const groupMetadata = msg.isGroup
      ? await sock.groupMetadata(from).catch(() => {})
      : '';
    const groupParticipants =
      groupMetadata?.participants?.map(p => p.phoneNumber || p.jid || p.lid || p.id) || [];

    // Identificar al Capitán (bot principal)
    const mainBotJid = global?.sock
      ? global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net'
      : '';
    const isMainBotInGroup = groupParticipants.includes(mainBotJid);

    // ─── Cargar Sub‑botes (Sessions/Subs) ───
    const basePath = path.join(dirname, '../../Sessions');

    const getBotsFromFolder = (folderName) => {
      const folderPath = path.join(basePath, folderName);
      if (!fs.existsSync(folderPath)) return [];
      return fs
        .readdirSync(folderPath)
        .filter(dir => fs.existsSync(path.join(folderPath, dir, 'creds.json')))
        .map(id => id.replace(/\D/g, ''));
    };

    const subs = getBotsFromFolder('Subs');

    // ─── Agrupar tripulación ───
    const categorizedBots = { Capitán: [], Nakamas: [] };
    const mentionedJid = [];

    // Función para formatear un Nakama
    const formatNakama = async (number) => {
      const jid = number + '@s.whatsapp.net';
      if (!groupParticipants.includes(jid)) return null;

      mentionedJid.push(jid);
      const data = await db.getSettings(jid);
      let name = data?.namebot2 || 'Nakama';

      // ¡Ningún Alya a bordo!
      if (name.toLowerCase().includes('alya')) name = 'Nakama Desconocido';

      return `- [🍖 Nakama *${name}*] › @${number}`;
    };

    // ─── Capitán (siempre Luffy) ───
    if (isMainBotInGroup) {
      mentionedJid.push(mainBotJid);
      categorizedBots.Capitán.push(
        `- [👒 *Capitán* Luffy] › @${mainBotJid.split('@')[0]}`
      );
    }

    // ─── Reclutar Nakamas ───
    for (const num of subs) {
      const line = await formatNakama(num);
      if (line) categorizedBots.Nakamas.push(line);
    }

    const totalSubs = subs.length;
    const totalEnGrupo = categorizedBots.Capitán.length + categorizedBots.Nakamas.length;

    // ─── Armar el mensaje pirata ───
    let mensaje = `🏴‍☠️ *¡TRIPULACIÓN DE LUFFY!* ⚓\n\n`;
    mensaje += `⚓ Capitán › *1*\n`;
    mensaje += `🍖 Nakamas › *${totalSubs}*\n\n`;
    mensaje += `💀 *Piratas en el grupo ›* ${totalEnGrupo}\n`;

    if (categorizedBots.Capitán.length) mensaje += categorizedBots.Capitán.join('\n') + '\n';
    if (categorizedBots.Nakamas.length) mensaje += categorizedBots.Nakamas.join('\n') + '\n';

    mensaje += `\n_— “¡No importa cuántos barcos tengas, lo que importa es la tripulación!”_\n`;
    mensaje += `_Monkey D. Luffy_`;

    // ─── Enviar con el Jolly Roger ───
    await sock.sendMessage(
      msg.chat,
      {
        image: { url: bannerImage },
        caption: mensaje,
        contextInfo: { mentionedJid }
      },
      { quoted: msg }
    );
  }
};