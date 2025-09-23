import { createHash } from 'crypto';  
import fetch from 'node-fetch';

/**
 * Este manejador de comandos permite a los administradores del grupo
 * establecer y borrar un mensaje de despedida personalizado.
 */
const handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
    // Si no es un grupo, o el usuario no es admin/dueño, no hagas nada.
    if (!m.isGroup || (!isAdmin && !isOwner)) {
        return m.reply('❌ ¡Solo los administradores o el dueño pueden usar estos comandos!');
    }

    // Asegurarse de que el chat tenga una entrada en la base de datos
    let chat = global.db.data.chats[m.chat] || {};
    if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = chat;
    }

    if (command === 'setbye') {
        if (!text) {
            return m.reply('❌ Por favor, proporciona un mensaje de despedida. Puedes usar los siguientes placeholders:\n`@user`, `@group`, `@count`');
        }
        
        // Guarda el mensaje personalizado en la base de datos del chat
        chat.customBye = text.trim();
        m.reply(`✅ El mensaje de despedida personalizado ha sido establecido con éxito.`);

    } else if (command === 'delbye') {
        // Borra el mensaje personalizado
        chat.customBye = null;
        m.reply('✅ El mensaje de despedida personalizado ha sido eliminado. Ahora se usará el mensaje predeterminado.');
    }
};

handler.help = ['setbye <mensaje>', 'delbye'];
handler.tags = ['group', 'config'];
handler.command = ['setbye', 'delbye'];
handler.owner = false;
handler.admin = true;

export default handler;
