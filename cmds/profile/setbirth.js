import moment from 'moment';
import db from '#db';
moment.locale('es');

export default {
  command: ['setbirth'],
  category: 'profile',
  description: 'Establecer tu fecha de cumpleaños.',
  run: async ({ msg, args, usedPrefix, command, text }) => {
    const user = db.getUser(msg.sender);
    const currentYear = new Date().getFullYear();
    const input = args.join(' ');    
    if (!input) return msg.reply(`《✧》 Debes ingresar una fecha válida para tu cumpleaños.\n✐ Ejemplos:\n> ${usedPrefix + command} *01/01/2000* (día/mes/año)\n> ${usedPrefix + command} *01/01* (día/mes/año)`);
    const birth = validarFechaNacimiento(input, currentYear, usedPrefix, command);
    if (typeof birth === 'string' && birth.startsWith('✦'))
      return msg.reply(birth);
    if (!birth)
      return msg.reply(`《✧》 Fecha inválida. Usa › *${usedPrefix + command} 01/01/2000*`);
    db.setUser(msg.sender, 'birth', birth);
    return msg.reply(`✎ Se ha establecido tu fecha de nacimiento como: *${birth}*`);
  },
};

function validarFechaNacimiento(text, currentYear, usedPrefix, command) {
  const formatos = ['DD/MM/YYYY', 'DD/MM', 'D MMM', 'D MMM YYYY'];
  let fecha = null;
  for (const formato of formatos) {
    const f = moment(text, formato, true);
    if (f.isValid()) {
      fecha = f;
      break;
    }
  }
  if (!fecha) return null;
  if (!/\d{4}/.test(text)) {
    fecha.year(currentYear);
  }
  const año = fecha.year();
  const edad = currentYear - año;
  if (año > currentYear) {
    return `✦ El año no puede ser mayor a ${currentYear}. Ejemplo: ${usedPrefix + command} 01/12/${currentYear}`;
  }
  if (edad > 120) {
    return `✦ La fecha establecida es invalida.`;
  }
  if (!fecha.isValid()) return null;
  const diaSemana = fecha.format('dddd');
  const dia = fecha.date();
  const mes = fecha.format('MMMM');
  return `${diaSemana}, ${dia} de ${mes} de ${año}`;
}