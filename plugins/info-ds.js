import { promises as fs } from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
    // Verificar que el comando se use en el número principal
    if (global.conn.user.jid !== conn.user.jid) {
        return conn.reply(m.chat, `${emoji} Utiliza este comando directamente en el número principal del Bot.`, m);
    }

    // Definir correctamente la carpeta de sesiones
    const sessionsDir = global.sessions || 'sessions';
    const sessionPath = path.join(process.cwd(), sessionsDir);

    // Determinar los IDs a buscar en los archivos
    const chatIds = m.isGroup 
        ? [m.chat, m.sender] 
        : [m.sender];
    const cleanIds = chatIds.map(id => id.split('@')[0]);

    try {
        const files = await fs.readdir(sessionPath);
        let filesDeleted = 0;

        for (const file of files) {
            // Si el nombre del archivo incluye alguno de los IDs, lo eliminamos
            if (cleanIds.some(cleanId => file.includes(cleanId))) {
                await fs.unlink(path.join(sessionPath, file));
                filesDeleted++;
            }
        }

        if (filesDeleted === 0) {
            await conn.reply(m.chat, `${emoji2} No se encontró ningún archivo que incluya la ID del chat.`, m);
        } else {
            await conn.reply(m.chat, `${emoji2} Se eliminaron ${filesDeleted} archivos de sesión.\n${emoji} ¡Hola! ¿logras verme?`, m);
        }
    } catch (err) {
        console.error('Error al procesar los archivos de sesión:', err);
        await conn.reply(m.chat, `${emoji} Hola, soy ${botname}. Ocurrió un error al limpiar la sesión. Sigue el canal y apóyanos.\n\n> ${channel}`, m);
    }
};

handler.help = ['ds', 'fixmsgespera'];
handler.tags = ['info'];
handler.command = ['fixmsgespera', 'ds'];
handler.register = true;

export default handler;