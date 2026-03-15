}

    // ----------------------------------------------------
    // [PASO 3] DESCARGAR IMAGEN ESCALADA
    // ----------------------------------------------------
    const downloadUrl = upscaleData.result.download;

    const downloadResponse = await fetch(downloadUrl);

    if (!downloadResponse.ok) {
        throw new Error(`¡El tesoro se hundió! No pude descargar la imagen. HTTP ${downloadResponse.status}.`);
    }

    const bufferHD = Buffer.from(await downloadResponse.arrayBuffer());

    let textoLuffy = `
🍖 *¡SHISHISHI! ¡MIRA ESTO! Aquí tienes tu imagen en HD (${scaleFactor}x).*
> *Peso del botín:* ${formatBytes(bufferHD.length)}
> ¡Ahora se ve tan clara como el camino hacia el One Piece! 🌊

🍖 *¡Eso me dio hambre! ¿Alguien dijo carne?*
`;

    await conn.sendMessage(
      m.chat,
      {
        image: bufferHD,
        caption: textoLuffy.trim(),
      },
      { quoted: m }
    );

    await m.react('🍖'); // Reacción de carne para celebrar

  } catch (e) {
    // Manejo de errores al estilo Luffy
    await m.react('❌');
    return conn.reply(
      m.chat,
      `¡GOMU GOMU NO... ERROR! 💥\n\nAlgo salió mal en la navegación... ¡Seguro fue culpa de Zoro que nos perdió!\n\n*Reporte del Log:* ${e.message}`,
      m
    );
  }
};

handler.help = ["hd"];
handler.tags = ["ai"];
handler.command = ["hd", "upscale", "luffyhd"]; // Añadí un par de alias divertidos
export default handler;