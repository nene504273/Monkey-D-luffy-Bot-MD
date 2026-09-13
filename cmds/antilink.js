import db from '#db';
const linkRegex = /(https?:\/\/)?(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|whatsapp\.com\/channel\/[0-9A-Za-z]{20,24})/i;

export async function before({ msg, sock, groupMetadata, participants, isAdmins, isBotAdmins }) {
  if (!msg.isGroup || !msg.text) return;
  if (msg.isBot) return;
  if (!groupMetadata) return;
  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const chat = db.getChat(msg.chat) || {};
  const settings = db.getSettings(botId) || {};
  const isSelf = (settings.self ?? false) || (chat.isMute ?? false);
  if (isSelf) return;
  const primaryBotId = chat?.primaryBot;
  const isPrimary = !primaryBotId || primaryBotId === botId;
  const isGroupLink = linkRegex.test(msg.text);
  const hasAllowedLink = global.links?.channel && msg.text.includes(global.links.channel);
  const command = (msg.command || '').toLowerCase();
  if (hasAllowedLink || !isGroupLink || !chat?.antilinks || isAdmins || !isBotAdmins || !isPrimary) return;
  await sock.sendMessage(msg.chat, { delete: { remoteJid: msg.chat, fromMe: false, id: msg.key.id, participant: msg.key.participant }});
  if (command !== 'invite') {
    const isChannelLink = /whatsapp\.com\/channel\//i.test(msg.text);
    const user = db.getUser(msg.sender);
    const userName = user?.name || 'Usuario';
    await sock.reply(msg.chat, `> ꕥ Se ha eliminado a *${userName}* del grupo por \`Anti-Link\`, no permitimos enlaces de *${isChannelLink ? 'canales' : 'otros grupos'}*.`, null);
    await sock.groupParticipantsUpdate(msg.chat, [msg.sender], 'remove');
  }
}