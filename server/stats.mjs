// 访问统计存储模块：加载/保存 server/data/stats.json
// 零依赖，仅用 Node 内置模块，与 .claude/hooks 的自包含脚本风格一致。
// 原子写（临时文件 + rename）防中断损坏；写盘节流（约 2s 一次）+ 进程退出兜底刷新。
//
// 与 sd_harmony/book/server/stats.mjs 的差异：
//   - 每次访问记录 page 维度（教材 / 幻灯片首页 / 幻灯片播放），供资源分布统计
//   - 增加 PDF 下载计数（教材 PDF 与白皮书 PDF，由 server.mjs 调 recordDownload）

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'stats.json')
const TMP_FILE = DATA_FILE + '.tmp'

// 最多保留的访问明细条数（保留最近的）
const CAP_VISITS = 1000
// 未收到 end 信标的活跃记录超时（毫秒），视为已离开，时长记 0
const ACTIVE_TTL_MS = 60 * 60 * 1000
// 写盘节流间隔
const PERSIST_DEBOUNCE_MS = 2000

let state = null
let pendingTimer = null
let flushing = false

function emptyState() {
  return {
    startedAt: null,
    totalVisits: 0,
    totalDurationSec: 0,
    firstVisitAt: null,
    lastVisitAt: null,
    downloads: { book: 0, whitepaper: 0 },
    visits: [],
  }
}

// 内存中的活跃表：vid -> visit 记录（与 state.visits 中同一条引用）
const active = new Map()

function load() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    state = { ...emptyState(), ...JSON.parse(raw) }
    if (!Array.isArray(state.visits)) state.visits = []
    if (!state.downloads || typeof state.downloads !== 'object') state.downloads = { book: 0, whitepaper: 0 }
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(`[stats] 读取 ${DATA_FILE} 失败：${err.message}`)
    state = emptyState()
  }
}

function persist() {
  if (flushing) return
  flushing = true
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    const json = JSON.stringify(state, null, 2)
    fs.writeFileSync(TMP_FILE, json, 'utf8')
    fs.renameSync(TMP_FILE, DATA_FILE)
  } catch (err) {
    // Windows 上 rename 偶发 EPERM，退化为直接写
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8')
    } catch (err2) {
      console.error(`[stats] 写入 ${DATA_FILE} 失败：${err2.message}`)
    }
  } finally {
    flushing = false
  }
}

function schedulePersist() {
  if (pendingTimer) return
  pendingTimer = setTimeout(() => {
    pendingTimer = null
    persist()
  }, PERSIST_DEBOUNCE_MS)
}

function pruneStale(now = Date.now()) {
  for (const [vid, visit] of active) {
    if (now - new Date(visit.start).getTime() > ACTIVE_TTL_MS) {
      if (visit.end == null) {
        visit.end = null // 未收到离开信标，时长计 0
        visit.duration = 0
      }
      active.delete(vid)
    }
  }
}

function pushVisit(visit) {
  state.visits.push(visit)
  if (state.visits.length > CAP_VISITS) {
    state.visits.splice(0, state.visits.length - CAP_VISITS)
  }
}

function toISOLocal(ts) {
  if (ts == null) return null
  return new Date(ts).toISOString()
}

function localDayKey(ts) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 页面名 -> 展示名（统计页用） */
const PAGE_LABELS = {
  book: '教材',
  'slides-index': '幻灯片·首页',
  'slides-player': '幻灯片·播放',
  whitepaper: '白皮书',
  'book-pdf': '教材 PDF',
}

function pageLabel(page) {
  return PAGE_LABELS[page] || page || '未知'
}

// 记录一次访问开始（start 信标）。返回 visit 记录。
export function recordStart({ vid, ip, ua, referrer, page }) {
  const now = Date.now()
  pruneStale(now)
  const visit = {
    id: vid || String(now),
    start: toISOLocal(now),
    end: null,
    duration: 0,
    ip: ip || '',
    ua: ua || '',
    referrer: referrer || '',
    page: page || '',
  }
  active.set(visit.id, visit)
  pushVisit(visit)
  state.totalVisits += 1
  if (state.firstVisitAt == null) state.firstVisitAt = visit.start
  state.lastVisitAt = visit.start
  if (state.startedAt == null) state.startedAt = visit.start
  schedulePersist()
  return visit
}

// 记录一次访问结束（end 信标）。若找不到对应 start（如服务重启），忽略不计时。
export function recordEnd({ vid, dur }) {
  const visit = active.get(vid)
  if (!visit || visit.end != null) return null
  const now = Date.now()
  visit.end = toISOLocal(now)
  // 时长以客户端上报秒数为准，非法值按 0 处理
  const d = Number(dur)
  visit.duration = Number.isFinite(d) && d >= 0 ? Math.round(d) : 0
  state.totalDurationSec += visit.duration
  active.delete(vid)
  schedulePersist()
  return visit
}

/** 记录一次 PDF 下载（book=教材 PDF，whitepaper=白皮书 PDF） */
export function recordDownload(kind) {
  const key = kind === 'whitepaper' ? 'whitepaper' : 'book'
  state.downloads[key] = (state.downloads[key] || 0) + 1
  schedulePersist()
}

