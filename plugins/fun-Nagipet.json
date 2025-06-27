let handler = async (m, { command, conn, args, usedPrefix }) => {
  let user = global.db.data.users[m.sender];

  switch (command) {
    case 'crearpet':
      if (user.pet) return m.reply('*Ya tienes una mascota creada.*');
      user.pet = {
        nombre: args[0] || 'NagiPet',
        hambre: 50,
        energia: 50,
        diversion: 50,
        nivel: 1,
        experiencia: 0,
      };
      m.reply(`*Mascota creada con éxito*\n\nNombre: ${user.pet.nombre}\nNivel: 1\n¡Cuídala bien! Usa ${usedPrefix}perfilpet para verla.`);
      break;

    case 'perfilpet':
      if (!user.pet) return m.reply(`*No tienes mascota.* Usa ${usedPrefix}crearpet para crear una.`);
      let pet = user.pet;
      m.reply(`*Perfil de tu mascota*\n\n` +
        `• Nombre: ${pet.nombre}\n` +
        `• Nivel: ${pet.nivel}\n` +
        `• Hambre: ${pet.hambre}/100\n` +
        `• Energía: ${pet.energia}/100\n` +
        `• Diversión: ${pet.diversion}/100\n` +
        `• Experiencia: ${pet.experiencia}/100`);
      break;

    case 'alimentarpet':
      if (!user.pet) return m.reply(`*No tienes mascota.* Usa ${usedPrefix}crearpet para crear una.`);
      if (user.pet.hambre >= 100) return m.reply('*Tu mascota ya está llena.*');
      user.pet.hambre = Math.min(100, user.pet.hambre + 30);
      user.pet.experiencia += 10;
      subirNivel(user);
      m.reply(`*Alimentaste a ${user.pet.nombre}*\nHambre: ${user.pet.hambre}/100\n+10 XP`);
      break;

    case 'jugarpet':
      if (!user.pet) return m.reply(`*No tienes mascota.* Usa ${usedPrefix}crearpet para crear una.`);
      if (user.pet.diversion >= 100) return m.reply('*Tu mascota ya está feliz.*');
      user.pet.diversion = Math.min(100, user.pet.diversion + 30);
      user.pet.experiencia += 10;
      subirNivel(user);
      m.reply(`*Jugaste con ${user.pet.nombre}*\nDiversión: ${user.pet.diversion}/100\n+10 XP`);
      break;

    case 'dormirpet':
      if (!user.pet) return m.reply(`*No tienes mascota.* Usa ${usedPrefix}crearpet para crear una.`);
      if (user.pet.energia >= 100) return m.reply('*Tu mascota ya está descansada.*');
      user.pet.energia = Math.min(100, user.pet.energia + 30);
      user.pet.experiencia += 10;
      subirNivel(user);
      m.reply(`*Tu mascota durmió bien*\nEnergía: ${user.pet.energia}/100\n+10 XP`);
      break;
  }
};

handler.help = ['crearpet', 'perfilpet', 'alimentarpet', 'jugarpet', 'dormirpet'];
handler.tags = ['pet'];
handler.command = /^(crearpet|perfilpet|alimentarpet|jugarpet|dormirpet)$/i;

export default handler;

function subirNivel(user) {
  let pet = user.pet;
  if (pet.experiencia >= 100) {
    pet.experiencia = 0;
    pet.nivel += 1;
  }
}