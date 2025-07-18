import FormData from "form-data";
import Jimp from "jimp";

// Emojis y frases con temática de Luffy y piratas
const luffyEmoji = "🏴‍☠️";
const luffyPhrase1 = "¡Prepárense para la aventura!";
const luffyPhrase2 = "¡Rumbo a la alta mar!";
const luffyPhrase3 = "¡El Rey de los Piratas quiere esta imagen en HD!";
const luffyError = "¡Parece que el Grand Line nos jugó una mala pasada! 😥";

const handler = async (m, {conn, usedPrefix, command}) => {
 try {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || "";

  if (!mime) {
    return m.reply(`${luffyEmoji} ${luffyPhrase1} Por favor, ¡responde a una imagen para mejorarla a *HD*!`);
  }

  if (!/image\/(jpe?g|png)/.test(mime)) {
    return m.reply(`${luffyEmoji} ${luffyPhrase2} ¡El formato del archivo (${mime}) no es el adecuado! Envía o responde a una imagen JPG o PNG, ¡nakama!`);
  }

  conn.reply(m.chat, `${luffyEmoji} ${luffyPhrase3} ¡Mejorando la calidad de tu imagen, con la fuerza de un Gear Third!...`, m);

  let img = await q.download?.();
  if (!img) {
      return m.reply(`${luffyError} No pude descargar la imagen. ¿Seguro que es válida?`);
  }

  let pr = await remini(img, "enhance");

  if (pr) {
    conn.sendMessage(m.chat, {image: pr}, {quoted: m});
  } else {
    return m.reply(`${luffyError} No pude mejorar la imagen. ¡Tal vez un enemigo se interpuso!`);
  }

 } catch (error) {
    console.error(error); // Para depuración, puedes quitarlo en producción
    return m.reply(`${luffyError} ¡Ocurrió un error inesperado en nuestro viaje! Intenta de nuevo, ¡capitán!`);
 }
};

handler.help = ["remini", "hd", "enhance"];
handler.tags = ["ai", "tools"];
handler.command = ["remini", "hd", "enhance"];
handler.group = true;
handler.register = true;

export default handler;

async function remini(imageData, operation) {
  return new Promise(async (resolve, reject) => {
    const availableOperations = ["enhance", "recolor", "dehaze"];
    if (!availableOperations.includes(operation)) {
      operation = availableOperations[0]; // Establecer 'enhance' como predeterminado si la operación no es válida
    }

    const baseUrl = "https://inferenceengine.vyro.ai/" + operation + ".vyro";
    const formData = new FormData();
    formData.append("image", Buffer.from(imageData), {filename: "enhance_image_body.jpg", contentType: "image/jpeg"});
    formData.append("model_version", 1, {"Content-Transfer-Encoding": "binary", contentType: "multipart/form-data; charset=utf-8"});

    formData.submit({
        url: baseUrl,
        host: "inferenceengine.vyro.ai",
        path: "/" + operation,
        protocol: "https:",
        headers: {
            "User-Agent": "okhttp/4.9.3",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip"
        }
    },
      function (err, res) {
        if (err) return reject(err);

        const chunks = [];
        res.on("data", function (chunk) {chunks.push(chunk)});
        res.on("end", function () {resolve(Buffer.concat(chunks))});
        res.on("error", function (err) {
            reject(err);
        });
      },
    );
  });
}