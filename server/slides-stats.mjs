// 幻灯片行为统计模块：采集与聚合逻辑原为 docs/tools/stats-server.js（已删除），
// 现内嵌到 server/ 运行（HTTP 路由由 server.mjs 提供），事件落盘到 server/data/slides-events.jsonl。
//
// 数据流：客户端 js/stats.js → POST /api/collect（server.mjs）→ collectBatch()
//         → 内存聚合 + 追加 slides-events.jsonl；启动时重放历史事件。
//         server.mjs 的 /api/stats 返回本模块 report()，供聚合报表消费（原 docs/stats.html 报表页已删除）。
//
// 事件 schema（v=1）：
//   { v, id, cid, ts, localDay, localHour, tz, type, ... }
//   type: view(page=home|player) / session / milestone(name=fiveMin|endReached) / hb
// 趋势一律用客户端本地日/时（localDay/localHour），避免服务端时区与学员不一致。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const EVENTS_FILE = path.join(DATA_DIR, 'slides-events.jsonl')
const MAX_SEEN = 50000           // 去重 id 上限（超限重建）
const MAX_SID = 50000            // sid 状态上限（超限重建）

// —— 内存聚合 ——
const db = {
  counts: {
    home: 0, player: 0, sessions: 0, fiveMin: 0, completed: 0,
    reachedEnd: 0, durationSec: 0, clients: 0, badLines: 0,
  },
  units: new Map(),     // slug -> 单元聚合
  daily: new Map(),     // 'YYYY-MM-DD' -> { sessions, sec, home }
  hourly: new Map(),    // 0..23 -> sessions
  dwell: new Map(),     // 'slug:i' -> { slug, i, sec } 全局单页停留
  clients: new Set(),   // cid
}
const seen = new Set()        // 已处理事件 id（去重）
const milestones = new Map()  // sid -> { fiveMin, endReached, completed } 会话级去重
const sidSlug = new Map()     // sid -> slug（milestone 归因到小节）

const t0 = Date.now()

/** 新建单元聚合结构 */
function newUnit(slug) {
  return {
    slug, mode: null, title: null,
    sessions: 0, fiveMin: 0, completed: 0, reachedEnd: 0,
    totalSec: 0, avgSec: 0, maxSlide: 0,
    nav: { next: 0, prev: 0, jump: 0 },
    tts: { plays: 0, sec: 0 },
    features: { fullscreen: 0, overview: 0, theme: 0, zoom: 0, recording: 0 },
    dwell: new Map(), // 页下标 -> 累计秒
  }
}

function getUnit(slug) {
  if (!slug) return null
  let u = db.units.get(slug)
  if (!u) { u = newUnit(slug); db.units.set(slug, u) }
  return u
}

/** 会话级去重：同一 sid 的同一标志只计一次，返回 true 表示本次新增 */
function flagOnce(sid, flag) {
  if (!sid) return false
  let m = milestones.get(sid)
  if (!m) { m = {}; milestones.set(sid, m) }
  if (m[flag]) return false
  m[flag] = true
  return true
}

/** 累计全局单页停留 */
function addDwell(slug, i, sec) {
  if (!slug || typeof i !== 'number' || !sec) return
  const key = slug + ':' + i
  const d = db.dwell.get(key)
  if (d) d.sec += sec
  else db.dwell.set(key, { slug, i, sec })
}

// —— 事件聚合（纯函数：把一条事件并入 db） ——

function aggregateEvent(e) {
  const t = e.type
  const now = Date.now()

  // 通用计数
  if (e.cid) db.clients.add(e.cid)
  const day = e.localDay
  const hour = e.localHour

  if (t === 'view') {
    if (e.page === 'home') {
      db.counts.home++
      if (day) {
        const d = db.daily.get(day) || { sessions: 0, sec: 0, home: 0 }
        d.home++
        db.daily.set(day, d)
      }
    } else if (e.page === 'player') {
      db.counts.player++
    }
    return
  }

  if (t === 'hb') {
    if (e.sid && e.slug) sidSlug.set(e.sid, e.slug)
    return
  }

  if (t === 'milestone') {
    if (e.sid && e.slug) sidSlug.set(e.sid, e.slug)
    const unit = e.slug ? getUnit(e.slug) : null
    if (e.name === 'fiveMin') {
      if (flagOnce(e.sid, 'fiveMin')) {
        db.counts.fiveMin++
        if (unit) unit.fiveMin++
      }
    } else if (e.name === 'endReached') {
      if (flagOnce(e.sid, 'endReached')) {
        db.counts.reachedEnd++
        if (unit) unit.reachedEnd++
      }
    }
    return
  }

  if (t === 'session') {
    db.counts.sessions++
    const dur = (e.duration || 0) / 1000      // 秒
    const sec = Math.round(dur)
    db.counts.durationSec += sec

    // 会话级完成指标（与 milestone 去重，flagOnce 每标志只调一次，全局/小节共用结果）
    const f5 = !!e.fiveMin && flagOnce(e.sid, 'fiveMin')
    const fc = !!e.completed && flagOnce(e.sid, 'completed')
    const fre = !!e.reachedEnd && flagOnce(e.sid, 'endReached')
    if (f5) db.counts.fiveMin++
    if (fc) db.counts.completed++
    if (fre) db.counts.reachedEnd++

    // 按日/按小时趋势
    if (day) {
      const d = db.daily.get(day) || { sessions: 0, sec: 0, home: 0 }
      d.sessions++
      d.sec += sec
      db.daily.set(day, d)
    }
    if (hour !== undefined) {
      db.hourly.set(hour, (db.hourly.get(hour) || 0) + 1)
    }

    // 单元聚合
    const slug = e.slug
    const unit = slug ? getUnit(slug) : null
    if (unit) {
      if (e.sid && e.slug) sidSlug.set(e.sid, e.slug)
      unit.mode = e.mode || unit.mode
      unit.title = e.title || unit.title
      unit.sessions++
      unit.totalSec += sec
      if (e.maxSlide > unit.maxSlide) unit.maxSlide = e.maxSlide
      if (f5) unit.fiveMin++
      if (fc) unit.completed++
      if (fre) unit.reachedEnd++
      const nav = e.nav || {}
      unit.nav.next += nav.next || 0
      unit.nav.prev += nav.prev || 0
      unit.nav.jump += nav.jump || 0
      const tts = e.tts || {}
      unit.tts.plays += tts.plays || 0
      unit.tts.sec += tts.sec || 0
      const fe = e.features || {}
      unit.features.fullscreen += fe.fullscreen || 0
      unit.features.overview += fe.overview || 0
      unit.features.theme += fe.theme || 0
      unit.features.zoom += fe.zoom || 0
      unit.features.recording += fe.recording || 0
      ;(e.pageDwell || []).forEach((pair) => {
        const idx = pair[0], ms = pair[1]
        if (typeof idx !== 'number' || typeof ms !== 'number') return
        unit.dwell.set(idx, (unit.dwell.get(idx) || 0) + ms / 1000)
        addDwell(slug, idx, ms / 1000)
      })
    }
    return
  }

  // 未知 type 静默忽略
}

