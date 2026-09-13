import { watchFile, unwatchFile } from "fs";
import chalk from "chalk";
import { fileURLToPath } from "url";

global.owner = ['584244144821', '51933000214'];

global.dev = "© powered by Luffy";
global.links = {
  api: 'https://api.alyacore.xyz',
  channel: "https://whatsapp.com/channel/0029VbBNkDqInlqSR3MtNN0u",
  github: "https://github.com/nene504273/Monkey-D-luffy-Bot-MD",
  gmail: ""
}
global.my = {
  ch1: '120363420846835529@newsletter'
};

global.APIs = { 
  yuki: { url: "https://api.alyacore.xyz", key: "LUFFY-FIX67" },
  vreden: { url: "https://api.vreden.web.id", key: null },
  ootaizumi: { url: "https://api.ootaizumi.web.id", key: null },
  delirius: { url: "https://api.delirius.online", key: null },
  zenzxz: { url: "https://api.zenzxz.my.id", key: null },
  siputzx: { url: "https://app.siputzx.my.id", key: null }
};

global.mess = {
  socket: '《✧》 Este comando solo puede ser ejecutado por un Socket.',
  admin: '《✧》 Este comando solo puede ser ejecutado por los Administradores del Grupo.',
  botAdmin: '《✧》 Este comando solo puede ser ejecutado si el Socket es Administrador del Grupo.'
};

let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  import(`${file}?update=${Date.now()}`);
});
