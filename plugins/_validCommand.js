export async function before(m) {
  // 1. Validaciones de entrada (Early return)
  if (!m.text || !global.prefix.test(m.text) || !m.isGroup) return;

  // --- LÓGICA DE CONTROL DE BOT PRIMARIO ---
  let chat = global.db.data.chats[m.chat];
  let selfJid = this.user.jid.replace(/:.*@/, '@');

  // Si hay un bot primario asignado y no soy yo, salimos silenciosamente
  if (chat?.primaryBot && chat.primaryBot !== selfJid) return;
  // ------------------------------------------

  const usedPrefix = global.prefix.exec(m.text)[0];
  const textTrim = m.text.slice(usedPrefix.length).trim();
  const command = textTrim.split(' ')[0].toLowerCase();

  // Salir si no hay comando o si es el comando base "bot"
  if (!command || command === "bot") return;

  // Verificación eficiente de comandos existentes
  const isPluginCommand = Object.values(global.plugins).some(plugin => 
    plugin.command && (Array.isArray(plugin.command) ? plugin.command.includes(command) : plugin.command === command)
  );

  if (isPluginCommand) {
    let user = global.db.data.users[m.sender];

    // Verificación de estado del chat
    if (chat?.isBanned) {
      let aviso = `*───〔 ⚠ ESTADO: OFF 〕───*\n\n`;
      aviso += `> ◈ El bot *${botname}* está desactivado.\n`;
      aviso += `> ◈ Solicita a un *Admin* activarlo con:\n`;
      aviso += `> ✦ \`${usedPrefix}bot on\``;
      
      return await conn.reply(m.chat, aviso, m);
    }

    // Contador de comandos
    user.commands = (user.commands || 0) + 1;

  } else {
    // Respuesta para comandos inexistentes (Solo si es el bot primario)
    let noExiste = `*───〔 ℹ️ INFO 〕───*\n\n`;
    noExiste += `> ◈ El comando \`${usedPrefix + command}\` no fue hallado.\n`;
    noExiste += `> ◈ Usa *${usedPrefix}menu* para ver la lista.`;
    
    await conn.reply(m.chat, noExiste, m);
  }
}