import fetch from "node-fetch"

const API_KEY = "LUFFY-GEAR5"

const handler = async (m, { conn, text }) => {
  try {
    if (!text.trim()) {
      return conn.reply(
        m.chat,
        `⌜ T I K T O K  S T A L K ⌟\n` +
        `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n` +
        `◈ Ingresa el usuario de\n` +
        `  TikTok que deseas buscar\n` +
        `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n` +
        `◉ Uso: .ttstalk <usuario>`,
        m
      )
    }

    const buscando = await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    const res = await fetch(`https://rest.apicausas.xyz/api/v1/stalk/tiktok?apikey=${API_KEY}&q=${encodeURIComponent(text.trim())}`)
    const json = await res.json()

    if (!json?.status) {
      await conn.sendMessage(m.chat, { react: { text: '✖', key: m.key } })
      throw new Error(json?.msg || "No se encontró el perfil")
    }

    const d = json
    const thumb = d.avatar ? await getBuffer(d.avatar) : null

    const msg =
      `⌜ T I K T O K  S T A L K ⌟\n` +
      `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n` +
      `◈ Usuario  ┊ ${d.nickname || d.username}\n` +
      `◈ Perfil   ┊ @${d.username}\n` +
      `◈ Bio      ┊ ${d.bio || "Sin biografía"}\n` +
      `◈ Verificado ┊ ${d.verified ? "Si" : "No"}\n` +
      `◈ Privado  ┊ ${d.private ? "Si" : "No"}\n` +
      `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n` +
      `⟡ E S T A D I S T I C A S\n` +
      `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n` +
      `◉ Seguidores ┊ ${d.followers}\n` +
      `◉ Siguiendo  ┊ ${d.following}\n` +
      `◉ Likes      ┊ ${d.likes}\n` +
      `◉ Videos     ┊ ${d.videos}\n` +
      `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n` +
      `⌞ ${d.url} ⌝`

    await conn.sendMessage(m.chat, { react: { text: '✔', key: m.key } })

    if (thumb) {
      await conn.sendMessage(
        m.chat,
        { image: thumb, caption: msg },
        { quoted: m }
      )
    } else {
      await conn.reply(m.chat, msg, m)
    }

  } catch (e) {
    conn.reply(
      m.chat,
      `⌜ T I K T O K  S T A L K ⌟\n` +
      `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n` +
      `✖ Error: ${e.message}\n` +
      `┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄`,
      m
    )
  }
}

handler.command = ['ttstalk', 'tiktokstalk', 'tiktok']
handler.help = ["ttstalk", "tiktokstalk", "tiktok"]
handler.tags = ["stalk"]

export default handler