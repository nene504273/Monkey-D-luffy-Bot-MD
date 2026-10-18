import { normalizeJid, resolveParticipantJid, resolveJidSync, deleteCachedMeta, getCachedMeta, setCachedMeta } from '#serialize';
import db from "#db";
import chalk from 'chalk';
import moment from 'moment-timezone';
import { prepareWAMessageMedia } from 'baileys';

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

      // ══════════ CANAL OFICIAL (DATOS EXACTOS PROPORCIONADOS) ══════════
      const newsletterJid = '120363420846835529@newsletter';
      const newsletterName = '⿻̸̷᮫̼̼͠🥨  𝐋𝗎𝖿𝗒 ͢𝖾𝖺⃜𝗋  ׅ ࿔̶';
      
      // Generamos el link basado en el JID del newsletter
      // Nota: WhatsApp suele usar el formato https://whatsapp.com/channel/{numero_sin_jid}
      // Si ese link no funciona directamente, asegúrate de tener el link manual correcto abajo.
      const channelLink = `https://whatsapp.com/channel/${newsletterJid.replace('@newsletter', '').replace('1203634', '')}`; 
      // ⚠️ OJO: El ID numérico largo a veces requiere el prefijo específico. 
      // Si el anterior falla, usa manualmente tu link real aquí:
      // const channelLink = 'https://whatsapp.com/channel/0029VaXXXXXXXXXXXXXXX'; 

      // Intentar obtener miniatura del canal para la tarjeta
      let channelThumbnail = undefined;
      try {
        const picUrl = await sock.profilePictureUrl(newsletterJid, 'image').catch(() => null);
        if (picUrl) {
           const res = await fetch(picUrl);
           const buf = await res.arrayBuffer();
           channelThumbnail = Buffer.from(buf);
        }
      } catch (e) {
        console.log(chalk.yellow('[WARN] No se pudo cargar miniatura del canal:', e.message));
      }

      for (const p of anu.participants) {
        const jid = resolveEventParticipant(p, sock);
        if (!jid) continue;

        const phone = jid.split('@')[0];
        const userData = await db.getUser(jid);
        const name = userData?.name || phone;

        const avatar = await sock.profilePictureUrl(jid, 'image').catch(() => "https://h.uguu.se/PMBnVUgn.jpg");

        const contextBase = {
          mentionedJid: [jid].filter(Boolean),
          isForwarded: false
        };

        // ══════════ BIENVENIDA (ADD) ══════════
        if (anu.action === 'add' && chat?.welcome && (!primaryBotId || primaryBotId === botId)) {
          if (!metadata) continue;

          let captionText;
          if (chat.welcomeMessage && chat.welcomeMessage.trim() !== '') {
            captionText = chat.welcomeMessage
              .replace(/@user/g, `@${phone}`)
              .replace(/@group/g, metadata.subject || '')
              .replace(/@desc/g, metadata.desc || 'Sin descripción')
              .replace(/@members/g, memberCount)
              .replace(/@time/g, `${tiempo} ${tiempo2}`);
          } else {
            // Texto decorativo original con ajustes mínimos
            captionText = `ത        ׂ𖹭     ׅ    ꒰͡     𝖭 ⋃ Σ 𝖵 𝖮     
𑄹  »   𝙐  𝙀 !!*    ✬✫

⪩   ֹ  \`ɳ𝗏𝗂𝖽@ 𝖺\`
                 \`${metadata.subject || ''}\`  ꒱꒱ㅤㅤㅤ

*ֹ  ᦕ   ׄ                      _@${phone}_*

         ׅ      ׄ     . Disfruta tu estadía!

な⃟   ۟  ─ _Ahora somos *${memberCount}* miembros!_

> Puedes usar \`/help\` para ver la lista de comandos.`;
          }

          // 1. Enviar Tarjeta Clicable del Canal
          await sock.sendMessage(anu.id, {
            text: '', // Vacío para que solo se vea la preview
            contextInfo: {
              mentionedJid: [jid],
              externalAdReply: {
                title: `✨ ¡Bienvenid@ al grupo!\n\n${metadata.subject || ''}`,
                body: `@${phone} • Únete a nuestra comunidad 🏴‍️`,
                mediaType: 2,
                thumbnailUrl: 'https://i.ibb.co/yRZjNqF/luffy.png', // Fallback image
                sourceUrl: channelLink, // Link al canal
                showAdAttribution: true,
                renderLargerThumbnail: true,
                containsAutoReply: false,
                isForwarded: false,
                forwardingScore: 1,
                ...(channelThumbnail && { jpegThumbnail: channelThumbnail }),
                newsletter: {
                  name: newsletterName,
                  invite: channelLink,
                  id: newsletterJid,
                  sender: botId
                },
                footer: `📢 Toca aquí para seguir el canal`
              },
              forwardContextInfo: {
                isChannelPublic: true
              }
            }
          }, { quoted: null });

          // 2. Enviar Texto Decorativo "Reenviado" desde el Canal
          await sock.sendMessage(anu.id, {
            text: captionText.trim(),
            contextInfo: {
              mentionedJid: [jid],
              forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid,
                serverMessageId: Math.floor(Math.random() * 100000),
                newsletterName: newsletterName
              }
            }
          }, { quoted: null });
        }

        // ══════════ DESPEDIDA (REMOVE / LEAVE) ══════════
        if ((anu.action === 'remove' || anu.action === 'leave') && chat?.goodbye && (!primaryBotId || primaryBotId === botId)) {
          if (!metadata) continue;

          let captionText;
          if (chat.byeMessage && chat.byeMessage.trim() !== '') {
            captionText = chat.byeMessage
              .replace(/@user/g, `@${phone}`)
              .replace(/@group/g, metadata.subject || '')
              .replace(/@desc/g, metadata.desc || 'Sin descripción')
              .replace(/@members/g, memberCount)
              .replace(/@time/g, `${tiempo} ${tiempo2}`);
          } else {
             captionText = `ത        ׂ     ׅ    ꒰͡     A ＩO S     
𑄹  »   𝙐 𝙎  𝙍!!*    ✬✫

⪩⪩   ֹ  \`𝙷𝚊𝚜𝚝𝚊 𝚕𝚞𝚎𝚐 𝚎\`
                 \`${metadata.subject || ''}\`  ꒱꒱ㅤㅤㅤ

*ֹ  ᦕ   ׄ                      _@${phone}_*

         ׅ      ׄ     .˙ Espero vuelvas Pronto!ֹ

な⃟   ۟  ─ _Ahora somos *${memberCount}* miembros!_`;
          }

          // 1. Enviar Tarjeta Clicable del Canal (Despedida)
          await sock.sendMessage(anu.id, {
            text: '',
            contextInfo: {
              mentionedJid: [jid],
              externalAdReply: {
                title: `👋 Adiós tripulante...\n\n${metadata.subject || ''}`,
                body: `@${phone} se fue • Quedan ${memberCount} piratas`,
                mediaType: 2,
                thumbnailUrl: 'https://i.ibb.co/yRZjNqF/luffy.png',
                sourceUrl: channelLink,
                showAdAttribution: true,
                renderLargerThumbnail: true,
                containsAutoReply: false,
                isForwarded: false,
                forwardingScore: 1,
                ...(channelThumbnail && { jpegThumbnail: channelThumbnail }),
                newsletter: {
                  name: newsletterName,
                  invite: channelLink,
                  id: newsletterJid,
                  sender: botId
                },
                footer: `📢 Sigue nuestro canal para más novedades`
              },
              forwardContextInfo: {
                isChannelPublic: true
              }
            }
          }, { quoted: null });

          // 2. Enviar Texto Decorativo "Reenviado" desde el Canal
          await sock.sendMessage(anu.id, {
            text: captionText.trim(),
            contextInfo: {
              mentionedJid: [jid],
              forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid,
                serverMessageId: Math.floor(Math.random() * 100000),
                newsletterName: newsletterName
              }
            }
          }, { quoted: null });
        }

        // ══════════ AFK RESET ══════════
        if (anu.action === 'remove' || anu.action === 'leave') {
          const user = chat?.users?.[jid];
          if (user && typeof user.afk === 'number' && user.afk > -1) {
             if(chat && chat.users && chat.users[jid]) {
                chat.users[jid].afk = -1;
                chat.users[jid].afkReason = '';
             }
          }
        }

        // ══════════ PROMOTE ══════════
        if (anu.action === 'promote' && chat?.alerts && (!primaryBotId || primaryBotId === botId)) {
          const authorJid = normalizeJid(anu.author) || anu.author;
          await sock.sendMessage(anu.id, { 
            text: `「✎」 *@${phone}* ha sido promovido a Administrador por *@${authorJid.split('@')[0]}.*`, 
            mentions: [jid, authorJid, ...groupAdmins] 
          });
        }

        // ══════════ DEMOTE ══════════
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