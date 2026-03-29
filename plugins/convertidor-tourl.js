import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

const uploadCommand = {
    name: 'upload',
    alias: ['tourl', 'img'],
    category: 'tools',
    run: async (m, { conn, command }) => {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!mime || !/image/.test(mime)) {
            return m.reply(`> ✰⋆͙̈ Responde a una imagen con el comando ➠ *${command}*`);
        }

        await m.react('🕒');

        try {
            let buffer = await q.download();
            if (!buffer) return m.reply("> ⚔ Error al obtener el buffer.");

            const type = await fileTypeFromBuffer(buffer);
            const fileName = `img_${Date.now()}.${type?.ext || 'jpg'}`;

            const formData = new FormData();
            const blob = new Blob([buffer], { type: mime });
            formData.append('file', blob, fileName);

            const response = await fetch('https://api.dix.lat/upload1', {
                method: 'POST',
                body: formData,
                headers: { 'User-Agent': 'Drive-Client' }
            });

            const json = await response.json();

            if (json.status && json.data) {
                let result = json.data;
                let txt = `*── 「 DIX.LAT DRIVE 」 ──*\n\n`;
                txt += `▢ *ID:* ${result.id}\n`;
                txt += `▢ *NAME:* ${fileName}\n`;
                txt += `▢ *URL:* ${result.url}\n`;
                txt += `▢ *PESO:* ${result.size}\n`;
                txt += `▢ *MIME:* ${result.mime}\n\n`;
                txt += `> *Powered by Voker Systems*`;

                await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
                await m.react('✅');
            } else {
                await m.react('❌');
                m.reply("> ⚔ Error en la respuesta del servidor.");
            }
        } catch (e) {
            await m.react('❌');
            m.reply(`> ⚔ Error: ${e.message}`);
        }
    }
};

export default uploadCommand;