// —— 落盘与去重 ——

function ingestEvent(e) {
  if (!e || typeof e !== 'object') return
  if (e.id) {
    if (seen.has(e.id)) return   // 去重（重试/双发）
    seen.add(e.id)
    if (seen.size > MAX_SEEN) seen.clear()
  }
  aggregateEvent(e)
  try {
    fs.appendFileSync(EVENTS_FILE, JSON.stringify(e) + '\n')
  } catch (err) {
    console.warn('[slides-stats] ✗ 写入事件落盘失败（内存聚合已更新）：' + err.message)
  }
}

/** 批量收集：server.mjs 的 POST /api/collect 调用（body 为事件数组或单事件） */
export function collectBatch(list) {
  const arr = Array.isArray(list) ? list : [list]
  for (const e of arr) ingestEvent(e)
}

function replay() {
  if (!fs.existsSync(EVENTS_FILE)) return
  const lines = fs.readFileSync(EVENTS_FILE, 'utf8').split('\n')
  for (const line of lines) {
    if (!line.trim()) continue
    try {
      aggregateEvent(JSON.parse(line))
    } catch {
      db.counts.badLines++
    }
  }
  console.log('[slides-stats] ✓ 重放 ' + lines.filter((l) => l.trim()).length + ' 条历史事件（坏行 ' + db.counts.badLines + '）')
}

// —— 报表（server.mjs 的 /api/stats 与 /api/raw 消费） ——

/** /api/stats 完整聚合报表（原报表页 docs/stats.html 已删除，schema 保持稳定供外部消费） */
export function report() {
  const now = Date.now()
  const units = []
  db.units.forEach((u) => {
    const top = Array.from(u.dwell.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([i, sec]) => [i, Math.round(sec)])
    units.push({
      slug: u.slug, mode: u.mode, title: u.title,
      sessions: u.sessions, fiveMin: u.fiveMin, completed: u.completed, reachedEnd: u.reachedEnd,
      totalSec: u.totalSec,
      avgSec: u.sessions ? Math.round(u.totalSec / u.sessions) : 0,
      maxSlide: u.maxSlide,
      nav: u.nav, tts: u.tts, features: u.features,
      top,
    })
  })
  units.sort((a, b) => a.slug.localeCompare(b.slug))

  const daily = Array.from(db.daily.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([day, d]) => ({ day, sessions: d.sessions, sec: d.sec, home: d.home }))
    .slice(-60)
  const hourly = []
  for (let h = 0; h < 24; h++) hourly.push({ hour: h, sessions: db.hourly.get(h) || 0 })
  const dwellTop = Array.from(db.dwell.values())
    .sort((a, b) => b.sec - a.sec)
    .slice(0, 10)
    .map((d) => ({ slug: d.slug, i: d.i, sec: Math.round(d.sec) }))

  return {
    generatedAt: now,
    uptimeSec: Math.round((now - t0) / 1000),
    counts: {
      home: db.counts.home, player: db.counts.player, sessions: db.counts.sessions,
      fiveMin: db.counts.fiveMin, completed: db.counts.completed, reachedEnd: db.counts.reachedEnd,
      durationSec: db.counts.durationSec, clients: db.clients.size, badLines: db.counts.badLines,
    },
    units,
    daily,
    hourly,
    dwellTop,
  }
}

/** /api/raw 原始事件导出（?limit=、?after=<ts> 可选） */
export function rawEvents(limit = 500, after = 0) {
  const out = []
  if (fs.existsSync(EVENTS_FILE)) {
    const lines = fs.readFileSync(EVENTS_FILE, 'utf8').split('\n')
    for (const line of lines) {
      if (!line.trim()) continue
      let e
      try { e = JSON.parse(line) } catch { continue }
      if (e.ts && e.ts < after) continue
      out.push(e)
      if (out.length >= limit) break
    }
  }
  return out
}

/** /api/health 健康检查 */
export function health() {
  return {
    ok: true,
    uptime: Math.round((Date.now() - t0) / 1000),
    events: db.counts.sessions + db.counts.home + db.counts.player,
    clients: db.clients.size,
  }
}

/** 摘要（--stats 命令行用） */
export function summary() {
  return {
    ...db.counts,
    clients: db.clients.size,
    units: db.units.size,
  }
}

export function init() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  replay()
}
