/* ============================================================
   智能软件工程基础 · 幻灯片行为统计采集器
   功能：首页/小节打开、≥5 分钟播放、完播、浏览时长、浏览习惯的采集与上报
   数据流：本地聚合 → 静默上报 → 统计服务 stats-server.js → stats.html 报表
   ============================================================
   端点配置优先级（三者取最先命中）：
     1) 页面内联：<script>window.SLIDE_STATS_ENDPOINT="https://…";</script>（在 stats.js 之前）
     2) localStorage：slides-stats-endpoint（可用 console 或 setEndpoint() 覆盖）
     3) 默认：http://localhost:3939
   端点设为空串 / 'off' / 'false' / '0' / 'none' 时统计禁用。
   服务不可达 / 禁用时本模块一切静默降级，绝不抛异常、绝不影响幻灯片使用。
   ============================================================ */
(function () {
  "use strict";

  var DEFAULT_ENDPOINT = "http://localhost:3939";
  var ENDPOINT_KEY = "slides-stats-endpoint";
  var QUEUE_KEY = "slides-stats-queue";
  var CID_KEY = "slides-stats-cid";

  var FLUSH_INTERVAL = 30000;     // 定期上报
  var FLUSH_BATCH = 20;           // 队列达此数即时上报
  var QUEUE_MAX = 50;             // localStorage 兜底队列上限（条）
  var QUEUE_MAX_BYTES = 20000;    // localStorage 兜底队列上限（字节）
  var HEARTBEAT_INTERVAL = 60000; // 心跳
  var FIVE_MIN = 300000;          // 5 分钟阈值
  var COMPLETE_DWELL = 30000;     // 末页停留 ≥30s 才算完播
  var DWELL_MIN = 3000;           // 单页停留 ≥3s 才记录

  var queue = [];
  var session = null;
  var runtimeEndpoint = null;   // setEndpoint() 设置后优先于内联/存储配置

  /* ---------- 端点与开关 ---------- */

  function getEndpoint() {
    if (runtimeEndpoint !== null) return runtimeEndpoint;
    try {
      if (window.SLIDE_STATS_ENDPOINT !== undefined) {
        return String(window.SLIDE_STATS_ENDPOINT || "").trim();
      }
    } catch (e) {}
    try {
      var ls = localStorage.getItem(ENDPOINT_KEY);
      if (ls != null) return String(ls).trim();
    } catch (e) {}
    return DEFAULT_ENDPOINT;
  }

  function isEnabled() {
    var ep = getEndpoint();
    if (!ep) return false;
    var low = ep.toLowerCase();
    return low !== "off" && low !== "false" && low !== "0" && low !== "none" && low !== "no";
  }

  function setEndpoint(url) {
    runtimeEndpoint = String(url == null ? "" : url).trim();
    try { localStorage.setItem(ENDPOINT_KEY, runtimeEndpoint); } catch (e) {}
  }

  /* ---------- 工具 ---------- */

  function genId() {
    return "e_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  }
  function genSid() {
    return "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function cid() {
    try {
      var c = localStorage.getItem(CID_KEY);
      if (!c) { c = "c_" + Math.random().toString(36).slice(2, 12); localStorage.setItem(CID_KEY, c); }
      return c;
    } catch (e) { return "c_anon"; }
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function base() {
    var d = new Date();
    return {
      v: 1,
      id: genId(),
      cid: cid(),
      ts: Date.now(),
      localDay: d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()),
      localHour: d.getHours(),
      tz: -d.getTimezoneOffset(),
    };
  }
  function url() {
    return getEndpoint().replace(/\/+$/, "") + "/api/collect";
  }

  /* ---------- 发送缓冲（队列 + 节流 + localStorage 兜底） ---------- */

  function enqueue(ev) {
    queue.push(ev);
    if (queue.length >= FLUSH_BATCH) flush();
  }

  // 常规上报：fetch keepalive，失败进兜底队列
  function flush() {
    if (!isEnabled()) { queue = []; return; }
    if (!queue.length) return;
    var batch = queue.splice(0, queue.length);
    var payload = JSON.stringify(batch);
    try {
      fetch(url(), { method: "POST", keepalive: true, headers: { "Content-Type": "text/plain" }, body: payload })
        .catch(function () { stash(batch); });
    } catch (e) { stash(batch); }
  }

  // 页面卸载前上报：sendBeacon 优先（无预检、unload 可靠），失败回退 fetch keepalive
  function flushFinal() {
    if (!isEnabled()) { queue = []; return; }
    if (!queue.length) return;
    var batch = queue.splice(0, queue.length);
    var payload = JSON.stringify(batch);
    var ok = false;
    try {
      if (navigator.sendBeacon) {
        ok = navigator.sendBeacon(url(), new Blob([payload], { type: "text/plain" }));
      }
    } catch (e) {}
    if (!ok) {
      try {
        fetch(url(), { method: "POST", keepalive: true, headers: { "Content-Type": "text/plain" }, body: payload })
          .catch(function () { stash(batch); });
      } catch (e) { stash(batch); }
    }
  }

  function readQueue() {
    try {
      var raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function stash(events) {
    if (!events || !events.length) return;
    try {
      var merged = readQueue().concat(events);
      if (merged.length > QUEUE_MAX) merged = merged.slice(merged.length - QUEUE_MAX);
      var s = JSON.stringify(merged);
      while (merged.length > 1 && s.length > QUEUE_MAX_BYTES) {
        merged.shift();
        s = JSON.stringify(merged);
      }
      localStorage.setItem(QUEUE_KEY, s);
    } catch (e) {}
  }

  function pumpQueue() {
    var pending = readQueue();
    if (!pending.length) return;
    try { localStorage.removeItem(QUEUE_KEY); } catch (e) {}
    queue = queue.concat(pending);
    flush();
  }

  /* ---------- 会话模型 ---------- */

  function startSession(info) {
    if (!isEnabled()) return;
    endSession(); // 结算上一个会话（如有）
    info = info || {};
    session = {
      sid: genSid(),
      slug: info.slug || null,
      mode: info.mode || null,
      title: info.title || null,
      slides: info.slides || 0,
      start: Date.now(),
      cur: 0,
      maxSlide: 0,
      slideStartTs: Date.now(),
      reachedEnd: false,
      endEnteredAt: 0,
      nav: { next: 0, prev: 0, jump: 0 },
      tts: { plays: 0, sec: 0, activeSince: 0 },
      features: { fullscreen: 0, overview: 0, theme: 0, zoom: 0, recording: 0 },
      dwell: {},
      _miles: {},
      _done: false,
    };
  }

  // 由播放器 go() 在换页后调用：结算上一页停留、记录当前页与末页到达
  function setSlide(i, total) {
    if (!session || session._done) return;
    var now = Date.now();
    if (i !== session.cur) {
      var dwellMs = now - session.slideStartTs;
      if (dwellMs >= DWELL_MIN) session.dwell[session.cur] = (session.dwell[session.cur] || 0) + dwellMs;
    }
    session.cur = i;
    session.slideStartTs = now;
    if (i > session.maxSlide) session.maxSlide = i;
    if (total > 0 && i === total - 1 && !session.reachedEnd) {
      session.reachedEnd = true;
      session.endEnteredAt = now;
      milestone("endReached");
    }
  }

  function trackNav(dir) {
    if (!session || session._done) return;
    if (session.nav[dir] !== undefined) session.nav[dir]++;
  }

  function trackTTS(kind) {
    if (!session || session._done) return;
    var now = Date.now();
    if (kind === "play") {
      session.tts.plays++;
    } else if (kind === "start") {
      if (!session.tts.activeSince) session.tts.activeSince = now;
    } else if (kind === "stop") {
      // 幂等：cancel 与 onend 双触发只结算一次
      if (session.tts.activeSince) {
        session.tts.sec += (now - session.tts.activeSince) / 1000;
        session.tts.activeSince = 0;
      }
    }
  }

  function trackFeature(name) {
    if (!session || session._done) return;
    if (session.features[name] !== undefined) session.features[name]++;
  }

  // 一次性里程碑（防 pagehide 丢失导致会话级指标漏计）
  function milestone(name) {
    if (!session || session._done) return;
    if (session._miles[name]) return;
    session._miles[name] = true;
    enqueue(mergeBase({ type: "milestone", name: name, sid: session.sid, slug: session.slug }));
    flush();
  }

  function endSession() {
    if (!session || session._done) return;
    session._done = true;
    var now = Date.now();

    // 结算当前页停留
    var dwellMs = now - session.slideStartTs;
    if (dwellMs >= DWELL_MIN) session.dwell[session.cur] = (session.dwell[session.cur] || 0) + dwellMs;

    var duration = now - session.start;
    var fiveMin = duration >= FIVE_MIN;
    var completed = session.reachedEnd && (now - session.endEnteredAt) >= COMPLETE_DWELL;

    var pageDwell = Object.keys(session.dwell).map(function (k) {
      return [+k, session.dwell[k]];
    });

    var ev = mergeBase({
      type: "session",
      sid: session.sid,
      slug: session.slug,
      mode: session.mode,
      title: session.title,
      slides: session.slides,
      start: session.start,
      end: now,
      duration: duration,
      fiveMin: fiveMin,
      reachedEnd: session.reachedEnd,
      completed: completed,
      maxSlide: session.maxSlide,
      nav: session.nav,
      tts: { plays: session.tts.plays, sec: Math.round(session.tts.sec) },
      features: session.features,
      pageDwell: pageDwell,
    });

    var s = session;
    session = null;
    enqueue(ev);
    flush();
  }

  // 页面级打开（首页/播放器），不受会话状态影响
  function pageview(page, extra) {
    if (!isEnabled()) return;
    var ev = mergeBase({ type: "view", page: page });
    if (extra && extra.slug) ev.slug = extra.slug;
    enqueue(ev);
    flush();
  }

  function mergeBase(extra) {
    var b = base();
    for (var k in extra) b[k] = extra[k];
    return b;
  }

  /* ---------- 心跳与生命期 ---------- */

  function startHeartbeat() {
    if (!isEnabled()) return;
    clearInterval(startHeartbeat._t);
    startHeartbeat._t = setInterval(function () {
      if (!session || session._done) return;
      var now = Date.now();
      if (!session._miles.fiveMin && now - session.start >= FIVE_MIN) milestone("fiveMin");
      enqueue(mergeBase({ type: "hb", sid: session.sid, slug: session.slug, cur: session.cur }));
      if (queue.length) flush();
    }, HEARTBEAT_INTERVAL);
  }

  // 供报表页 stats.html 复用：GET 聚合报表，超时/失败返回 null
  function fetchStats(url) {
    return new Promise(function (resolve) {
      if (!isEnabled()) { resolve(null); return; }
      var done = false;
      var timer = setTimeout(function () { if (!done) { done = true; resolve(null); } }, 8000);
      try {
        fetch(url, { method: "GET" })
          .then(function (r) {
            if (done) return;
            if (!r.ok) { done = true; clearTimeout(timer); resolve(null); return; }
            return r.json().then(function (d) {
              if (!done) { done = true; clearTimeout(timer); resolve(d); }
            });
          })
          .catch(function () { if (!done) { done = true; clearTimeout(timer); resolve(null); } });
      } catch (e) { if (!done) { done = true; clearTimeout(timer); resolve(null); } }
    });
  }

  /* ---------- 启动 ---------- */

  // stats.html 设置 window.SLIDE_STATS_NO_AUTO=true 时只暴露 API，不自动采集/上报
  if (!window.SLIDE_STATS_NO_AUTO) {
    window.addEventListener("pagehide", function () {
      endSession();
      flushFinal();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") flush(); // 切标签≠离开，只发不结算
    });
    pumpQueue();
    startHeartbeat();
    setInterval(function () { if (queue.length) flush(); }, FLUSH_INTERVAL);
  }

  window.SlideStats = {
    pageview: pageview,
    startSession: startSession,
    setSlide: setSlide,
    trackNav: trackNav,
    trackTTS: trackTTS,
    trackFeature: trackFeature,
    milestone: milestone,
    endSession: endSession,
    isEnabled: isEnabled,
    getEndpoint: getEndpoint,
    setEndpoint: setEndpoint,
    fetchStats: fetchStats,
  };
})();
