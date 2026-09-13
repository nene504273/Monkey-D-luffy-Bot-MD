import ws from 'ws';
import fs from 'fs';
import db from '#db';

export default {
  command: ['gp', 'groupinfo'],
  category: 'group',
  description: 'Ver la información del grupo.',
  run: async ({ msg, sock, usedPrefix, command, groupMetadata, participants }) => {
    const groupName = groupMetadata?.subject;
    const groupBanner = await sock.profilePictureUrl(msg.chat, 'image').catch(() => 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg');
    const groupCreator = groupMetadata?.owner ? '@' + groupMetadata.owner.split('@')[0] : 'Desconocido';
    const groupAdmins = participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || [];
    const totalParticipants = participants.length;
    const chat = db.getChat(msg.chat) || {};
    const allChatUsers = db.getChatUser(msg.chat);
    const usersMap = {};
    for (const user of allChatUsers) {
      usersMap[user.user_id] = user;
    }
    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net";
    const botSettings = db.getSettings(botId) || {};
    const botname = botSettings.botname;
    const monedas = botSettings.currency;
    let totalCoins = 0;
    let registeredUsersInGroup = 0;
    const resolvedParticipants = participants;
    for (const participant of resolvedParticipants) {
      const fullId = participant.id;
      const user = fullId ? usersMap[fullId] : null;
      if (user) {
        registeredUsersInGroup++;
        totalCoins += Number(user.coins || 0) + Number(user.bank || 0);
      }
    }
    const charactersFilePath = './core/characters.json';
    const data = await fs.promises.readFile(charactersFilePath, 'utf-8');
    const structure = JSON.parse(data);
    const allCharacters = Object.values(structure).flatMap(s => Array.isArray(s.characters) ? s.characters : []);
    const totalCharacters = allCharacters.length;
    let claimedCount = 0;
    for (const user of allChatUsers) {
      if (user.characters && typeof user.characters === 'string') {
        try { user.characters = JSON.parse(user.characters); } catch { user.characters = []; }
      }
      if (Array.isArray(user.characters)) claimedCount += user.characters.length;
    }
    const claimRate = totalCharacters > 0 ? ((claimedCount / totalCharacters) * 100).toFixed(2) : '0.00';
    const rawPrimary = typeof chat.primaryBot === 'string' ? chat.primaryBot : '';
    const botprimary = rawPrimary.endsWith('@s.whatsapp.net') ? `@${rawPrimary.split('@')[0]}` : 'Aleatorio';
    const settings = {
      bot: chat.isBanned ? '✘ Desactivado' : '✓ Activado',
      antilinks: chat.antilinks ? '✓ Activado' : '✘ Desactivado',
      antistatus: chat.antistatus ? '✓ Activado' : '✘ Desactivado',
      welcome: chat.welcome ? '✓ Activado' : '✘ Desactivado',
      goodbye: chat.goodbye ? '✓ Activado' : '✘ Desactivado',
      alerts: chat.alerts ? '✓ Activado' : '✘ Desactivado',
      gacha: chat.gacha ? '✓ Activado' : '✘ Desactivado',
      economy: chat.economy ? '✓ Activado' : '✘ Desactivado',
      nsfw: chat.nsfw ? '✓ Activado' : '✘ Desactivado',
      adminmode: chat.adminonly ? '✓ Activado' : '✘ Desactivado',
      botprimary: botprimary
    };
    try {
      let message = `*「✿」Grupo ◢ ${groupName} ◤*\n\n`;
      message += `➪ *Creador ›* ${groupCreator}\n`;
      message += `❖ Bot Principal › *${settings.botprimary}*\n`;
      message += `♤ Admins › *${groupAdmins.length}*\n`;
      message += `❒ Usuarios › *${totalParticipants}*\n`;
      message += `ꕥ Registrados › *${registeredUsersInGroup}*\n`;
      message += `✿ Claims › *${claimedCount} (${claimRate}%)*\n`;
      message += `♡ Personajes › *${totalCharacters}*\n`;
      message += `⛁ Dinero › *${totalCoins.toLocaleString()} ${monedas}*\n\n`;
      message += `➪ *Configuraciones:*\n`;
      message += `✐ ${botname} › *${settings.bot}*\n`;
      message += `✐ AntiLinks › *${settings.antilinks}*\n`;
      message += `✐ AntiStatus › *${settings.antistatus}*\n`
      message += `✐ Bienvenida › *${settings.welcome}*\n`;
      message += `✐ Despedida › *${settings.goodbye}*\n`;
      message += `✐ Alertas › *${settings.alerts}*\n`;
      message += `✐ Gacha › *${settings.gacha}*\n`;
      message += `✐ Economía › *${settings.economy}*\n`;
      message += `✐ Nsfw › *${settings.nsfw}*\n`;
      message += `✐ ModoAdmin › *${settings.adminmode}*`;
      const mentionOw = groupMetadata?.owner ? groupMetadata.owner : '';
      const mentions = [rawPrimary, mentionOw].filter(Boolean);
      await sock.sendMessage(msg.chat, { text: message.trim(), mentions });
    } catch (e) {
      await msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`);
    }
  }
};