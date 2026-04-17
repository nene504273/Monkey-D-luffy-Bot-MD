import { tmpdir } from 'os'
import path, { join } from 'path'
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch,
  rmSync
} from 'fs'

let handler = async (m, { conn, usedPrefix: _p, __dirname, args }) => {
  // Emoji por defecto si no está definido en el contexto
  const emoji = global.emoji || '✅'

  const tmpPaths = [tmpdir(), join(__dirname, '../tmp')]
  const archivosEliminados = []
  const directoriosIgnorados = []

  tmpPaths.forEach(dirname => {
    if (!existsSync(dirname)) return
    const elementos = readdirSync(dirname)
    elementos.forEach(elemento => {
      const rutaCompleta = join(dirname, elemento)
      try {
        const stats = statSync(rutaCompleta)
        if (stats.isFile()) {
          unlinkSync(rutaCompleta)
          archivosEliminados.push(rutaCompleta)
        } else if (stats.isDirectory()) {
          // Opcional: eliminar directorios recursivamente (comentar si no se desea)
          // rmSync(rutaCompleta, { recursive: true, force: true })
          // archivosEliminados.push(rutaCompleta + ' (directorio)')
          directoriosIgnorados.push(rutaCompleta)
        }
      } catch (err) {
        console.error(`Error procesando ${rutaCompleta}:`, err)
      }
    })
  })

  let mensaje = `${emoji} Limpieza completada.\n`
  mensaje += `- Archivos eliminados: ${archivosEliminados.length}\n`
  if (directoriosIgnorados.length > 0) {
    mensaje += `- Directorios ignorados: ${directoriosIgnorados.length} (no se eliminan para evitar problemas)`
  }
  conn.reply(m.chat, mensaje, m)
}

handler.help = ['cleartmp']
handler.tags = ['owner']
handler.command = ['cleartmp', 'borrartmp', 'borrarcarpetatmp', 'vaciartmp']
handler.rowner = true

export default handler