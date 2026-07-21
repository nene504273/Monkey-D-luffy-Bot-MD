import db from "#db";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const bannerImage = 'https://h.uguu.se/LVWkJOez.jpeg';

export default {
  command: ['bots', 'sockets'],
  category: 'socket',
  run: async ({ msg, sock }) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const from = msg.key.remoteJid;

    const groupMetadata = msg.isGroup
      ? await sock.groupMetadata(from).catch(() => {})
      : '';
    const groupParticipants =
      groupMetadata?.participants?.map(
        (p) => p.phoneNumber || p.jid || p.lid || p.id
      ) || [];

    const mainBotJid = global?.sock
      ? global?.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net'
      : '';
    const isMainBotInGroup = groupParticipants.includes(mainBotJid);

    const basePath = path.join(dirname, '../../Sessions');
    const folders = { Subs: 'Subs' };

    const getBotsFromFolder = (folderName) => {
      const folderPath = path.join(basePath, folderName);
      if (!fs.existsSync(folderPath)) return [];
      return fs
        .readdirSync(folderPath)
        .filter((dir) => {
          const credsPath = path.join(folderPath, dir, 'creds.json');
          return fs.existsSync(credsPath);
        })
        .map((id) => id.replace(/\D/g, ''));
    };

    const subs = getBotsFromFolder(folders.Subs);

    const categorizedBots = { Capitán: [], Nakamas: [] };
    const mentionedJid = [];

    const formatBot = async (number, label) => {
      const jid = number + '@s.whatsapp.net';
      if (!groupParticipants.includes(jid)) return null;
      mentionedJid.push(jid);
      const data = await db.getSettings(jid);
      const name = data?.namebot2 || 'Tripulante';
      return `- [${label} *${name}*] › @${number}`;
    };

    // Capitán (Owner)
    if (db.getSettings(mainBotJid)) {
      const name = (await db.getSettings(mainBotJid))?.namebot2 || 'Luffy';
      if (isMainBotInGroup) {
        mentionedJid.push(mainBotJid);
        categorizedBots.Capitán.push(
          `- [👒 *Capitán* ${name}] › @${mainBotJid.split('@')[0]}`
        );
      }
    }

    // Nakamas (Subs)
    for (const num of subs) {
      const line = await formatBot(num, `🍖 Nakama`);
      if (line) categorizedBots.Nakamas.push(line);
    }

    const totalBots = 1 + subs.length;
    const totalInGroup =
      categorizedBots.Capitán.length + categorizedBots.Nakamas.length;

    let mensaje = `🏴‍☠️ *¡TRIPULACIÓN DE LUFFY!* ⚓\n\n`;
    mensaje += `⚓ Capitán › *1*\n`;
    mensaje += `🍖 Nakamas › *${subs.length}*\n\n`;
    mensaje += `💀 *Piratas en el grupo ›* ${totalInGroup}\n`;

    if (categorizedBots.Capitán.length > 0) {
      mensaje += categorizedBots.Capitán.join('\n') + '\n';
    }
    if (categorizedBots.Nakamas.length > 0) {
      mensaje += categorizedBots.Nakamas.join('\n') + '\n';
    }

    mensaje += `\n_— “¡No importa cuántos barcos tengas, lo que importa es la tripulación!”_\n`;
    mensaje += `_Monkey D. Luffy_`;

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