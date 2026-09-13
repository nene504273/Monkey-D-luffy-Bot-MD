import fs from 'fs';
import path from 'path';
import db from '#db';

const sessionsPath = path.resolve(process.cwd(), 'Sessions');
const subsPath = path.join(sessionsPath, 'Subs');
const cleanNumber = (value = '') => String(value).split('@')[0].split(':')[0].replace(/\D/g, '');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getBotsFromFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return [];
  return fs.readdirSync(folderPath, { withFileTypes: true })
    .filter((dir) => dir.isDirectory() && fs.existsSync(path.join(folderPath, dir.name, 'creds.json')))
    .map((dir) => cleanNumber(dir.name))
    .filter(Boolean);
}

function getActiveBotNumbers() {
  const activeJids = new Set();
  if (!Array.isArray(global.conns)) return activeJids;
  for (const conn of global.conns) {
    const number = cleanNumber(conn?.user?.id || conn?.userId || '');
    if (number) activeJids.add(number);
  }
  return activeJids;
}

export default {
  command: ['bots', 'sockets'],
  category: 'socket',
  description: 'Ver el número de bots activos.',
  run: async ({ msg, sock, args }) => {
    ensureDir(subsPath);
    const from = msg.key.remoteJid;
    const isAll = args[0]?.toLowerCase() === 'all';
    const groupMetadata = msg.isGroup ? await sock.groupMetadata(from).catch(() => null) : null;
    const groupParticipants = (groupMetadata?.participants || []).map((p) => p.id);
    const mainNumber = cleanNumber(global.sock?.user?.id || sock?.user?.id || '');
    const mainBotJid = mainNumber ? `${mainNumber}@s.whatsapp.net` : '';
    const activeBots = getActiveBotNumbers();
    const folderSubs = getBotsFromFolder(subsPath);
    const subs = [...new Set([...folderSubs.filter((num) => activeBots.has(num)), ...[...activeBots].filter((num) => num !== mainNumber)])];
    const categorizedBots = { Owner: [], Sub: [] };
    const mentionedJid = [];
    const formatBot = async (number, label) => {
      const jid = `${number}@s.whatsapp.net`;
      if (!isAll && !groupParticipants.includes(jid)) return null;
      mentionedJid.push(jid);
      const data = db.getSettings(jid);
      const name = data?.namebot || 'Bot';
      return `- [${label} *${name}*] › @${number}`;
    };
    const isMainActive = Boolean(mainNumber);
    if (isMainActive && mainBotJid && (isAll || groupParticipants.includes(mainBotJid))) {
      const data = db.getSettings(mainBotJid);
      const name = data?.namebot || 'Bot';
      mentionedJid.push(mainBotJid);
      categorizedBots.Owner.push(`- [Owner *${name}*] › @${mainNumber}`);
    }
    for (const num of subs) {
      const line = await formatBot(num, 'Sub');
      if (line) categorizedBots.Sub.push(line);
    }
    const totalBots = (isMainActive ? 1 : 0) + subs.length;
    const totalShown = categorizedBots.Owner.length + categorizedBots.Sub.length;
    let message = `ꕥ Números de Sockets activos *(${totalBots})*\n\n`;
    message += `ੈ❖‧₊˚ Principales › *${isMainActive ? 1 : 0}*\n`;
    message += `ੈ✿‧₊˚ Subs › *${subs.length}*\n\n`;
    message += isAll ? `➭ *Lista completa ›* ${totalShown}\n` : `➭ *Bots en el grupo ›* ${totalShown}\n`;
    for (const category of ['Owner', 'Sub']) {
      if (categorizedBots[category].length) message += categorizedBots[category].join('\n') + '\n';
    }
    await sock.sendMessage(msg.chat, { text: message, mentions: mentionedJid }, { quoted: msg });
  },
};
