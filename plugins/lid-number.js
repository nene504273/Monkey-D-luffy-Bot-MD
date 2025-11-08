const handler = async (m, { conn }) => {
    const userNumber = m.sender; // Número completo, ejemplo: 51921826291@s.whatsapp.net
    await conn.sendMessage(
        m.chat,
        { text: `🏴‍☠️ NUMERO DE USER 🥷\n\n☆ ${userNumber}\n\n☆ Sin @: ${userNumber.split('@')[0]}` },
        { quoted: m }
    );
};

handler.help = ['lid'];
handler.tags = ['lid'];
handler.command = /^lid$/i;

export default handler;