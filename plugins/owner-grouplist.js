const handler = async (m, { conn, usedPrefix, command }) => {
    
    // Obtener todos los grupos en los que está el bot
    let groups = await conn.groupFetchAllParticipating();
    let groupValues = Object.values(groups);
    let totalGroups = groupValues.length;
    let txt = ''; 

    // Obtener el ID del bot de forma estandarizada
    const botJid = conn.decodeJid(conn.user.id);

    // Iteramos sobre cada grupo
    for (let i = 0; i < groupValues.length; i++) {
        const group = groupValues[i];
        const jid = group.id;
        
        // CORRECCIÓN: Usamos groupMetadata para obtener info fresca y evitar el bug de participantes/admin
        let freshMetadata = group;
        try {
            freshMetadata = await conn.groupMetadata(jid);
        } catch (e) {
            // No hacemos nada si falla, usamos la data antigua
        }
        
        const participants = freshMetadata.participants || [];
        
        // CORRECCIÓN: Se busca el objeto del bot usando conn.user.id (o botJid)
        const bot = participants.find((u) => conn.decodeJid(u.id) === botJid) || {};
        
        // CORRECCIÓN: La verificación de administrador debe ser explícita ('admin' o 'superadmin')
        const isBotAdmin = bot.admin === 'admin' || bot.admin === 'superadmin';
        
        // La verificación de participación original
        const isParticipant = participants.some((u) => conn.decodeJid(u.id) === botJid);
        
        // Usamos el nombre del grupo de la metadata fresca
        const groupName = freshMetadata.subject; 
        
        const participantStatus = isParticipant ? '👤 Participante' : '❌ Ex participante';
        const totalParticipants = participants.length;
        
        // CORRECCIÓN/ADICIÓN: Generación del link
        let groupLink = '--- (No admin) ---';
        if (isBotAdmin) {
            try {
                const code = await conn.groupInviteCode(jid);
                groupLink = `https://chat.whatsapp.com/${code}`;
            } catch (e) {
                groupLink = '--- (Error al obtener link) ---';
            }
        }
        
        // Bloque de texto original (Ligeramente ajustado para usar groupName y groupLink)
        txt += `*◉ Grupo ${i + 1}*
        *➤ Nombre:* ${groupName}
        *➤ ID:* ${jid}
        *➤ Admin:* ${isBotAdmin ? '✔ Sí' : '❌ No'}
        *➤ Estado:* ${participantStatus}
        *➤ Total de Participantes:* ${totalParticipants}
        *➤ Link:* ${groupLink}\n\n`; // Nota: Se eliminó el "--- (Error) ---" ya que se maneja arriba.
    }

    // Respuesta final
    m.reply(`*Lista de grupos del Bot* 👾\n\n*—◉ Total de grupos:* ${totalGroups}\n\n${txt}`.trim());
};

handler.help = ['groups', 'grouplist'];
handler.tags = ['owner'];
handler.command = ['listgroup', 'gruposlista', 'grouplist', 'listagrupos'];
handler.rowner = true;
handler.private = true;

export default handler;