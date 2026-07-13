import fs from 'fs';
import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath } from 'url'

global.owner = ['51933000214','584244144821','18093519169']

global.api = {
  url: 'https://api.alyacore.xyz',
  key: 'LUFFY-FIX67' 
}

global.msgglobal = '🏴‍☠️👒 Ocurrió un problema, contacte al creador. ¡Shishishi!'
global.dev = `ʙᴜɪʟᴛ ʙʏ ɴ͡ᴇ͜ɴᴇ❀᭄☂️`

global.mess = {
  socket: '⚓🔗 Este comando solo puede ser ejecutado por un Socket. ¡Gomu Gomu no...!',
  admin: '👑⚔️ Este comando solo puede ser ejecutado por los Administradores del Grupo. ¡Rey de los Piratas!',
  botAdmin: '🤖👒 Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo. ¡Shishishi!',
  nsfw: '🔞🚫 Los comandos de *NSFW* están desactivados en este grupo. ¡No es divertido!',
  comandooff: '💤❌ Estos comandos están desactivados en este grupo. ¡Zzz... Shishishi!'
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
