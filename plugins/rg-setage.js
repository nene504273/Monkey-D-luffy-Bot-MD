import { createHash } from 'crypto';
import fetch from 'node-fetch';

const handler = async (m, { conn, command, usedPrefix, text }) => {
    const emoji = '✨', emoji2 = '❌';
    let user = global.db.data.users[m.sender];

    // Validación de entrada vacía
    if (!text?.trim()) {
        return conn.reply(m.chat, 
            `${emoji} Debes ingresar una edad válida.\n> Ejemplo » *${usedPrefix + command} 25*`,
            m
        );
    }

    // Validación de edad
    const edad = parseInt(text);
    if (isNaN(edad) || edad < 0 || edad > 120) {
        return conn.reply(m.chat, 
            `${emoji2} Por favor ingresa una edad válida entre 0 y 120 años.`,
            m
        );
    }

    // Establecer la edad
    user.age = edad;

    // Respuesta exitosa
    return conn.reply(m.chat, 
        `${emoji} Se ha establecido tu edad como: *${edad}* años!`,
        m
    );
};

// Configuración del comando
handler.help = ['setage'];
handler.tags = ['rg'];
handler.command = ['setage', 'edad'];

export default handler;