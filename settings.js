import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

global.owner = ['51933000214','584244144821']

global.api = {
  url: 'https://api.alyacore.xyz',
  key: 'LUFFY-FIX67' 
}

global.msgglobal = '✿⸝꙳.˖ Ocurrió un problema, contacte al creador'
global.dev = `ʙᴜɪʟᴛ ʙʏ ɪ'ᴍ ᴅɪᴇɢᴏ ♡`

global.mess = {
  socket: '(∩´͈ ᴖ `͈∩ ྀི) Este comando solo puede ser ejecutado por un Socket.',
  admin: '٩ʕ◕౪◕ʔو Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '(𓂂꜆◕⩊◕꜀𓂂) Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.',
  nsfw: '(•ૢ⚈͒⌄⚈͒•ૢ) Los comandos de *NSFW* están desactivados en este grupo.',
  comandooff: 'ღゝ◡╹ )ノ Estos comandos estan desactivados en este grupo.'
}

global.my = {
ch: "120363420846835529@newsletter", // Setzo
ch2: "120363420846835529@newsletter" // Otro setzo
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  import(`${file}?update=${Date.now()}`)
})
