import FormData from "form-data";
import Jimp from "jimp";
import https from "https";

// Emojis y frases con temática de Luffy y piratas
const luffyEmoji = "🏴‍☠️";
const luffyPhrase1 = "¡Prepárense para la aventura!";
const luffyPhrase2 = "¡Rumbo a la alta mar!";
const luffyPhrase3 = "¡El Rey de los Piratas quiere esta imagen en HD!";
const luffyError = "¡Parece que el Grand Line nos jugó una mala pasada! 😥";

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || "";

    if (!mime) {
      return m.reply(`${luffyEmoji} ${luffyPhrase1} Por favor, responde a una imagen para mejorarla a *HD*`);
    }

    if (!/image\/(jpe?g|png)/.test(mime)) {
      return m.reply(`${luffyEmoji} ${luffyPhrase2} ¡El formato del archivo (${mime}) no es válido! Usa JPG o PNG.`);
    }

    await conn.reply(m.chat, `${luffyEmoji} ${luffyPhrase3} ¡Mejorando la calidad con Haki del Rey!...`, m);

    const imgBuffer = await q.download?.();
    if (!imgBuffer) return m.reply(`${luffyError} No pude descargar la imagen.`);

    const result = await remini(imgBuffer, "enhance");

    if (!result || !Buffer.isBuffer(result)) {
      return m.reply(`${luffyError} No se pudo mejorar la imagen.`);
    }

    await conn.sendMessage(m.chat, { image: result }, { quoted: m });

  } catch (error) {
    console.error(error);
    return m.reply(`${luffyError} Ocurrió un error inesperado. Intenta más tarde.`);
  }
};

handler.help = ["remini", "hd", "enhance"];
handler.tags = ["ai", "tools"];
handler.command = ["remini", "hd", "enhance"];
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
          return reject(new Error("Respuesta inesperada: " + res.statusCode));
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
