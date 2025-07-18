import FormData from "form-data";
import Jimp from "jimp";
import https from "https";

// Emojis y frases de Luffy y su mundo
const luffyEmoji = "🍖🏴‍☠️";
const luffyPhrase1 = "¡Oye, Nakama! ¡Responde a una imagen para que la vuelva más épica!";
const luffyPhrase2 = "¡Eso no es una imagen válida! Usa formato JPG o PNG, ¿vale?";
const luffyPhrase3 = "¡Vamos a hacerla más HD que una fruta del diablo brillante!";
const luffyError = "¡Maldita sea! ¡La imagen se nos escapó como un Pacifista! 😤";

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || "";

    if (!mime) {
      return m.reply(`${luffyEmoji} ${luffyPhrase1}`);
    }

    if (!/image\/(jpe?g|png)/.test(mime)) {
      return m.reply(`${luffyEmoji} ${luffyPhrase2}`);
    }

    await conn.reply(m.chat, `${luffyEmoji} ${luffyPhrase3} ¡Activando el Haki del Rey!...`, m);

    const imgBuffer = await q.download?.();
    if (!imgBuffer) return m.reply(`${luffyError} No pude descargar la imagen.`);

    const result = await remini(imgBuffer, "enhance");

    if (!result || !Buffer.isBuffer(result)) {
      return m.reply(`${luffyError} No se pudo mejorar la imagen. El Going Merry se hundió 🥲`);
    }

    await conn.sendMessage(m.chat, { image: result }, { quoted: m });

  } catch (error) {
    console.error(error);
    return m.reply(`${luffyError} Ocurrió un error inesperado. ¡Llama a Franky para arreglar esto!`);
  }
};

handler.help = ["remini", "hd", "enhance"];
handler.tags = ["ai", "tools"];
handler.command = ["luffyhd", "gomuHD", "onepiecehd"];
handler.group = true;
handler.register = true;

export default handler;

async function remini(imageBuffer, operation) {
  return new Promise((resolve, reject) => {
    const ops = ["enhance", "recolor", "dehaze"];
    if (!ops.includes(operation)) operation = "enhance";

    const form = new FormData();
    form.append("image", imageBuffer, { filename: "image.jpg", contentType: "image/jpeg" });
    form.append("model_version", "1");

    const request = https.request(
      {
        method: "POST",
        hostname: "inferenceengine.vyro.ai",
        path: `/${operation}`,
        headers: {
          ...form.getHeaders(),
          "User-Agent": "okhttp/4.9.3"
        }
      },
      (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error("Respuesta inesperada del Marine: " + res.statusCode));
        }
        const data = [];
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => resolve(Buffer.concat(data)));
      }
    );

    request.on("error", reject);
    form.pipe(request);
  });
}