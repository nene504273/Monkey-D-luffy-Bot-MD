import { createHash } from 'crypto';  
import fetch from 'node-fetch';

/**
 * Este manejador de comandos permite a los administradores del grupo
 * establecer y borrar un mensaje de bienvenida personalizado.
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

    if (command === 'setwelcome') {
        if (!text) {
            return m.reply('❌ Por favor, proporciona un mensaje de bienvenida. Puedes usar los siguientes placeholders:\n`@user`, `@group`, `@count`');
        }
        
        // Guarda el mensaje personalizado en la base de datos del chat
        chat.customWelcome = text.trim();
        m.reply(`✅ El mensaje de bienvenida personalizado ha sido establecido con éxito.`);

    } else if (command === 'delwelcome') {
        // Borra el mensaje personalizado
        chat.customWelcome = null;
        m.reply('✅ El mensaje de bienvenida personalizado ha sido eliminado. Ahora se usará el mensaje predeterminado.');
    }
};

handler.help = ['setwelcome <mensaje>', 'delwelcome'];
handler.tags = ['group', 'config'];
handler.command = ['setwelcome', 'delwelcome'];
handler.owner = false;
handler.admin = true;

export default handler;
