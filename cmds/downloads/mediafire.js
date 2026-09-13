import axios from 'axios';
import path from 'path';
import { lookup } from 'mime-types';
import cheerio from 'cheerio';

export default {
  command: ['mediafire', 'mf'],
  category: 'downloads',
  description: 'Descargar un archivo de MediaFire.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    if (!text) return msg.reply('《✧》 Por favor, ingresa el enlace de Mediafire.')
    try {
      if (!/^https?:\/\/(www\.)?mediafire\.com\/.+/i.test(text)) {
        return msg.reply('《✧》 Por favor, ingresa un enlace válido de Mediafire.')
      }      
      const scraped = await mediafireDl(text)
      if (!scraped?.downloadLink) return msg.reply(`《✧》 No se pudo obtener el archivo.`)      
      const title = (scraped.filename || 'archivo').trim()
      const ext = path.extname(title) || (scraped.type ? `.${scraped.type}` : '')
      const tipo = lookup(ext.toLowerCase()) || 'application/octet-stream'      
      let info = `✰ ᩧ　𓈒　ׄ　𝖬𝖾𝖽𝗂𝖺𝖥𝗂𝗋𝖾　ׅ　✿\n\n`
      info += `ׄ ﹙ׅ✿﹚ּ *Nombre* › ${title}\n`
      info += `ׄ ﹙ׅ✿﹚ּ *Tipo* › ${tipo}\n`
      if (scraped.size) info += `ׄ ﹙ׅ✿﹚ּ *Peso* › ${scraped.size}\n`
      if (scraped.uploaded) info += `ׄ ﹙ׅ✿﹚ּ *Subido* › ${scraped.uploaded}\n`      
      await sock.sendMessage(msg.chat, { document: { url: scraped.downloadLink }, mimetype: tipo, fileName: title, caption: info, mentions: [msg.sender] }, { quoted: msg })
    } catch (e) {
      return msg.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  },
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
function cleanText(x) {
  return String(x || '').replace(/\s+/g, ' ').trim()
}

function normalizeUrl(u) {
  const s = cleanText(u)
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('//')) return 'https:' + s
  if (s.startsWith('/')) return 'https://www.mediafire.com' + s
  return s
}

function pickFilename($) {
  let filename = cleanText($('.intro .filename').text())
  if (!filename) filename = cleanText($('meta[property="og:title"]').attr('content'))
  if (!filename) filename = cleanText($('title').text())
  return filename || null
}

function pickFiletypeText($) {
  const t = cleanText($('.filetype').text())
  return t || null
}

function pickTypeFromFilename(name) {
  if (!name) return null
  const m = String(name).match(/\.([a-z0-9]{1,10})$/i)
  return m?.[1]?.toLowerCase() || null
}

function pickDetails($) {
  let size = null
  let uploaded = null
  $('ul.details li').each((_, el) => {
    const text = cleanText($(el).text())
    if (!size && /File size:/i.test(text)) size = cleanText($(el).find('span').text()) || null
    if (!uploaded && /Uploaded:/i.test(text)) uploaded = cleanText($(el).find('span').text()) || null
  })
  return { size, uploaded }
}

async function mediafireDl(url, timeout = 45000) {
  const mediafireUrl = cleanText(url)
  if (!mediafireUrl) throw new Error('URL requerida')
  const res = await axios.get(mediafireUrl, { timeout, maxRedirects: 5, headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }, validateStatus: () => true })
  if (res.status < 200 || res.status >= 400) {
    throw new Error(`MediaFire HTTP ${res.status}`)
  }
  const $ = cheerio.load(String(res.data || ''))
  const downloadLinkRaw = $('#downloadButton').attr('href') || $('a#downloadButton').attr('href') || null
  const downloadLink = normalizeUrl(downloadLinkRaw)
  if (!downloadLink) {
    throw new Error('Download link not found')
  }
  const filename = pickFilename($)
  const filetype = pickFiletypeText($)
  const { size, uploaded } = pickDetails($)
  const type = pickTypeFromFilename(filename) || (filetype ? cleanText(filetype).toLowerCase() : null)
  return { downloadLink, filename, filetype, size, uploaded, type }
}