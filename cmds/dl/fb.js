import db from "#db";
import fetch from "node-fetch";

export default {
  command: ["fb", "facebook"],
  category: "downloader",
  run: async ({ msg, sock, args, command }) => {
    if (!args.length) {
      return msg.reply("✎ Ingrese uno o varios enlaces de *Facebook*");
    }

    const urls = args.filter((arg) =>
      arg.match(/facebook\.com|fb\.watch|video\.fb\.com/)
    );
    if (!urls.length) {
      return msg.reply("✿ Por favor, envía un link de Facebook válido");
    }

    try {
      const API_URL = "https://api.alyacore.xyz/dl/facebookv2";
      const API_KEY = "LUFFY-FIX67"; // ← cámbialo por api.key si existe

      if (urls.length > 1) {
        const medias = [];
        for (const url of urls.slice(0, 10)) {
          try {
            // 1. Obtener JSON de la API
            const apiRes = await fetch(
              `${API_URL}?url=${encodeURIComponent(url)}&key=${API_KEY}`
            );
            const text = await apiRes.text(); // para depurar
            console.log(`Respuesta para ${url}:`, text);
            const json = JSON.parse(text);

            if (!json.status || !json.data?.dl) {
              console.error(`API error: ${json.msg || 'sin URL'}`);
              continue;
            }

            // 2. Descargar video con headers
            const videoRes = await fetch(json.data.dl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            if (!videoRes.ok) throw new Error(`Descarga fallida ${videoRes.status}`);
            const buffer = await videoRes.buffer();

            medias.push({ type: "video", data: buffer });
          } catch (e) {
            console.error(`Error con ${url}:`, e.message);
            continue;
          }
        }

        if (medias.length) {
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg });
        } else {
          await msg.reply("✿ No se pudieron procesar los enlaces.");
        }
      } else {
        const url = urls[0];

        const apiRes = await fetch(
          `${API_URL}?url=${encodeURIComponent(url)}&key=${API_KEY}`
        );
        const text = await apiRes.text();
        console.log('Respuesta API:', text);
        const json = JSON.parse(text);

        if (!json.status || !json.data?.dl) {
          throw new Error(`API error: ${json.msg || 'sin URL'}`);
        }

        const videoRes = await fetch(json.data.dl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        if (!videoRes.ok) throw new Error(`Descarga fallida ${videoRes.status}`);
        const buffer = await videoRes.buffer();

        await sock.sendMessage(
          msg.chat,
          { video: buffer, mimetype: "video/mp4", fileName: "fb.mp4" },
          { quoted: msg }
        );
      }
    } catch (e) {
      console.error('ERROR GENERAL:', e);
      // En lugar de msgglobal, envía el error real (solo para depuración)
      await msg.reply(`❌ Error: ${e.message}`);
      // Cuando funcione, vuelve a msgglobal
    }
  },
};