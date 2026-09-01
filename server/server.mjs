// 动态服务器：发布教材 HTML / 幻灯片 HTML / 教材 PDF / 白皮书 PDF，并统计访问次数、停留时长、访问时间。
// 参照 sd_harmony/book/server/server.mjs，零依赖，仅用 Node 内置模块（http/fs/path/url）。
//
// 用法：
//   node server/server.mjs             启动（默认端口 8080，可用 PORT 环境变量覆盖）
//   node server/server.mjs --port 9000 指定端口
//   node server/server.mjs --stats     打印访问统计摘要后退出（不开服务器）
// 环境变量：PORT=8080 端口；BASE_PATH=/se-textbook 部署子路径（留空按根路径发布，经 nginx 反代时设此值）
//
// 路由：
//   / 或 /index.html      引导页 server/landing.html（不埋点）
//   /book/                教材 HTML build/index.html（服务端注入 track.js 埋点）
//   /book/images/*        静态发布 build/images/*（教材相对 images/ 引用在此解析）
//   /book.pdf             教材 PDF（build/md_writing.pdf）
//   /slides/              幻灯片首页 docs/index.html（注入 track.js）
//   /slides/*             幻灯片静态资源（docs/：css/js/data/player.html 等，html 页注入埋点）
//   /whitepaper.pdf       白皮书 PDF（white-paper/build/，文件名容错）
//   /track.gif            埋点信标：?type=start 计一次访问；?type=end 更新停留时长（任意前缀均路由到此）
//   /echarts.min.js       ECharts 库（本地托管，统计页图表用）
//   /stats                页面访问统计（ECharts 数据可视化，server/stats.html）
//   /stats.json           页面访问 JSON（含聚合分析：小时/每日/时长/来源/平台/IP/页面/下载）
//   /slides-stats         课件学习统计（ECharts 数据可视化，server/slides-stats.html，数据 fetch /api/stats）
//   POST /api/collect     幻灯片行为统计采集（js/stats.js 上报，事件落盘 server/data/slides-events.jsonl）
//   GET  /api/stats       幻灯片行为统计聚合报表（原 docs/stats.html 消费，报表页已删除，接口保留）
//   GET  /api/raw         幻灯片原始事件导出（?limit=、?after= 可选）
//   GET  /api/health      健康检查
//
// 幻灯片页面（/slides/ 下 index.html / player.html）由服务端注入
// window.SLIDE_STATS_ENDPOINT，自动向同源 /api/collect 上报；file:// 直开时无注入，统计保持关闭。
// 原独立统计服务 docs/tools/stats-server.js 已删除，幻灯片统计仅由本服务器提供。

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as stats from './stats.mjs'
import * as slidesStats from './slides-stats.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// 部署子路径（经 nginx 挂在 /se-textbook 下时设 BASE_PATH=/se-textbook；留空按根路径发布）
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/+$/, '')
const route = (p) => BASE_PATH + p
const BUILD_DIR = path.resolve(__dirname, '..', 'build')
const BOOK_HTML = path.join(BUILD_DIR, 'index.html')
const BOOK_PDF = path.join(BUILD_DIR, 'md_writing.pdf')
const SLIDES_DIR = path.resolve(__dirname, '..', 'docs')
const WHITEPAPER_DIR = path.resolve(__dirname, '..', 'white-paper', 'build')
const TRACK_FILE = path.join(__dirname, 'track.js')
const LANDING_FILE = path.join(__dirname, 'landing.html')
const STATS_PAGE_FILE = path.join(__dirname, 'stats.html')
const SLIDES_STATS_PAGE_FILE = path.join(__dirname, 'slides-stats.html')
const ECHARTS_FILE = path.join(__dirname, 'echarts.min.js')

// 1×1 透明 GIF（hex 构造，避免源码内嵌非打印字符），埋点信标统一返回它
const PIXEL_GIF = Buffer.from(
  '47494638396101000100800000000000ffffff21f90401000000002c00000000010001000002024401003b',
  'hex',
)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
}

