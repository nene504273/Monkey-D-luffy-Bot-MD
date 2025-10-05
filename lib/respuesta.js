// --- VALORES NECESARIOS PARA LA NUEVA FUNCIONALIDAD ---
const newsletterJid = '120363420846835529@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡ m᥆ᥒkᥱᥡ ძ ᥣᥙ𝖿𝖿ᥡ';
const packname = '🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️';

// Array de miniaturas con estilo pirata
const iconos = [
  'https:                    
  '//qu.ax/kCFBu.jpeg',
  'https://qu.ax/oywhU.jpeg',
  'https:                    
  '//qu.ax/OqruN.jpeg',
  'https://qu.ax/EQNsz.jpeg',
  'https:                    
  '//qu.ax/zKJLa.jpeg',
  'https://qu.ax/jSfLz.jpg',
  'https:                   
  '//qu.ax/vEYfK.jpg',
  'https://qu.ax/cQVWG.jpg',
  'https:                   
  '//qu.ax/aKHwP.jpg',
  'https://qu.ax/jpdRe.jpg',
  'https:                   
  '//qu.ax/DomyS.jpg',
  'https://qu.ax/fwbjQ.jpg',
  'https:                   
  '//qu.ax/gqMcL.jpg',
  'https://qu.ax/oYaOd.jpg',
  'https:                    
];

                                                
const getRandomIcono = () => iconos[Math.floor(Math.random() * iconos.length)];

                                                                                                              
const handler = (type, conn, m, comando) => {
  const msg = {
    rowner: '//qu.ax/krkFy.jpeg',
];

// Función para obtener una miniatura aleatoria
const getRandomIcono = () => iconos[Math.floor(Math.random() * iconos.length)];

/**
 * Plugin centralizado para manejar todos los mensajes de error de permisos al estilo Monkey D. Luffy.
 */
const handler = (type, conn, m, comando) => {
  const msg = {
    rowner: '「⚓」 *¡Gomu Gomu no Mi! Solo mi capitán Nakama puede usar esto...* 🏴‍☠️\n\n> *Monkey D. Luffy-sama.*',
    owner: '「🌪️」 *¡Gear 4th! Solo mi tripulación One Piece puede manejar este comando~!* 🦜💪',
    mods: '「🔥」 *¡Asalto Pirata! Mis nakamas desarrolladores pueden usar esto~!* ⚔️',
    premium: '「🍖」 *¡Ramen Premium! Esta función es solo para nakamas Premium-desu~!* 🍜✨\n\n💫 *¿Quieres ser Premium? ¡Únete a la tripulación con:*\n> ✨ *.comprarpremium 2 dias* (o el tiempo que quieras, amigo).',
    group: '「👥」 *¡Nakamas! Este comando es solo para grupos como la tripulación Sombrero de Paja~!* 🐒',
    private: '「💌」 *¡Mensaje secreto de Luffy! Este comando es solo para ti y para mí, nakama~* 🤫',
    admin: '「👑」 *¡Rey de los Piratas! Solo los admin-nakamas pueden usar esta habilidad~!* 🏴‍☠️',
    botAdmin: '「🔧」 *¡Necesito poderes de admin! Para que este comando funcione, hazme admin, amigo~*\n\n🔧 *¡Desataré el Gear 5th!*',
    unreg: `🍜 ¡Oh no, nakama! *¡Aún no te has unido a la tripulación~!* 😿\nNecesito conocerte para usar mis poderes~ ✨\n\n📝 Por favor únete con:\n */reg nombre.edad*\n\n🎶 Ejemplo pirata:\n */reg Luffy-kun.19*\n\n💖 ¡Así serás parte de los Sombrero de Paja~! (⁎˃ᴗ˂⁎)`,
    restrict: '「⛔」 *¡Gomu Gomu no funciona ahora! Esta función está dormida por ahora~* 💤'
  }[type];

  if (msg) {
    const contextInfo = {
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid,
        newsletterName,
        serverMessageId: -1
      },
      externalAdReply: {
        title: packname,
        body: '🏴‍☠️ ¡Yooo-hooo! Soy Monkey D. Luffy, el futuro Rey de los Piratas 🦜',
        thumbnailUrl: getRandomIcono(),                                   
        sourceUrl: '// ← aleatoria con estilo pirata
        sourceUrl: 'https://onepiece.fandom.com/es/wiki/Monkey_D._Luffy',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    return conn.reply(m.chat, msg, m, { contextInfo }).then(_ => m.react('⚓'));
  }

  return true;
};

export default handler;