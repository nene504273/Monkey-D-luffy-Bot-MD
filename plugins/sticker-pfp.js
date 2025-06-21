/* Código hecho por Destroy
 - https://github.com/The-King-Destroy
*/

let handler = async (m, { conn }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let name = await conn.getName(who); // Corrección: ahora se usa await
    let pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg');
    await conn.sendFile(m.chat, pp, 'profile.jpg', `*Foto de perfil de ${name}*`, m);
}

handler.help = ['pfp @user'];
handler.tags = ['sticker'];
handler.command = ['pfp', 'getpic'];

export default handler;