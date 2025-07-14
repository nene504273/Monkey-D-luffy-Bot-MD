import fetch from 'node-fetch';
import fs from 'fs';

let handler = async (m, { conn, usedPrefix, command }) => {
  let randomImageURL;
  const dbPath = '../src/database/db.json';

  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const database = JSON.parse(data);

    // 1. Acceder a la ruta correcta: database.links.imagen
    const imageList = database.links?.imagen;

    // 2. Verificar que la lista exista y no esté vacía
    if (imageList && imageList.length > 0) {
      // Seleccionar una URL de imagen al azar
      randomImageURL = imageList[Math.floor(Math.random() * imageList.length)];
    } else {
      // Si no hay imágenes, responder al usuario y detener el comando
      console.log("La ruta 'links.imagen' no existe o está vacía en db.json.");
      return m.reply('No hay imágenes disponibles para mostrar en este momento. 😥');
    }
  } catch (error) {
    // Si hay un error al leer el archivo, informar y detener
    console.error("Error al procesar el archivo db.json:", error);
    return m.reply('Ocurrió un error al intentar obtener una imagen. 😕');
  }

  // Si todo salió bien, 'randomImageURL' tendrá un valor y el código continúa
  let grupos = `*Hola!, te invito a unirte a los grupos oficiales del Bot para convivir con la comunidad.....*

- ${namegrupo}
> *❀* ${gp1}

${namecomu}
> *❀* ${comunidad1}

*ׄ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ─ׅ─ׄ⭒─ׄ*

⚘ Enlace anulado? entre aquí! 

- ${namechannel}
> *❀* ${channel}

> ${dev}`;

  // Enviar la imagen aleatoria obtenida
  await conn.sendFile(m.chat, randomImageURL, "grupos.jpg", grupos, m);

  await m.react(emojis);
};

handler.help = ['grupos'];
handler.tags = ['info'];
handler.command = ['grupos', 'links', 'groups'];

export default handler;
