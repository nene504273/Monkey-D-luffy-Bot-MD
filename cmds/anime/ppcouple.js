import fetch from "node-fetch";

export default {
  command: ['ppcp', 'ppcouple'],
  category: 'anime',
  description: 'Generar imágenes para amistades o parejas.',
  run: async ({ msg, sock, usedPrefix, command }) => {
    try {
      await msg.react('🕒');      
      let data = await (await fetch('https://raw.githubusercontent.com/ShirokamiRyzen/WAbot-DB/main/fitur_db/ppcp.json')).json();
      let cita = data[Math.floor(Math.random() * data.length)];      
      let cowi = Buffer.from(await (await fetch(cita.cowo)).arrayBuffer());
      await sock.sendFile(msg.chat, cowi, '', '*Masculino* ♂', msg);     
      let ciwi = Buffer.from(await (await fetch(cita.cewe)).arrayBuffer());
      await sock.sendFile(msg.chat, ciwi, '', '*Femenina* ♀', msg);
      await msg.react('✔️');      
    } catch (e) {
      await msg.react('✖️');
      await msg.reply(`> Ocurrió un error inesperado al ejecutar el comando *${usedPrefix + command}*.
> [Error: *${e.message}*]`);
    }
  },
};