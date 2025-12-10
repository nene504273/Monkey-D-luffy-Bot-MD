    const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
    const isBotAdmin = bot?.admin || false;
    const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
    const participantStatus = isParticipant ? '👤 Participante' : '❌ Ex participante';
    const totalParticipants = participants.length;    
    txt += `*◉ Grupo ${i + 1}*
    *➤ Nombre:* ${await conn.getName(jid)}
    *➤ ID:* ${jid}
    *➤ Admin:* ${isBotAdmin ? '✔ Sí' : '❌ No'}
    *➤ Estado:* ${participantStatus}
    *➤ Total de Participantes:* ${totalParticipants}
    *➤ Link:* ${isBotAdmin ? '--- (Error) ---' : '--- (No admin) ---'}\n\n`;
  }
  m.reply(`*Lista de grupos del Bot* 👾\n\n*—◉ Total de grupos:* ${totalGroups}\n\n${txt}`.trim());
 }    
};
handler.help = ['groups', 'grouplist'];
handler.tags = ['owner'];
handler.command = ['listgroup', 'gruposlista', 'grouplist', 'listagrupos']
handler.rowner = true;
handler.private = true

export default handler;