// 预读埋点脚本；失败则仅记日志，服务仍可发布页面（不注入）
let TRACK_TAG = ''
try {
  const trackJs = fs.readFileSync(TRACK_FILE, 'utf8')
  // page 标识由注入点传入，见 injectTrack()
  TRACK_TAG = (page) =>
    `\n<script>window.TRACK_PAGE=${JSON.stringify(page)};</script>\n<script>\n${trackJs}\n</script>\n`
} catch (err) {
  console.error(`[server] 读取 ${TRACK_FILE} 失败：${err.message}`)
}

// 预读引导页；失败则根路径退回 404 并告警
let LANDING_HTML = null
try {
  LANDING_HTML = fs.readFileSync(LANDING_FILE, 'utf8')
} catch (err) {
  console.error(`[server] 读取 ${LANDING_FILE} 失败：${err.message}`)
}

// 预读统计页；失败则 /stats 退回 404 并告警
let STATS_PAGE_HTML = null
try {
  STATS_PAGE_HTML = fs.readFileSync(STATS_PAGE_FILE, 'utf8')
} catch (err) {
  console.error(`[server] 读取 ${STATS_PAGE_FILE} 失败：${err.message}`)
}

// 预读课件学习统计页；失败则 /slides-stats 退回 404 并告警
let SLIDES_STATS_PAGE_HTML = null
try {
  SLIDES_STATS_PAGE_HTML = fs.readFileSync(SLIDES_STATS_PAGE_FILE, 'utf8')
} catch (err) {
  console.error(`[server] 读取 ${SLIDES_STATS_PAGE_FILE} 失败：${err.message}`)
}

// 预读 ECharts 库；失败则统计页图表不可用，但页面仍可返回
let ECHARTS_JS = ''
try {
  ECHARTS_JS = fs.readFileSync(ECHARTS_FILE, 'utf8')
} catch (err) {
  console.error(`[server] 读取 ${ECHARTS_FILE} 失败：${err.message}`)
}

// 幻灯片统计上报端点：由服务端注入到幻灯片页（/slides/ 下 index.html / player.html），
// 使页面自动向同源服务器上报行为统计（无需手工配置端点；file:// 直开时无此注入，统计保持关闭）
const SLIDES_ENDPOINT_TAG = `\n<script>window.SLIDE_STATS_ENDPOINT="${BASE_PATH}/";</script>\n`

