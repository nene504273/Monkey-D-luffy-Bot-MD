import speed from 'performance-now'
import { exec } from 'child_process'

let handler = async (m, { conn }) => {
  let timestamp = speed()
  let latensi = speed() - timestamp

  exec(`neofetch --stdout`, (error, stdout) => {
    // Si hay un error con neofetch, usamos un mensaje base
    let info = stdout ? stdout.toString("utf-8").replace(/Memory:/, "Ram:") : ""
    
    let txt = `*⊜ PONG — VELOCIDAD*\n\n`
    txt += `┌  ◎  *Latencia* : ${latensi.toFixed(4)} ms\n`
    txt += `└  ◎  *Estado* : Funcional\n\n`
    
    // Si quieres mostrar algo de neofetch de forma elegante:
    if (info) {
      txt += `*💻 INFORMACIÓN DEL SISTEMA*\n`
      txt += `> ${info.trim().split('\n').join('\n> ')}`
    }

    conn.reply(m.chat, txt.trim(), m)
  })
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']
handler.register = true

export default handler