export function summary() {
  const todayKey = localDayKey(Date.now())
  const todayVisits = state.visits.filter((v) => localDayKey(new Date(v.start)) === todayKey).length
  const avgDurationSec =
    state.totalVisits > 0 ? Math.round(state.totalDurationSec / state.totalVisits) : 0
  return {
    startedAt: state.startedAt,
    totalVisits: state.totalVisits,
    todayVisits,
    totalDurationSec: state.totalDurationSec,
    avgDurationSec,
    firstVisitAt: state.firstVisitAt,
    lastVisitAt: state.lastVisitAt,
    downloads: { ...state.downloads },
  }
}

export function data() {
  return { ...state, visits: [...state.visits] }
}

export function recent(n = 20) {
  return state.visits.slice(-n).reverse()
}

// ---------- 聚合分析 ----------

/** 独立访客数（按 IP 去重，忽略空 IP） */
export function uniqueVisitors() {
  return new Set(state.visits.filter((v) => v.ip).map((v) => v.ip)).size
}

/** 按小时（0-23）统计访问量 */
export function hourly() {
  const h = new Array(24).fill(0)
  for (const v of state.visits) {
    h[new Date(v.start).getHours()] += 1
  }
  return h
}

/** 近 n 天每日访问量（含今天，label 用 MM-DD） */
export function daily(n = 14) {
  const now = new Date()
  const byKey = new Map()
  for (const v of state.visits) {
    const k = localDayKey(new Date(v.start))
    byKey.set(k, (byKey.get(k) || 0) + 1)
  }
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(now.getDate() - i)
    const key = localDayKey(day)
    out.push({ date: key.slice(5), visits: byKey.get(key) || 0 })
  }
  return out
}

/** 各资源（页面）访问分布 Top N */
export function pages(n = 8) {
  const map = new Map()
  for (const v of state.visits) {
    const name = pageLabel(v.page)
    map.set(name, (map.get(name) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }))
}

/** 停留时长分布（仅收到 end 信标的访问计入） */
export function durationBuckets() {
  const buckets = [
    ['10秒内', 0, 10],
    ['10-30秒', 10, 30],
    ['30秒-1分', 30, 60],
    ['1-5分', 60, 300],
    ['5-15分', 300, 900],
    ['15分以上', 900, Infinity],
  ]
  const counts = new Array(buckets.length).fill(0)
  for (const v of state.visits) {
    if (v.end == null) continue
    const d = v.duration
    for (let i = 0; i < buckets.length; i++) {
      if (d >= buckets[i][1] && d < buckets[i][2]) {
        counts[i] += 1
        break
      }
    }
  }
  return buckets.map(([name], i) => ({ name, value: counts[i] }))
}

function extractHost(referrer) {
  try {
    return new URL(referrer).hostname
  } catch {
    return referrer
  }
}

/** 来源域名 Top N（空来源记为「直接访问」，排最前） */
export function topReferrers(n = 8) {
  const map = new Map()
  let direct = 0
  for (const v of state.visits) {
    const r = (v.referrer || '').trim()
    if (!r) {
      direct += 1
      continue
    }
    const host = extractHost(r)
    map.set(host, (map.get(host) || 0) + 1)
  }
  const out = [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }))
  if (direct > 0) out.unshift({ name: '直接访问', value: direct })
  return out
}

function classifyUA(ua) {
  ua = ua || ''
  if (/MicroMessenger|XWEB|Weixin/i.test(ua)) return '微信内置浏览器'
  if (/OpenHarmony|ArkWeb/i.test(ua)) return '鸿蒙 ArkWeb'
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/Chrome\//i.test(ua)) return 'Chrome'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/Safari\//i.test(ua)) return 'Safari'
  return '其他'
}

/** 按 UA 归类浏览器/平台 Top N */
export function topPlatforms(n = 8) {
  const map = new Map()
  for (const v of state.visits) {
    const name = classifyUA(v.ua)
    map.set(name, (map.get(name) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }))
}

function classifyDevice(ua) {
  ua = ua || ''
  if (/Mobile|Android|iPhone|iPad|HarmonyOS/i.test(ua)) return '移动端'
  if (/Windows|Macintosh|Linux/i.test(ua)) return '桌面端'
  return '未知'
}

/** 移动端 / 桌面端 分布 */
export function topDevices() {
  const map = new Map()
  for (const v of state.visits) {
    const name = classifyDevice(v.ua)
    map.set(name, (map.get(name) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))
}

/** 来源 IP Top N */
export function topIPs(n = 8) {
  const map = new Map()
  for (const v of state.visits) {
    const ip = v.ip || '未知'
    map.set(ip, (map.get(ip) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }))
}

export function flush() {
  if (pendingTimer) {
    clearTimeout(pendingTimer)
    pendingTimer = null
  }
  persist()
}

export function init() {
  load()
  flush() // 确保目录与初始文件就绪
}

export function onExit() {
  flush()
}
