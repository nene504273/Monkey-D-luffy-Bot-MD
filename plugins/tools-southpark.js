import fetch from 'node-fetch'

const API_KEY = 'LUFFY-GEAR4'
const API_URL = 'https://api.alyacore.xyz/tools/country'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return m.reply(`
📭 *SOLICITUD INCOMPLETA* 📭

Debes indicar el nombre de una nación para continuar.

*Forma de uso:* ${usedPrefix + command} [nombre del país]
*Caso práctico:* ${usedPrefix + command} Noruega

_El atlas permanece cerrado hasta que proporciones un destino._
`.trim())
    }

    await m.react('🌍')
    
    const nombreOperador = m.pushName || 'explorador anónimo'
    await m.reply(`📡 *INICIANDO CONEXIÓN CON LA RED GLOBAL...*\n🌐 Recabando información acerca de *${text}*\n⏳ Un instante, ${nombreOperador}, los datos están en camino...`)

    const respuesta = await fetch(`${API_URL}?name=${encodeURIComponent(text)}&key=${API_KEY}`, {
      method: 'GET',
      timeout: 15000
    })

    if (!respuesta.ok) {
      throw new Error('No se encontró ningún país con ese identificador')
    }

    const datos = await respuesta.json()
    
    if (!datos.status || !datos.result) {
      throw new Error(datos.message || 'Los registros consultados no están disponibles en este momento')
    }

    const p = datos.result

    const poblacionFormateada = p.population ? p.population.toLocaleString('es-ES') : 'desconocida'
    const superficieFormateada = p.area ? `${p.area.toLocaleString('es-ES')} km²` : 'sin datos'
    const monedasTexto = p.currencies && p.currencies.length > 0 
      ? p.currencies.map(m => `${m.name} (${m.symbol})`).join(' · ') 
      : 'información no registrada'
    const fronterasTexto = p.borders && p.borders.length > 0 
      ? p.borders.join(' ↔ ') 
      : 'ninguna (territorio insular o sin vecinos directos)'
    const coordenadasTexto = p.latlng && p.latlng.length === 2
      ? `${p.latlng[0]}°, ${p.latlng[1]}°`
      : 'coordenadas reservadas'

    const informe = `
🗂️ *DOSSIER DE TERRITORIO* 🗂️
*CONSULTA REALIZADA POR:* ${nombreOperador.toUpperCase()}

${p.flag} *${p.name.toUpperCase()}* ${p.flag}
_Denominación oficial:_ ${p.officialName}

📍 *POSICIÓN GEOGRÁFICA*
▸ Capital: ${p.capital}
▸ Continente: ${p.region} · Subregión: ${p.subregion}
▸ Latitud / Longitud: ${coordenadasTexto}
▸ Naciones limítrofes: ${fronterasTexto}

👥 *PERFIL DEMOGRÁFICO*
▸ Habitantes estimados: ${poblacionFormateada}
▸ Extensión territorial: ${superficieFormateada}
▸ Gentilicio: ${p.demonyms.male} (masc.) / ${p.demonyms.female} (fem.)
▸ Lenguas oficiales: ${p.languages}

💰 *PANORAMA ECONÓMICO*
▸ Moneda(s) en circulación: ${monedasTexto}
▸ Índice Gini (desigualdad): ${p.gini ? Object.values(p.gini)[0] + ' (último registro)' : 'No especificado'}

📞 *CÓDIGOS DE IDENTIFICACIÓN*
▸ Prefijo telefónico: +${p.phone}
▸ Dominio internet: ${p.tld}
▸ Matrícula vehicular: ${p.carSigns}
▸ Código ISO: ${p.cca2} / ${p.cca3}

⚖️ *ESTATUS POLÍTICO*
▸ Estado soberano: ${p.independent ? 'Sí' : 'No'}
▸ Miembro de Naciones Unidas: ${p.unMember ? 'Afirmativo' : 'Negativo'}
▸ Sentido de circulación: ${p.carSide === 'right' ? 'derecha' : 'izquierda'}

🗺️ *CARTOGRAFÍA DIGITAL*: ${p.googleMaps}

> 📌 Información extraída del repositorio de *AlyaCore*
> 🕰️ Esta consulta quedará registrada en la bitácora del explorador.
`.trim()

    if (p.flagImage) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: p.flagImage },
          caption: informe
        }, { quoted: m })
      } catch (falloImagen) {
        console.error('No se pudo enviar la bandera:', falloImagen)
        await conn.reply(m.chat, informe, m)
      }
    } else {
      await conn.reply(m.chat, informe, m)
    }

    if (p.coatOfArms) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: p.coatOfArms },
          caption: `🛡️ *EMBLEMA HERÁLDICO DE ${p.name.toUpperCase()}* ${p.flag}`
        }, { quoted: m })
      } catch (falloEscudo) {
        console.error('No se pudo enviar el escudo:', falloEscudo)
      }
    }

    await m.react('✅')

  } catch (error) {
    console.error('Error durante la consulta de país:', error)
    await m.react('❌')
    
    await conn.reply(m.chat, `
⚠️ *CONSULTA FALLIDA* ⚠️

Causa del error: ${error.message}

*Posibles soluciones:*
- Verifica que el nombre del país esté bien escrito.
- Prueba con el nombre en inglés (ej: Germany, Japan, Brazil).
- Ejemplo válido: ${usedPrefix}${command} Francia

_El servicio de cartografía está disponible, inténtalo de nuevo._
`.trim(), m)
  }
}

handler.help = ['country']
handler.tags = ['tools']
handler.command = ['country', 'pais', 'paisinfo', 'countryinfo', 'intel']

export default handler