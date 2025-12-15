import fetch from 'node-fetch'; // Asegúrate de que node-fetch esté disponible si lo vas a usar

const handler = async (m, { conn, args, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  // 1. Validar que se haya respondido a una imagen
  if (!mime || !/image\/(jpe?g|png)/.test(mime))  
    throw `📸 Responde a una imagen con *${usedPrefix + command}* para mejorarla en HD.`;

  try { // <<< CORRECCIÓN: Se agrega la llave de apertura del bloque try
    await m.reply('🛠️ Procesando imagen, subiéndola y mejorándola... espera un momento.');

    // 2. Descargar y subir la imagen para obtener una URL pública
    const img = await q.download(); // Usa q.download() para obtener el buffer directamente
    let url_subida = await uploadImage(img);

    // 3. Construir el enlace de la API de upscale
    // Aquí se utiliza el Template Literal (backticks) para inyectar la URL subida
    let api_url_final = `https://rest.alyabotpe.xyz/tools/upscale?url=${encodeURIComponent(url_subida)}&key=stellar-eFNHF99t`;
    
    // 4. Enviar la imagen resultante
    // Usamos conn.sendFile con la URL de la API. La API debe devolver el archivo de imagen directamente.
    await conn.sendFile(m.chat, api_url_final, 'hd-image.jpg', '🖼️ Aquí tienes tu imagen mejorada.', m);

  } catch (e) {
    // Si la API no funciona o falla la conexión/subida
    console.error(e); // Mostrar el error completo en la consola
    m.reply('❌ Ocurrió un error al procesar la imagen. Verifica la URL de la imagen y la clave de la API.');
  }
};

handler.help = ['hd'];
handler.tags = ['tools'];
handler.command = ['hd'];
handler.register = true;

export default handler;

/**
 * Función para subir el buffer de la imagen y obtener una URL.
 * @param {Buffer} buffer - El buffer de la imagen.
 * @returns {Promise<string>} La URL de visualización.
 */
async function uploadImage(buffer) {
  // Asegúrate de que 'imgbb-uploader' esté instalado (npm install imgbb-uploader)
  const { default: upload } = await import('imgbb-uploader');
  
  // Si necesitas usar una clave de imgbb, añádela al objeto de configuración:
  // const data = await upload({ apiKey: 'TU_CLAVE_IMGBB', name: 'image', buffer });
  
  const data = await upload({ name: 'image', buffer });
  return data.display_url;
}