import { createHash } from 'crypto';
import fetch from 'node-fetch';

const handler = async (m, { conn, command, usedPrefix, text }) => {
    const emoji = '✨', emoji2 = '❌';
    let user = global.db.data.users[m.sender];

    // Validación de usuario no registrado
    if (!user) {
        return conn.reply(m.chat, 
            `${emoji2} No estás registrado, no hay nada que borrar.`,
            m
        );
    }

    // Confirmación antes de borrar
    const confirmar = text?.toLowerCase();
    if (confirmar !== 'si') {
        return conn.reply(m.chat, 
            `${emoji2} ¿Estás seguro de que quieres reiniciar tu registro? Escribe *${usedPrefix + command} si* para confirmar.`,
            m
        );
    }

    // Borrar el registro
    delete global.db.data.users[m.sender];

    // Respuesta exitosa
    return conn.reply(m.chat, 
        `🏴‍☠️ ¡Tu registro ha sido eliminado exitosamente! Ahora seguimos navegando hacia nuevas aventuras.`,
        m
    );
};

// Configuración del comando
handler.help = ['unreg'];
handler.tags = ['rg'];
handler.command = ['unreg', 'deregistrar'];

export default handler;