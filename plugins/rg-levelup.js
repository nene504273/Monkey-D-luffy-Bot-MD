import { canLevelUp, xpRange } from '../lib/levelling.js';
import db from '../lib/database.js';
import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    let mentionedUser = m.mentionedJid[0];
    let citedMessage = m.quoted ? m.quoted.sender : null;
    let who = mentionedUser || citedMessage || m.sender; 
    let name = await conn.getName(who) || 'Usuario';
    let user = global.db.data.users[who];

    if (!user) {
        await conn.sendMessage(m.chat, { text: "❌ No se encontraron datos del usuario." }, { quoted: m });
        return;
    }

    let { min, xp } = xpRange(user.level, global.multiplier);

    let before = user.level * 1;
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++;

    if (before !== user.level) {
       
        let avatar = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg');
        let background = encodeURIComponent('https://i.ibb.co.com/2jMjYXK/IMG-20250103-WA0469.jpg');
        let avatarURL = encodeURIComponent(avatar);
        let fromLevel = before;
        let toLevel = user.level;
        let apiURL = `https://api.siputzx.my.id/api/canvas/level-up?backgroundURL=${background}&avatarURL=${avatarURL}&fromLevel=${fromLevel}&toLevel=${toLevel}&name=${encodeURIComponent(name)}`;

        
        await conn.sendFile(m.chat, apiURL, 'levelup.jpg', `
ᥫ᭡ ¡Felicidades, @${who.split('@')[0]}!

✦ Has subido de nivel:
➜ *${fromLevel}* ➔ *${toLevel}* 〔 ${user.role} 〕

🗓️ *Fecha:* ${new Date().toLocaleString('es-DO')}
> *Sigue interactuando para subir más nivel.*
        `.trim(), m, false, { mentions: [who] });
    } else {
        // Mostrar progreso si no sube de nivel
        let users = Object.entries(global.db.data.users).map(([key, value]) => {
            return { ...value, jid: key };
        });

        let sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0));
        let rank = sortedLevel.findIndex(u => u.jid === who) + 1;

        let txt = `*「✿」Usuario* ◢ ${name} ◤\n\n`;
        txt += `✦ Nivel » *${user.level}*\n`;
        txt += `✰ Experiencia » *${user.exp}*\n`;
        txt += `❖ Rango » ${user.role}\n`;
        txt += `➨ Progreso » *${user.exp - min} => ${xp}* _(${Math.floor(((user.exp - min) / xp) * 100)}%)_\n`;
        txt += `# Puesto » *${rank}* de *${sortedLevel.length}*\n`;
        txt += `❒ Comandos totales » *${user.commands || 0}*`;

        await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
    }
};

handler.help = ['levelup', 'lvl @user'];
handler.tags = ['rpg'];
handler.command = ['nivel', 'lvl', 'level', 'levelup'];
handler.register = true;
handler.group = true;

export default handler;
