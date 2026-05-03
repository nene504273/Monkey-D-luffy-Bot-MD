import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m

handler.all = async function (m) {

global.getBuffer = async function getBuffer(url, options) {
  try {
    options ? options : {}
    var res = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'User-Agent': 'GoogleBot',
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    })
    return res.data
  } catch (e) {
    console.log(`Error : ${e}`)
  }
}

// Lista de iconos
const iconUrls = [
  "https://cdn.adoolab.xyz/dl/61188594.jpeg", 
  "https://cdn.adoolab.xyz/dl/ec5d1c7e.jpeg", 
  "https://cdn.adoolab.xyz/dl/a46ff7ad.jpeg", 
  "https://cdn.adoolab.xyz/dl/f9038604.jpeg", 
  "https://cdn.adoolab.xyz/dl/9ab5796c.jpeg"
]

// Función para elegir y descargar un icono aleatorio
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const iconUrl = pickRandom(iconUrls)
global.icono = await getBuffer(iconUrl)

global.fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

//creador y otros
global.creador = 'Wa.me/04244144821'
global.ofcbot = `${conn.user.jid.split('@')[0]}`
global.asistencia = 'Wa.me/04244144821'
global.namechannel = '🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️'
global.namechannel2 = '⟡『 𝐓𝐞𝐚𝐦 𝐂𝐡𝐚𝐧𝐧𝐞𝐥: 🏴‍☠️MONKEY • D • L U F F Y🏴‍☠️'
global.namegrupo = '࿐ 𝙈𝙤𝙣𝙠𝙚𝙮 𝘿. 𝙇𝙪𝙛𝙛𝙮 ⟦ 𝘽𝙤𝙩 𝙊𝙁𝙁𝙄𝘾𝙄𝘼𝙇 ⟧🏴‍☠️'
global.namecomu = '⚡ᴍᴏɴᴋᴇʏ.ᴅ.ʟᴜꜰꜰʏ⚡'
global.listo = '❀ *Aquí tienes ฅ^•ﻌ•^ฅ*'
global.fotoperfil = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')

//Ids channel
global.canalIdM = ["120363420846835529@newsletter", "120363420846835529@newsletter"]
global.canalNombreM = ["⏤͟͞ू⃪፝͜⁞⟡『 𝐓͢ᴇ𝙖፝ᴍ⃨ 𝘾𝒉꯭𝐚𝑛𝑛𝒆𝑙: 𝑹ᴜ⃜ɓ𝑦-𝑯ᴏ𝒔𝑯𝙞꯭𝑛𝒐 』࿐⟡", "⟡『 𝙲𝙰𝙽𝙰𝙻 𝙾𝙵𝙸𝙲𝙸𝙰𝙻: 𝐌𝐎𝐍𝐊𝐄𝐘 𝐃. 𝐋𝐔𝐅𝐅𝐘』⟡"]
global.channelRD = await getRandomChannel()

//fechas
global.d = new Date(new Date + 3600000)
global.locale = 'es'
global.dia = d.toLocaleDateString(locale, {weekday: 'long'})
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'})
global.mes = d.toLocaleDateString('es', {month: 'long'})
global.año = d.toLocaleDateString('es', {year: 'numeric'})
global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})

//Reacciones De Comandos
global.rwait = '🕒'
global.done = '✅'
global.error = '✖️'
global.msm = '❌'

//Emojis Rubyi Bot
global.emoji = '🏴‍☠️'
global.emoji2 = '🍖'
global.emoji3 = '📌'
global.emoji4 = '⚔️'
global.emoji5 = '⚓'
global.emojis = [emoji, emoji2, emoji3, emoji4].getRandom()

//Espera
global.wait = '⚘𖠵⃕❖𖥔 𝑪𝒂𝒓𝒈𝒂𝒏𝒅𝒐...ꪶꪾ❍̵̤̂ꫂ\n❝ 𝐴𝑔𝑢𝑎𝑟𝑑𝑒 𝑢𝑛 𝑚𝑜𝑚𝑒𝑛𝑡𝑜 ❞';

//Enlaces
var canal = 'https://whatsapp.com/channel/0029VbBNkDqInlqSR3MtNN0u'
let canal2 = 'https://whatsapp.com/channel/0029VbBNkDqInlqSR3MtNN0u'
var git = 'https://github.com/nene504273'
var github = 'https://github.com/nene504273/Monkey-D-luffy-Bot-MD' 
let correo = 'santosgsalas24@gmail.com'
global.redes = [canal, canal2, git, github, correo].getRandom()

//Imagen aleatoria
let category = "imagen"
const db = './src/database/db.json'
const db_ = JSON.parse(fs.readFileSync(db))
const random = Math.floor(Math.random() * db_.links[category].length)
const randomlink = db_.links[category][random]
const response = await fetch(randomlink)
const rimg = await response.buffer()
global.icons = rimg

// Saludo por hora
var ase = new Date(); var hour = ase.getHours();
switch(hour){
  case 0: case 1: case 2: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; break;
  case 3: case 4: case 5: case 6: case 8: case 9: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; break;
  case 7: hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌅'; break;
  case 10: case 11: case 12: case 13: hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'; break;
  case 14: case 15: case 16: case 17: hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌆'; break;
  default: hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'
}
global.saludo = hour

//tags
global.nombre = m.pushName || 'Anónimo'
global.taguser = '@' + m.sender.split("@")[0]
var more = String.fromCharCode(8206)
global.readMore = more.repeat(850)

global.packsticker = `°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°\nᰔᩚ Usuario: ${nombre}\n❀ Bot: ${botname}\n✦ Fecha: ${fecha}\nⴵ Hora: ${tiempo}`;

// rcanaɭ con icono como buffer
global.rcanal = {
  contextInfo: {
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelRD.id,
      serverMessageId: 100,
      newsletterName: channelRD.name,
    },
    externalAdReply: {
      showAdAttribution: true,
      title: botname,
      body: dev,
      mediaUrl: null,
      description: null,
      previewType: "PHOTO",
      thumbnail: global.icono,
      sourceUrl: global.redes,
      mediaType: 1,
      renderLargerThumbnail: false
    },
  }
}

}

export default handler

async function getRandomChannel() {
  let randomIndex = Math.floor(Math.random() * canalIdM.length)
  let id = canalIdM[randomIndex]
  let name = canalNombreM[randomIndex]
  return { id, name }
}
