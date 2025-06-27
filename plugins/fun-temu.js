import fs from 'fs';
import path from 'path';

export default async function handler(m, { conn }) {
    try {
        const usuario = global.db.data.users[m.sender];
        const costo = 1000;

        // Verificar si el usuario está registrado
        if (!usuario) {
            return m.reply(`${emoji2} No estás registrado en la base de datos.`);
        }

        // Verificar si el usuario tiene suficiente dinero
        if (usuario.coin < costo) {
            return m.reply(`${emoji2} No tienes suficiente dinero.\nTienes: ${usuario.coin}\nNecesitas: ${costo}`);
        }

        const carpeta = './media/temu/';
        
        // Verificar si la carpeta existe
        if (!fs.existsSync(carpeta)) {
            return m.reply(`${emoji2} La carpeta de imágenes de pedidos no existe.`);
        }

        const archivos = fs.readdirSync(carpeta);

        // Filtrar los archivos de pedido y llegada
        const pedidos = archivos.filter(f => /^pedido\d+\.(jpg|jpeg|png)$/i.test(f));
        const llegadas = archivos.filter(f => /^llegada\d+\.(jpg|jpeg|png)$/i.test(f));

        // Verificar si existen imágenes de pedidos y llegadas
        if (pedidos.length === 0 || llegadas.length === 0) {
            return m.reply(`${emoji2} No se encontraron imágenes válidas de pedido y llegada.`);
        }

        // Emparejar las imágenes de pedidos con las de llegadas
        const combos = pedidos.map(pedido => {
            const numero = pedido.match(/\d+/)[0];
            const llegada = llegadas.find(l => l.match(new RegExp(`llegada${numero}\\.(jpg|jpeg|png)$`, 'i')));
            if (llegada) {
                return {
                    pedido: path.join(carpeta, pedido),
                    llegada: path.join(carpeta, llegada)
                };
            }
        }).filter(Boolean);

        // Verificar si se encontró algún combo válido
        if (combos.length === 0) {
            return m.reply(`${emoji2} No se encontró ningún combo de imágenes de pedido y llegada emparejadas.`);
        }

        // Restar el costo de coins
        usuario.coin -= costo;

        const combo = combos[Math.floor(Math.random() * combos.length)];
        const nombrePedido = path.basename(combo.pedido);
        const nombreLlegada = path.basename(combo.llegada);

        // Enviar la imagen de pedido
        await conn.sendFile(m.chat, combo.pedido, nombrePedido, `✅ Pediste un paquete en Temu\nCosto: ${costo} ${moneda}\nLlega en 30 segundos...`, m);

        // Enviar la imagen de llegada después de 30 segundos
        setTimeout(() => {
            conn.sendFile(m.chat, combo.llegada, nombreLlegada, `📦 @${m.sender.split('@')[0]}, ¡tu paquete de Temu ya llegó!`, m, { mentions: [m.sender] });
        }, 30 * 1000);

    } catch (error) {
        console.error(error);
        m.reply(`${emoji2} Ocurrió un error inesperado: ${error.message}`);
    }
}

handler.help = ['temu'];
handler.tags = ['fun'];
handler.command = ['temu'];
handler.register = true;