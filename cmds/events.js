import { normalizeJid, resolveParticipantJid, resolveJidSync, deleteCachedMeta, getCachedMeta, setCachedMeta } from '#serialize';
import db from "#db"
import chalk from 'chalk';
import moment from 'moment-timezone';

function getGroupAdmins(participants) {
  return (participants ?? []).filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id).filter(Boolean);
}

function resolveEventParticipant(p, sock) {
  if (typeof p === 'string') return resolveJidSync(p, sock) || p;
  return resolveParticipantJid(p, sock) || normalizeJid(p.id || p.phoneNumber || p.jid || p.lid || '') || '';
}

export default async (sock, msg) => {
  sock.ev.on('group-participants.update', async (anu) => {
    try {
      if (['add', 'remove', 'leave', 'promote', 'demote'].includes(anu.action)) {
        deleteCachedMeta(anu.id);
      }

      const metadata = await (async () => {
        const cached = getCachedMeta(anu.id);
        if (cached) return cached;
        for (let i = 0; i < 3; i++) {
          const m = await sock.groupMetadata(anu.id).catch(() => null);
          if (m) { setCachedMeta(anu.id, m); return m; }
          await new Promise(r => setTimeout(r, 1500));
        }
        return null;
      })();

      const groupAdmins = metadata ? getGroupAdmins(metadata.participants) : [];
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

      const chat = await db.getChat(anu.id);
      const botSettings = await db.getSettings(botId);

      const primaryBotId = chat?.primaryBot;
      const isSelf = (botSettings?.self ?? 0) || (chat?.isMute ?? false);

      if (isSelf) return;

      const now = new Date();
      const colombianTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
      const tiempo = colombianTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, '');
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A');
      const memberCount = metadata?.participants?.length || 0;

      // *** IMÁGENES FIJAS Y CANAL DE LUFFY ***
      const welcomeImageUrl = 'https://n.uguu.se/LBkLPUzM.jpeg';
      const goodbyeImageUrl = 'https://d.uguu.se/mEWKsMLi.jpeg';
      const newsletterJid = '120363420846835529@newsletter';
      const newsletterName = '⿻̸̷᮫̼̼፝͠🥨᪲ 𝐋𝗎𝖿𝖿𝗒 𝐆͢𝖾𝖺⃜𝗋 𝟧 ׅ ࿔𔗨̶🌊';

      for (const p of anu.participants) {
        const jid = resolveEventParticipant(p, sock);
        if (!jid) continue;

        const phone = jid.split('@')[0];
        const userData = await db.getUser(jid);
        const name = userData?.name || phone;

        // Selecciona la imagen según la acción
        const imageUrl = anu.action === 'add' ? welcomeImageUrl : goodbyeImageUrl;

        // Contexto con menciones (usuario + canal)
        const contextInfo = {
          mentionedJid: [jid, newsletterJid],
          isForwarded: false
        };

        // ---- BIENVENIDA ----
        if (anu.action === 'add' && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
          if (!metadata) continue;

          let caption;
          if (chat.welcomeMessage && chat.welcomeMessage.trim() !== '') {
            caption = chat.welcomeMessage
              .replace(/@user/g, `@${phone}`)
              .replace(/@group/g, metadata.subject || '')
              .replace(/@desc/g, metadata.desc || 'Sin descripción')
              .replace(/@members/g, memberCount)
              .replace(/@time/g, `${tiempo} ${tiempo2}`);
          } else {
            caption = `ത        ׂ𖹭     ׅ    ꒰͡     𝖭 ⋃ Σ 𝖵 𝖮     
𑄹𑄹  »   𝙐 𝙎 𝙀 𝙍!!*    ✬✫

⪩⪩   ֹ  \`𝖡𝗂𝖾ɳ𝗏𝖾𝗇𝗂𝖽@ 𝖺\`
                 \`${metadata.subject || ''}\`  ꒱꒱ㅤㅤㅤ

*ֹ  ᦕ   ׄ                      _@${phone}_*

         ׅ     ⑅ ׄ     .˙ Disfruta tu estadía!ֹ

な⃟   ۟  ─ _Ahora somos *${memberCount}* miembros!_

> Puedes usar \`/help\` para ver la lista de comandos.
> 🏴‍☠️ Canal: @${newsletterJid}
> ✐ 𝐋𝐢𝐧𝐤 » ${botSettings.link || ''}`;
          }

          // Envía imagen + caption (sin link preview externo)
          await sock.sendMessage(anu.id, {
            image: { url: welcomeImageUrl },
            caption: caption.trim(),
            mentions: [jid, newsletterJid],
            contextInfo
          }, { quoted: null });
        }

        // ---- DESPEDIDA ----
        if ((anu.action === 'remove' || anu.action === 'leave') && chat?.goodbye && (!primaryBotId || primaryBotId === botId)) {
          if (!metadata) continue;

          let caption;
          if (chat.byeMessage && chat.byeMessage.trim() !== '') {
            caption = chat.byeMessage
              .replace(/@user/g, `@${phone}`)
              .replace(/@group/g, metadata.subject || '')
              .replace(/@desc/g, metadata.desc || 'Sin descripción')
              .replace(/@members/g, memberCount)
              .replace(/@time/g, `${tiempo} ${tiempo2}`);
          } else {
            caption = `ത        ׂ𖹭     ׅ    ꒰͡     A ᗞＩO S     
𑄹𑄹  »   𝙐 𝙎 𝙀 𝙍!!*    ✬✫

⪩⪩   ֹ  \`𝙷𝚊𝚜𝚝𝚊 𝚕𝚞𝚎𝚐𝚘 𝚍𝚎\`
                 \`${metadata.subject || ''}\`  ꒱꒱ㅤㅤㅤ

*ֹ  ᦕ   ׄ                      _@${phone}_*

         ׅ     ⑅ ׄ     .˙ Espero vuelvas Pronto!ֹ

な⃟   ۟  ─ _Ahora somos *${memberCount}* miembros!_

> Puedes usar \`/help\` para ver la lista de comandos.
> 🏴‍☠️ Canal: @${newsletterJid}
> ✐ 𝐋𝐢𝐧𝐤 » ${botSettings.link || ''}`;
          }

          // Envía imagen + caption (sin link preview externo)
          await sock.sendMessage(anu.id, {
            image: { url: goodbyeImageUrl },
            caption: caption.trim(),
            mentions: [jid, newsletterJid],
            contextInfo
          }, { quoted: null });
        }

        // Limpiar AFK al salir
        if (anu.action === 'remove' || anu.action === 'leave') {
          const user = chat?.users?.[jid];
          if (user && typeof user.afk === 'number' && user.afk > -1) {
             if(chat && chat.users && chat.users[jid]) {
                chat.users[jid].afk = -1;
                chat.users[jid].afkReason = '';
             }
          }
        }

        // Promoción
        if (anu.action === 'promote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const authorJid = normalizeJid(anu.author) || anu.author;
          await sock.sendMessage(anu.id, { 
            text: `「✎」 *@${phone}* ha sido promovido a Administrador por *@${authorJid.split('@')[0]}.*`, 
            mentions: [jid, authorJid, ...groupAdmins] 
          });
        }

        // Degradación
        if (anu.action === 'demote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const authorJid = normalizeJid(anu.author) || anu.author;
          await sock.sendMessage(anu.id, { 
            text: `「✎」 *@${phone}* ha sido degradado de Administrador por *@${authorJid.split('@')[0]}.*`, 
            mentions: [jid, authorJid, ...groupAdmins] 
          });
        }
      }
    } catch (err) {
      console.log(chalk.gray(`[ EVENT ERROR ] → ${err}`));
    }
  });
};