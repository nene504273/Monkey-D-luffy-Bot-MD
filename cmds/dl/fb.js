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
      const API_KEY = "LUFFY-FIX67"; // o usa api.key si lo tienes definido

      if (urls.length > 1) {
        const medias = [];
        for (const url of urls.slice(0, 10)) {
          try {
            // 1. Obtener JSON de la API
            const apiRes = await fetch(
              `${API_URL}?url=${encodeURIComponent(url)}&key=${API_KEY}`
            );
            if (!apiRes.ok) throw new Error(`API HTTP ${apiRes.status}`);
            const json = await apiRes.json();
            if (!json.status || !json.data?.dl)
              throw new Error("URL de descarga no disponible");

            // 2. Descargar el video desde la URL obtenida
            const videoRes = await fetch(json.data.dl);
            if (!videoRes.ok) throw new Error(`Descarga fallida ${videoRes.status}`);
            const buffer = await videoRes.buffer();

            medias.push({
              type: "video",
              data: buffer,
            });
          } catch (e) {
            console.error(`Error con ${url}:`, e.message);
            continue; // salta este enlace y sigue con los demás
          }
        }

        if (medias.length) {
          await sock.sendAlbumMessage(msg.chat, medias, { quoted: msg });
        } else {
          await msg.reply("✿ No se pudieron procesar los enlaces.");
        }
      } else {
        const url = urls[0];

        // 1. Obtener JSON de la API
        const apiRes = await fetch(
          `${API_URL}?url=${encodeURIComponent(url)}&key=${API_KEY}`
        );
        if (!apiRes.ok) throw new Error(`API HTTP ${apiRes.status}`);
        const json = await apiRes.json();
        if (!json.status || !json.data?.dl)
          throw new Error("URL de descarga no disponible");

        // 2. Descargar el video
        const videoRes = await fetch(json.data.dl);
        if (!videoRes.ok) throw new Error(`Descarga fallida ${videoRes.status}`);
        const buffer = await videoRes.buffer();

        await sock.sendMessage(
          msg.chat,
          { video: buffer, mimetype: "video/mp4", fileName: "fb.mp4" },
          { quoted: msg }
        );
      }
    } catch (e) {
      console.error(e);
      await msg.reply(msgglobal); // asegúrate de que msgglobal esté definido
    }
  },
};