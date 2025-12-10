const handler = async (m, { conn, usedPrefix, command }) => {
    
    // Obtenemos todos los grupos en los que está el bot
    let groups = await conn.groupFetchAllParticipating();
    let groupValues = Object.values(groups);
    let totalGroups = groupValues.length;
    let txt = ''; 

    // Obtenemos el ID del bot de forma segura para compararlo
    const botJid = conn.decodeJid(conn.user.id);

    // Iteramos sobre cada grupo
    for (let i = 0; i < groupValues.length; i++) {
        const group = groupValues[i];
        const jid = group.id;
        const participants = group.participants || [];
        
        // 1. Corregimos la detección del bot en el grupo
        const bot = participants.find((u) => conn.decodeJid(u.id) === botJid) || {};
        
        // 2. Corregimos la verificación de administrador (debe ser 'admin' o 'superadmin')
        const isBotAdmin = bot && (bot.admin === 'admin' || bot.admin === 'superadmin');
        
        // Verificamos si es participante (aunque ya lo sería si está en la lista)
        const isParticipant = participants.some((u) => conn.decodeJid(u.id) === botJid);
        
        // Emojis y estados mejorados
        const participantStatus = isParticipant ? '👤 Participante ⚓' : '❌ Ex participante 🏴';
        const totalParticipants = participants.length;
        
        // 3. Implementamos la generación del link (Solo si es admin)
        let groupLink = '❌ (No soy admin)';
        if (isBotAdmin) {
            try {
                // Generamos el código de invitación
                const code = await conn.groupInviteCode(jid);
                groupLink = `https://chat.whatsapp.com/${code}`;
            } catch (e) {
                groupLink = '⚠️ (Error al obtener link)';
            }
        }
        
        // --- ESTRUCTURA DE MENSAJE (con emojis) ---
        txt += `*◉ Grupo ${i + 1}*
        *➤ 🏴‍☠️ Nombre:* ${group.subject}
        *➤ 🆔 ID:* ${jid}
        *➤ 👑 Admin:* ${isBotAdmin ? '✔ Sí' : '❌ No'}
        *➤ ⚓ Estado:* ${participantStatus}
        *➤ 👥 Total de Participantes:* ${totalParticipants}
        *➤ 🔗 Link:* ${groupLink}\n\n${'─'.repeat(20)}\n`;
    }

    m.reply(`*Lista de grupos del Bot* 👾\n\n*—◉ Total de grupos:* ${totalGroups}\n\n${txt}`.trim());
};

handler.help = ['groups', 'grouplist'];
handler.tags = ['owner'];
handler.command = ['listgroup', 'gruposlista', 'grouplist', 'listagrupos']
handler.rowner = true;
handler.private = true

export default handler;