import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path'; // Se añade 'path' para una búsqueda de archivos más segura

let handler = async (m, { conn, usedPrefix, command }) => {
  let randomImageURL;

  // --- INICIO DEL SISTEMA DE BÚSQUEDA MEJORADO ---
  try {
    // 1. Se construye la ruta absoluta al archivo, sin importar dónde esté el comando.
    const dbPath = path.join(process.cwd(), 'src', 'database', 'db.json');
    
    // 2. Se lee el archivo y se parsea el JSON.
    const dbRaw = fs.readFileSync(dbPath);
    const mediaLinks = JSON.parse(dbRaw).links; // Se accede directamente a la clave 'links'

    // 3. Se verifica que la lista de imágenes exista y no esté vacía.
    if (mediaLinks && mediaLinks.imagen && mediaLinks.imagen.length > 0) {
      randomImageURL = mediaLinks.imagen[Math.floor(Math.random() * mediaLinks.imagen.length)];
    } else {
      // Si la lista 'imagen' no existe o está vacía, se informa al usuario.
      console.log("ADVERTENCIA: La clave 'links.imagen' no existe o está vacía en db.json.");
      return m.reply('Actualmente no hay imágenes disponibles para mostrar. 😥');
    }
  } catch (e) {
    // 4. Si hay cualquier error al leer o encontrar el archivo, se notifica y se detiene.
    console.error("Error al leer o parsear src/database/db.json:", e);
    return conn.reply(m.chat, 'Error: No pude encontrar la base de datos de imágenes. ☠️', m);
  }
  // --- FIN DEL SISTEMA DE BÚSQUEDA ---

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

  // Se envía la imagen aleatoria con el texto.
  await conn.sendFile(m.chat, randomImageURL, "grupos.jpg", grupos, m);
  await m.react(emojis);
};

handler.help = ['grupos'];
handler.tags = ['info'];
handler.command = ['grupos', 'links', 'groups'];

export default handler;
