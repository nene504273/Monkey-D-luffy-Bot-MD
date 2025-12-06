export async function before(m, { conn, isAdmin, isBotAdmin, isROwner }) {
    if (!m.isGroup || !m?.text) return;

    const chat = global?.db?.data?.chats[m.chat];
    if (!chat?.antiarabes) return;

    const codigosBloqueados = ['20','966','971','973','974','965','962','963','964','967','968','970','212','213','216','218','249','961','92','91','93','94','95','98','62','63','64','65','60','66','84','90','86','81','82','880','855','856','670','672','673','674','675','676','677','678','679','680','681','682','683','684','685','686','687','688','689','690','691','692'];
    
    const isBloqueado = codigosBloqueados.some(code => m.sender.includes(code) || m.sender.includes(`+${code}`));
    
    if (isBloqueado && !isAdmin && !isROwner) {
        if (!isBotAdmin) return;
        if (m.key.participant === conn.user.jid) return;

        await Promise.all([
            conn.sendMessage(m.chat, { 
                delete: { 
                    remoteJid: m.chat, 
                    fromMe: false, 
                    id: m.key.id, 
                    participant: m.key.participant 
                }
            }),
            conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        ]);

        await conn.reply(m.chat, 'árabe detectado 🇪🇬', null);
    }
}

export async function participantsUpdate(m, { conn, isBotAdmin }) {
    const chat = global?.db?.data?.chats[m.chat];
    if (!chat?.antiarabes) return;
    if (!isBotAdmin) return;

    try {
        for (const participant of m.participants) {
            if (participant.action === 'add') {
                const userJid = participant.id;
                const codigosBloqueados = ['20','966','971','973','974','965','962','963','964','967','968','970','212','213','216','218','249','961','92','91','93','94','95','98','62','63','64','65','60','66','84','90','86','81','82','880','855','856','670','672','673','674','675','676','677','678','679','680','681','682','683','684','685','686','687','688','689','690','691','692'];
                const isBloqueado = codigosBloqueados.some(code => userJid.includes(code) || userJid.includes(`+${code}`));
                
                if (isBloqueado) {
                    await Promise.all([
                        conn.groupParticipantsUpdate(m.chat, [userJid], 'remove'),
                        conn.sendMessage(m.chat, {
                            text: 'árabe detectado 🇪🇬'
                        })
                    ]);
                }
            }
        }
    } catch (error) {
        console.error('Error en antiarabes:', error);
    }
}