// ---------- 小工具 ----------

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDuration(sec) {
  sec = Number(sec) || 0
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}时${m}分${s}秒`
  if (m > 0) return `${m}分${s}秒`
  return `${s}秒`
}

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('zh-CN', { hour12: false })
}

function send(res, status, body, headers = {}) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf8')
  res.writeHead(status, { 'Content-Length': buf.length, ...headers })
  res.end(buf)
}

function send404(res) {
  send(res, 404, '404 Not Found', { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
}

/** 把 track.js 埋点注入到 HTML 的 </body> 前（不改源文件） */
function injectTrack(html, page) {
  if (!TRACK_TAG) return html
  const tag = TRACK_TAG(page)
  if (html.includes('</body>')) return html.replace('</body>', `${tag}</body>`)
  return html + tag
}

/** 注入幻灯片统计端点配置（须在 js/stats.js 执行前生效，故紧随 <head> 之后） */
function injectSlidesEndpoint(html) {
  const m = html.match(/<head[^>]*>/i)
  if (m) return html.slice(0, m.index + m[0].length) + SLIDES_ENDPOINT_TAG + html.slice(m.index + m[0].length)
  return html + SLIDES_ENDPOINT_TAG
}

// ---------- 发布处理 ----------

// 教材 HTML：读 build/index.html，注入埋点后返回
function serveBook(res) {
  fs.readFile(BOOK_HTML, 'utf8', (err, html) => {
    if (err) {
      send(res, 500, `无法读取 ${BOOK_HTML}：${err.message}`, { 'Content-Type': 'text/plain; charset=utf-8' })
      return
    }
    send(res, 200, injectTrack(html, 'book'), {
      'Content-Type': MIME['.html'],
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    })
  })
}

// 引导页：读预存的 landing.html，替换统计占位符后返回（不埋点）
function serveLanding(res) {
  if (LANDING_HTML == null) {
    send404(res)
    return
  }
  const s = stats.summary()
  const d = s.downloads || {}
  const out = LANDING_HTML
    .replaceAll('{{totalVisits}}', String(s.totalVisits))
    .replaceAll('{{totalDurationSec}}', String(s.totalDurationSec))
    .replaceAll('{{bookDownloads}}', String(d.book || 0))
    .replaceAll('{{whitepaperDownloads}}', String(d.whitepaper || 0))
  send(res, 200, out, {
    'Content-Type': MIME['.html'],
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
}

// 白皮书 PDF 文件名容错：交付名「智能软件工程基础-白皮书.pdf」优先，
// 其次是「智能软件工程基础.pdf」，最后退化为任意 *.pdf
function findWhitepaperPdf() {
  const candidates = [
    path.join(WHITEPAPER_DIR, '智能软件工程基础-白皮书.pdf'),
    path.join(WHITEPAPER_DIR, '智能软件工程基础.pdf'),
    path.join(WHITEPAPER_DIR, 'whitepaper.pdf'),
  ]
  for (const f of candidates) {
    try {
      if (fs.statSync(f).isFile()) return f
    } catch {
      /* 不存在则试下一个 */
    }
  }
  try {
    const first = fs
      .readdirSync(WHITEPAPER_DIR)
      .filter((n) => n.toLowerCase().endsWith('.pdf'))
      .map((n) => path.join(WHITEPAPER_DIR, n))[0]
    return first || null
  } catch {
    return null
  }
}

// PDF 下载/查看：inline + 中文文件名
function servePdf(res, filePath, onSuccess) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      send404(res)
      return
    }
    fs.readFile(filePath, (err2, buf) => {
      if (err2) {
        send404(res)
        return
      }
      if (onSuccess) onSuccess()
      const name = path.basename(filePath)
      send(res, 200, buf, {
        'Content-Type': MIME['.pdf'],
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(name)}`,
      })
    })
  })
}

// 静态发布 rootDir 下的文件（带路径穿越防护）。
// opts.injectPage            指定时对 HTML 注入访问埋点（track.js，page 标识）
// opts.injectSlidesEndpoint  指定时对 HTML 注入幻灯片统计端点（自动上报行为统计）
function serveStatic(res, rootDir, urlPath, opts = {}) {
  let decoded
  try {
    decoded = decodeURIComponent(urlPath)
  } catch {
    send404(res)
    return
  }
  const rel = decoded.replace(/^\/+/, '')
  let filePath = path.resolve(rootDir, rel)
  // 确保在 rootDir 内
  if (filePath !== rootDir && !filePath.startsWith(rootDir + path.sep)) {
    send404(res) // 越界访问，拒绝
    return
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      send404(res)
      return
    }
    const read = (cb) => fs.readFile(filePath, (e, b) => cb(e, b))
    read((err2, buf) => {
      if (err2) {
        send404(res)
        return
      }
      const ext = path.extname(filePath).toLowerCase()
      const isHtml = ext === '.html' || ext === '.htm'
      if (isHtml && (opts.injectPage || opts.injectSlidesEndpoint)) {
        let html = buf.toString('utf8')
        if (opts.injectSlidesEndpoint) html = injectSlidesEndpoint(html)
        if (opts.injectPage) html = injectTrack(html, opts.injectPage)
        buf = Buffer.from(html, 'utf8')
      }
      send(res, 200, buf, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': isHtml ? 'no-store' : opts.cacheMaxAge || 'public, max-age=86400',
      })
    })
  })
}

// 埋点信标端点（page 记录访问的资源；经 nginx 反代时取 X-Forwarded-For 第一跳为真实客户端 IP）
function serveTrack(req, res, query) {
  const type = query.get('type')
  const vid = query.get('vid') || ''
  if (type === 'start') {
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || ''
    const visit = stats.recordStart({
      vid,
      ip,
      ua: req.headers['user-agent'] || '',
      referrer: req.headers.referer || '',
      page: query.get('page') || '',
    })
    console.log(`[track] 访问 #${stats.summary().totalVisits} start vid=${visit.id} page=${visit.page} ip=${visit.ip}`)
  } else if (type === 'end') {
    const visit = stats.recordEnd({ vid, dur: query.get('dur') })
    if (visit) console.log(`[track] end vid=${visit.id} 时长=${visit.duration}s`)
  }
  send(res, 200, PIXEL_GIF, {
    'Content-Type': 'image/gif',
    'Cache-Control': 'no-store',
  })
}

