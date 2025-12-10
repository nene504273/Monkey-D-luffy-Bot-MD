const handler = async (m, { conn, usedPrefix, command }) => {
    
    let groups = await conn.groupFetchAllParticipating();
    let groupValues = Object.values(groups);
    let totalGroups = groupValues.length;
    let txt = ''; 

    const botJid = conn.decodeJid(conn.user.id);

    // Iteramos sobre cada grupo
    for (let i = 0; i < groupValues.length; i++) {
        const group = groupValues[i];
        const jid = group.id;

        // --- CORRECCIÓN CLAVE: OBTENER METADATA FRESCA ---
        // Intentamos obtener la metadata del grupo directamente para refrescar la lista de participantes
        let freshMetadata = group;
        try {
            freshMetadata = await conn.groupMetadata(jid);
        } catch (e) {
            console.error(`Error al obtener metadata del grupo ${jid}:`, e);
            // Si falla, usamos la data antigua
        }
        
        const participants = freshMetadata.participants || [];
        // --------------------------------------------------
        
        // 1. Buscamos el objeto del bot
        const bot = participants.find((u) => conn.decodeJid(u.id) === botJid) || {};
        
        // 2. Verificación de Administrador
        const isBotAdmin = bot.admin === 'admin' || bot.admin === 'superadmin';
        
        // 3. Verificación de Participación (usando la metadata fresca)
        const isParticipant = Object.keys(bot).length > 0;
        
        const participantStatus = isBotAdmin 
            ? '👮‍♂️ Admin ⚓' 
            : isParticipant 
                ? '👤 Participante ⚓' 
                : '❌ Ex participante 🏴';

        // Usamos el total de la metadata fresca
        const totalParticipants = participants.length;
        
        // 4. Generación del Link
        let groupLink = '❌ (No soy admin)';
        if (isBotAdmin) {
            try {
                const code = await conn.groupInviteCode(jid);
                groupLink = `https://chat.whatsapp.com/${code}`;
            } catch (e) {
                groupLink = '⚠️ (Error al obtener link)';
            }
        }
        
        // --- ESTRUCTURA DE MENSAJE ---
        txt += `*◉ Grupo ${i + 1}*
        *➤ 🏴‍☠️ Nombre:* ${freshMetadata.subject}
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