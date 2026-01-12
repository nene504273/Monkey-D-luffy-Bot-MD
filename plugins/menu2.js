// plugins/menu2.js

let handler = async (m, { conn, usedPrefix, command }) => {
    const imagenLuffy = "https://raw.githubusercontent.com/nevi-dev/nevi-dev/main/src/IMG-20260110-WA0014.jpg";

    let menu = `*┏━━━━━━━━━━━━━━━━┓*\n`;
    menu += `*┃   🎧  MENÚ DE AUDIOS 2  🎧   ┃*\n`;
    menu += `*┗━━━━━━━━━━━━━━━━┛*\n\n`;

    menu += `> _Escribe la palabra para reproducir el audio_\n\n\n`;

    menu += `💼 *【 TRABAJO 】*\n`;
    menu += `• chamba\n\n`;
    menu += `• chamba digital\n\n`;
    menu += `• trabajar\n\n\n`;

    menu += `🐉 *【 ANIME 】*\n`;
    menu += `• goku / seria\n\n`;
    menu += `• vegeta / moto\n\n`;
    menu += `• dinero / donar\n\n`;
    menu += `• onichan / yamete\n\n`;
    menu += `• paimon / emergencia\n\n\n`;

    menu += `😂 *【 HUMOR / XD 】*\n`;
    menu += `• xd / xddd\n\n`;
    menu += `• momazo / momo\n\n`;
    menu += `• risa / yupi\n\n`;
    menu += `• vete alv / terreneitor\n\n\n`;

    menu += `🔥 *【 ESENCIA 】*\n`;
    menu += `• esencia / tablos\n\n`;
    menu += `• 7 palabras\n\n`;
    menu += `• algo cambio\n\n\n`;

    menu += `💬 *【 SOCIAL 】*\n`;
    menu += `• bienvenido\n\n`;
    menu += `• respondan\n\n`;
    menu += `• grupo muerto / he vuelto\n\n\n`;

    menu += `🔞 *【 PAJA 】*\n`;
    menu += `• turbo paja / pajin\n\n`;
    menu += `• mucha paja\n\n\n`;

    menu += `⚠️ *【 OTROS 】*\n`;
    menu += `• ya se donde vives\n\n`;
    menu += `• arrepientete\n\n`;
    menu += `• me vale verga / gay\n\n`;
    menu += `• se fue la luz\n\n\n`;

    menu += `_Disfruta de los audios_ 🏴‍☠️`;

    await conn.sendMessage(m.chat, { 
        image: { url: imagenLuffy }, 
        caption: menu 
    }, { quoted: m });
};

// Esta parte es vital para que reconozca el comando
handler.command = /^(menu2|audios2)$/i;
handler.tags = ['main'];
handler.help = ['menu2'];

export default handler;