// 统计网页：读预存的 stats.html（ECharts 数据可视化，数据由前端 fetch /stats.json）
function serveStatsPage(res) {
  if (STATS_PAGE_HTML == null) {
    send404(res)
    return
  }
  send(res, 200, STATS_PAGE_HTML, {
    'Content-Type': MIME['.html'],
    'Cache-Control': 'no-store',
  })
}

// 课件学习统计网页：读预存的 slides-stats.html（数据由前端 fetch /api/stats）
function serveSlidesStatsPage(res) {
  if (SLIDES_STATS_PAGE_HTML == null) {
    send404(res)
    return
  }
  send(res, 200, SLIDES_STATS_PAGE_HTML, {
    'Content-Type': MIME['.html'],
    'Cache-Control': 'no-store',
  })
}

/** 统计页与 /stats.json 共用的完整数据负载 */
function statsData() {
  const s = stats.summary()
  return {
    ...s,
    uniqueVisitors: stats.uniqueVisitors(),
    hourly: stats.hourly(),
    daily: stats.daily(14),
    pages: stats.pages(8),
    durations: stats.durationBuckets(),
    referrers: stats.topReferrers(8),
    platforms: stats.topPlatforms(8),
    devices: stats.topDevices(),
    topIPs: stats.topIPs(8),
    recent: stats.recent(20),
  }
}

// ---------- 幻灯片行为统计端点（/api/*，供 js/stats.js 上报；原 docs/stats.html 报表页已删除） ----------

// 读取 POST 请求体（上限 512KB）
function readBody(req, cb) {
  const chunks = []
  let size = 0
  req.on('data', (c) => {
    size += c.length
    if (size > 512 * 1024) {
      req.destroy()
      cb(new Error('body too large'))
      return
    }
    chunks.push(c)
  })
  req.on('end', () => cb(null, Buffer.concat(chunks).toString('utf8')))
  req.on('error', (e) => cb(e))
}

function jsonHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

// POST /api/collect：批量接收幻灯片行为事件
function handleSlidesCollect(req, res) {
  readBody(req, (err, body) => {
    if (err) {
      send(res, 413, JSON.stringify({ ok: false, error: err.message }), jsonHeaders())
      return
    }
    let data
    try {
      data = JSON.parse(body)
    } catch {
      send(res, 400, JSON.stringify({ ok: false, error: 'JSON 解析失败' }), jsonHeaders())
      return
    }
    const list = Array.isArray(data) ? data : [data]
    list.forEach((e) => {
      if (e && e.id) console.log(`[slides] 事件 ${e.type} id=${e.id} cid=${e.cid || ''} slug=${e.slug || ''}`)
    })
    slidesStats.collectBatch(list)
    send(res, 204, '', { 'Access-Control-Allow-Origin': '*' })
  })
}

