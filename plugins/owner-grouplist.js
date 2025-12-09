const handler = async (m, { conn, usedPrefix, command }) => {
  // Obtenemos todos los grupos donde está el bot
  let groups = await conn.groupFetchAllParticipating();
  let groupValues = Object.values(groups);
  
  let txt = `☠️ *LISTA DE GRUPOS - NAKAMAS* ☠️\n\n*—◉ Total de grupos:* ${groupValues.length}\n\n`;

  // Iteramos sobre cada grupo
  for (let i = 0; i < groupValues.length; i++) {
    const group = groupValues[i];
    const jid = group.id;
    const participants = group.participants || [];
    
    // Obtenemos el ID real del bot
    const botJid = conn.decodeJid(conn.user.id);
    
    // Buscamos al bot dentro de los participantes
    const bot = participants.find((u) => conn.decodeJid(u.id) === botJid);
    
    // Verificamos si es admin (admin o superadmin)
    const isBotAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin');
    
    // Calculamos el estado
    const participantStatus = isBotAdmin ? '👮‍♂️ Admin (Bot)' : '👤 Participante';
    const totalParticipants = participants.length;

    // Intentamos obtener el link SOLO si el bot es admin
    // (Usamos try/catch para que no se rompa si falla en un grupo)
    let groupLink = '❌ (No soy admin)';
    if (isBotAdmin) {
        try {
            // Nota: Generar links masivamente puede ser lento. 
            // Si el bot tarda mucho, comenta la línea de abajo y pon: groupLink = '✅ (Admin)';
            const code = await conn.groupInviteCode(jid);
            groupLink = 'https://chat.whatsapp.com/' + code;
        } catch (e) {
            groupLink = '⚠️ (Error al obtener link)';
        }
    }

    txt += `*🌊 Grupo ${i + 1}*
    *➤ 🏴‍☠️ Nombre:* ${group.subject}
    *➤ 🆔 ID:* ${jid}
    *➤ 👑 Admin:* ${isBotAdmin ? '✔ Sí' : '❌ No'}
    *➤ ⚓ Estado:* ${participantStatus}
    *➤ 👥 Participantes:* ${totalParticipants}
    *➤ 🔗 Link:* ${groupLink}\n\n${'─'.repeat(20)}\n\n`;
  }

  // Enviamos el mensaje final
  await m.reply(txt.trim());
};

handler.help = ['groups', 'grouplist'];
handler.tags = ['owner'];
handler.command = ['listgroup', 'gruposlista', 'grouplist', 'listagrupos'];
handler.rowner = true;
handler.private = true;

export default handler;