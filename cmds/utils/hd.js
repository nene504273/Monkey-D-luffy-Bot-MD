import crypto from 'crypto'
import fileTypePkg from 'file-type'
import { promises as fsp } from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

const { fileTypeFromBuffer } = fileTypePkg
const fetchFn = fetch

export default {
  command: ['hd', 'enhance', 'remini'],
  category: 'utils',
  description: 'Mejorar la calidad de una imagen.',
  run: async ({ msg, sock, args, usedPrefix, command, text }) => {
    try {
      const q = msg.quoted || msg
      const mime = q?.mimetype || q?.msg?.mimetype || ''
      if (!mime)
        return msg.reply(`《✧》 Responde a una *imagen* con:\n${usedPrefix + command}`)
      if (!/^image\/(jpe?g|png|webp)$/i.test(mime))
        return msg.reply(`《✧》 El formato *${mime}* no es compatible`)
      const buffer = await q.download?.()
      if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 10)
        return msg.reply('《✧》 No se pudo descargar la imagen')
      const ft = await safeFileType(buffer)
      const resolvedMime = ft?.mime || mime
      if (!/^image\/(jpe?g|png|webp)$/i.test(resolvedMime))
        return msg.reply(`《✧》 El formato *${resolvedMime}* no es compatible`)
      const result = await vectorinkEnhanceFromBuffer(buffer, resolvedMime)
      if (!result?.ok || !result?.buffer) {
        const msg = result?.error?.code || result?.error?.step || result?.error?.message || 'error desconocido'
        return msg.reply(`《✧》 No se pudo *mejorar* la imagen (${msg})`)
      }
      await sock.sendMessage(msg.chat, { image: result.buffer, caption: '' }, { quoted: msg })
    } catch (e) {
      console.error(e)
      await msg.reply(`> Ocurrió un error inesperado ejecutando *${usedPrefix + command}*.\n> [Error: *${e?.message || String(e)}*]`)
    }
  }
}

async function safeFileType(buf) {
  try {
    return await fileTypeFromBuffer(buf)
  } catch {
    return null
  }
}

async function safeJson(res) {
  const text = await res.text().catch(() => '')
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

function extFromMime(mime) {
  if (/png/i.test(mime)) return 'png'
  if (/webp/i.test(mime)) return 'webp'
  return 'jpg'
}

function buildAbortSignal(ms) {
  if (typeof AbortSignal?.timeout === 'function') return AbortSignal.timeout(ms)
  const ctrl = new AbortController()
  setTimeout(() => ctrl.abort(), ms)
  return ctrl.signal
}

function runFfmpeg(args, timeoutMs = 60_000) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL') } catch {}
      reject(new Error('ffmpeg timeout'))
    }, timeoutMs)
    proc.stderr.on('data', (d) => (stderr += d.toString()))
    proc.on('error', (e) => { clearTimeout(timer); reject(e) })
    proc.on('close', (code) => {
      clearTimeout(timer)
      code === 0 ? resolve(true) : reject(new Error(stderr || `ffmpeg salió con código ${code}`))
    })
  })
}

async function webpToPng(webpBuf, tmpDir) {
  const ft = await safeFileType(webpBuf)
  if (ft?.mime && !/^image\/(webp|png|jpe?g)$/i.test(ft.mime))
    return { ok: false, error: `formato inesperado de la API: ${ft.mime}` }
  const tag = `${Date.now()}_${Math.random().toString(16).slice(2)}`
  const inPath = path.join(tmpDir, `vi_in_${tag}.webp`)
  const outPath = path.join(tmpDir, `vi_out_${tag}.png`)
  await fsp.writeFile(inPath, webpBuf)
  try {
    await runFfmpeg(['-y', '-i', inPath, '-frames:v', '1', outPath], 60_000)
    const png = await fsp.readFile(outPath)
    return { ok: true, png }
  } catch (e) {
    return { ok: false, error: e?.message || String(e) }
  } finally {
    await fsp.unlink(inPath).catch(() => {})
    await fsp.unlink(outPath).catch(() => {})
  }
}

async function vectorinkEnhanceFromBuffer(inputBuf, inputMime) {
  const API = 'https://us-central1-vector-ink.cloudfunctions.net/upscaleImage'
  const ORIGIN = 'https://vectorink.io'
  const TIMEOUT = 120_000
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
  const out = { ok: false, provider: 'vectorink.io', meta: { inputMime, inputSize: inputBuf.length } }
  const tmpDir = path.join(os.tmpdir(), 'vectorink')
  try {
    await fsp.mkdir(tmpDir, { recursive: true })
    const b64 = inputBuf.toString('base64')
    const res = await fetchFn(API, { method: 'POST', headers: { 'content-type': 'application/json', accept: '*/*', origin: ORIGIN, referer: `${ORIGIN}/`, 'user-agent': UA }, body: JSON.stringify({ data: { image: b64 } }), signal: buildAbortSignal(TIMEOUT) })
    const j = await safeJson(res)
    if (!res.ok) {
      out.error = { step: 'request', status: res.status, body: j }
      return out
    }
    const innerText = j?.result
    if (typeof innerText !== 'string' || innerText.length < 10) {
      out.error = { step: 'parse', code: 'no_result', body: j }
      return out
    }
    let inner
    try {
      inner = JSON.parse(innerText)
    } catch {
      out.error = { step: 'parse', code: 'bad_result_json', body: j }
      return out
    }
    const webpB64 = inner?.image?.b64_json
    if (!webpB64 || typeof webpB64 !== 'string') {
      out.error = { step: 'parse', code: 'no_b64', body: inner }
      return out
    }
    const webpBuf = Buffer.from(webpB64, 'base64')
    if (webpBuf.length < 10) {
      out.error = { step: 'parse', code: 'b64_empty' }
      return out
    }
    const conv = await webpToPng(webpBuf, tmpDir)
    if (!conv.ok) {
      out.error = { step: 'convert', code: 'ffmpeg_failed', message: conv.error }
      return out
    }
    out.ok = true
    out.buffer = conv.png
    out.contentType = 'image/png'
    out.result = {
      image_id: inner?.image?.image_id,
      created: inner?.created,
      credits: inner?.credits,
    }
    return out
  } catch (e) {
    out.error = { step: 'exception', message: e?.message || String(e) }
    return out
  }
}