// ---------- 请求分发 ----------

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const p = url.pathname

  if (req.method === 'OPTIONS') return send(res, 204, '', jsonHeaders())
  if (p === route('/') || p === route('/index.html')) return serveLanding(res)
  if (p === route('/book')) return send(res, 301, '', { Location: route('/book/') })
  if (p === route('/book/')) return serveBook(res)
  if (p === route('/slides')) return send(res, 301, '', { Location: route('/slides/') })
  if (p === route('/slides/')) {
    return serveStatic(res, SLIDES_DIR, '/index.html', { injectPage: 'slides-index', injectSlidesEndpoint: true })
  }
  // 埋点信标：教材页 /book/ 与幻灯片页 /slides/ 的相对 track.gif 实际请求带前缀，
  // 与 /track.gif 都路由到同一处理（endsWith 兼容任意前缀）
  if (p.endsWith('/track.gif')) return serveTrack(req, res, url.searchParams)
  if (p === route('/echarts.min.js')) {
    if (!ECHARTS_JS) return send404(res)
    return send(res, 200, ECHARTS_JS, {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    })
  }
  // 幻灯片行为统计：采集 / 报表 / 原始事件 / 健康检查（与页面访问统计 /stats 相互独立）
  if (req.method === 'POST' && p === route('/api/collect')) return handleSlidesCollect(req, res)
  if (req.method === 'GET' && p === route('/api/stats')) {
    return send(res, 200, JSON.stringify(slidesStats.report()), jsonHeaders())
  }
  if (req.method === 'GET' && p === route('/api/raw')) {
    const limit = Math.max(1, Math.min(5000, parseInt(url.searchParams.get('limit') || '500', 10)))
    const after = parseInt(url.searchParams.get('after') || '0', 10)
    return send(res, 200, JSON.stringify(slidesStats.rawEvents(limit, after)), jsonHeaders())
  }
  if (req.method === 'GET' && p === route('/api/health')) {
    return send(res, 200, JSON.stringify(slidesStats.health()), jsonHeaders())
  }
  if (p === route('/stats')) return serveStatsPage(res)
  if (p === route('/slides-stats')) return serveSlidesStatsPage(res)
  if (p === route('/stats.json')) {
    return send(res, 200, JSON.stringify(statsData(), null, 2), {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
  }
  if (p === route('/whitepaper.pdf')) {
    const wp = findWhitepaperPdf()
    return wp ? servePdf(res, wp, () => stats.recordDownload('whitepaper')) : send404(res)
  }
  if (p === route('/book.pdf')) return servePdf(res, BOOK_PDF, () => stats.recordDownload('book'))
  // 教材其余静态资源（images/ 等）从 build/ 解析
  if (p.startsWith(route('/book/'))) return serveStatic(res, BUILD_DIR, p.slice(route('/book').length))
  // 幻灯片其余静态资源（css/js/data/favicon 等）从 docs/ 解析；
  // index/player 页注入访问埋点与统计端点（自动连到同源服务器）
  if (p.startsWith(route('/slides/'))) {
    const rel = p.slice(route('/slides').length)
    const fileName = path.basename(rel).toLowerCase()
    const opts = {}
    if (fileName === 'index.html') {
      opts.injectPage = 'slides-index'
      opts.injectSlidesEndpoint = true
    } else if (fileName === 'player.html') {
      opts.injectPage = 'slides-player'
      opts.injectSlidesEndpoint = true
    }
    return serveStatic(res, SLIDES_DIR, rel, opts)
  }
  return send404(res)
})

// ---------- 启动 ----------

function main() {
  stats.init()
  slidesStats.init()
  const args = process.argv.slice(2)
  if (args.includes('--stats')) {
    console.log('[stats] 访问摘要：', JSON.stringify(stats.summary(), null, 2))
    console.log('[stats] 幻灯片摘要：', JSON.stringify(slidesStats.summary(), null, 2))
    stats.onExit()
    return
  }

  let port = Number(process.env.PORT) || 8080
  const portIdx = args.indexOf('--port')
  if (portIdx !== -1 && args[portIdx + 1]) port = Number(args[portIdx + 1])

  server.listen(port, () => {
    const base = BASE_PATH || ''
    console.log(`[server] 发布 http://localhost:${port}${base}/（引导页）`)
    console.log(`[server] 教材 http://localhost:${port}${base}/book/ · 幻灯片 http://localhost:${port}${base}/slides/`)
    console.log(`[server] 教材PDF http://localhost:${port}${base}/book.pdf · 白皮书 http://localhost:${port}${base}/whitepaper.pdf`)
    console.log(`[server] 访问统计 http://localhost:${port}${base}/stats`)
    console.log(`[server] 幻灯片上报 POST ${base}/api/collect · 聚合 GET ${base}/api/stats`)
  })

  const shutdown = () => {
    console.log('\n[server] 正在退出，刷新统计数据…')
    stats.onExit()
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 1000).unref()
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main()
