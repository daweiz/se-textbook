/* ============================================================
   智能软件工程基础 · 幻灯片播放器核心逻辑
   功能：全屏播放、TTS 语音朗读、字幕高亮、录屏下载
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 工具 ---------- */
  const $ = (id) => document.getElementById(id);
  const qs = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function params() {
    const p = new URLSearchParams(location.search);
    return { ch: p.get("ch"), u: p.get("u"), autoplay: p.has("auto") };
  }

  function toast(msg, ms) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), ms || 1800);
  }

  /* ---------- 状态 ---------- */
  let CHAPTER = null;        // window.SLIDES 章节数据
  let CUR = 0;               // 当前幻灯片下标
  let REC = null;            // 录屏状态
  let speaking = false;      // TTS 是否正在朗读
  let ZOOM = 1;              // 字号缩放倍率（0.8–1.6，步进 0.1）

  /* ---------- 章节数据加载 ---------- */
  function loadChapter(slug) {
    const meta = (window.CHAPTERS || []).find((c) => c.slug === slug);
    if (!meta) { showError("未找到章节 " + slug + "。请从章节菜单页进入播放器。"); return; }

    const tag = document.createElement("script");
    tag.src = meta.file;
    tag.onload = () => {
      if (!window.SLIDES) { showError("章节数据文件加载后未定义 window.SLIDES。"); return; }
      CHAPTER = window.SLIDES;
      initPlayer();
    };
    tag.onerror = () => showError("无法加载章节数据文件：" + meta.file);
    document.head.appendChild(tag);
  }

  function showError(msg) {
    const box = $("load-error");
    qs(".err-msg", box).textContent = msg;
    box.classList.add("visible");
  }

  /* ---------- 小节数据加载 ---------- */
  function loadUnit(slug) {
    const meta = (window.UNITS || []).find((u) => u.slug === slug);
    if (!meta) { showError("未找到小节 " + slug + "。请从小节菜单页进入播放器。"); return; }

    const tag = document.createElement("script");
    tag.src = meta.file;
    tag.onload = () => {
      if (!window.SLIDES) { showError("小节数据文件加载后未定义 window.SLIDES。"); return; }
      CHAPTER = window.SLIDES;
      initPlayer();
    };
    tag.onerror = () => showError("无法加载小节数据文件：" + meta.file);
    document.head.appendChild(tag);
  }

  /* ---------- 初始化播放器 ---------- */
  function initPlayer() {
    // 统计：会话开始（= 每小节/章节打开次数），initPlayer 是数据加载成功后的唯一入口
    if (window.SlideStats) SlideStats.startSession({
      slug: CHAPTER.slug,
      mode: params().u ? "unit" : "chapter",
      slides: CHAPTER.slides.length,
      title: CHAPTER.title,
      unit: CHAPTER.unit || null,
      minutes: CHAPTER.minutes || null,
    });
    $("chapter-title").textContent = CHAPTER.unit
      ? "第" + CHAPTER.unit + "节　" + CHAPTER.title + "（" + CHAPTER.minutes + " 分钟）"
      : "第" + CHAPTER.num + "章　" + CHAPTER.title;
    $("count-badge").textContent = "1 / " + CHAPTER.slides.length;

    buildDots();
    render();
    bindEvents();
    populateVoices();
    window.speechSynthesis && window.speechSynthesis.onvoiceschanged && (window.speechSynthesis.onvoiceschanged = populateVoices);

    if (params().autoplay) playTTS();
  }

  /* ---------- 渲染幻灯片 ---------- */
  function render() {
    const s = CHAPTER.slides[CUR];
    const stage = $("slide");
    const isTitle = s.type === "title";

    let html = '<h1 class="slide-title' + (isTitle ? " type-title" : "") + '">' + esc(s.title) + "</h1>";
    if (s.body) {
      // 小节封面片（cover-meta + 本讲导引）与普通内容页都渲染正文
      html += '<div class="slide-body' + (isTitle ? " cover" : "") + '">' + s.body + "</div>";
    } else if (isTitle) {
      // 章封面片：仅副标题
      html += '<div class="slide-sub">' + esc(CHAPTER.subtitle || "") + "</div>";
    }
    stage.innerHTML = html;

    $("count-badge").textContent = (CUR + 1) + " / " + CHAPTER.slides.length;
    $("progress-bar").style.width = ((CUR + 1) / CHAPTER.slides.length * 100) + "%";

    updateDots();
    stopTTS(true);
    renderSubtitle();

    // 溢出时按内容量微调字号
    fitSlide();
  }

  function fitSlide() {
    const stage = $("slide");
    const body = qs(".slide-body", stage);
    if (!body) return;
    let ratio = 1;
    for (let i = 0; i < 12 && ratio > 0.7; i++) {
      if (stage.scrollHeight > stage.clientHeight + 2 && body.scrollHeight > body.clientHeight) {
        ratio -= 0.04;
        body.style.fontSize = "calc(clamp(16px,2.4vh,28px) * " + ratio + " * " + ZOOM + ")";
      } else break;
    }
  }

  /* ---------- 字号缩放（工具条 A− / A+，快捷键 - / = / 0） ---------- */
  function applyZoom() {
    const z = Math.min(1.6, Math.max(0.8, ZOOM));
    ZOOM = Math.round(z * 10) / 10;
    document.documentElement.style.setProperty("--slide-zoom", String(ZOOM));
    const label = $("zoom-label");
    if (label) label.textContent = Math.round(ZOOM * 100) + "%";
    try { localStorage.setItem("slides-zoom", String(ZOOM)); } catch {}
    fitSlide();   // 重新按新字号自适应溢出
  }
  function setZoom(delta) {
    ZOOM = Math.round((ZOOM + delta) * 10) / 10;
    if (ZOOM > 1.6) ZOOM = 1.6;
    if (ZOOM < 0.8) ZOOM = 0.8;
    applyZoom();
    if (window.SlideStats) SlideStats.trackFeature("zoom");
  }
  function initZoom() {
    let z = 1;
    try { z = parseFloat(localStorage.getItem("slides-zoom")) || 1; } catch {}
    ZOOM = z;
    applyZoom();
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ---------- 导航 ---------- */
  function go(i) {
    if (!CHAPTER) return;
    i = Math.max(0, Math.min(CHAPTER.slides.length - 1, i));
    if (i === CUR) return;
    const from = CUR;
    CUR = i;
    render();
    // 统计：翻页方向（next/prev/jump）与单页停留结算（所有翻页入口最终汇入此处）
    if (window.SlideStats) {
      SlideStats.trackNav(i === from + 1 ? "next" : i === from - 1 ? "prev" : "jump");
      SlideStats.setSlide(i, CHAPTER.slides.length);
    }
  }
  const next = () => go(CUR + 1);
  const prev = () => go(CUR - 1);

  function buildDots() {
    const box = $("dots");
    box.innerHTML = "";
    CHAPTER.slides.forEach((s, i) => {
      const d = document.createElement("button");
      d.className = "dot";
      d.title = s.title;
      d.addEventListener("click", () => go(i));
      box.appendChild(d);
    });
  }
  function updateDots() {
    qsa("#dots .dot").forEach((d, i) => d.classList.toggle("on", i === CUR));
  }

  /* ---------- 字幕 ---------- */
  function renderSubtitle() {
    const sub = $("subtitle");
    const narration = CHAPTER.slides[CUR].narration || "";
    sub.classList.toggle("visible", subEnabled && narration !== "");
    sub.classList.remove("no-phrases");
    sub.innerHTML = "";
    _phrases = [];
    if (!narration) return;
    const parts = narration.match(/[^。！？；]+[。！？；]?/g) || [narration];
    parts.forEach((p) => {
      const span = document.createElement("span");
      span.className = "phrase";
      span.textContent = p;
      span.dataset.len = p.length;
      sub.appendChild(span);
      _phrases.push(span);
    });
  }
  let _phrases = [];
  let _phraseOffsets = [];
  function computePhraseOffsets() {
    let acc = 0;
    _phraseOffsets = _phrases.map((sp) => { const o = acc; acc += sp.dataset.len * 1; return o; });
  }
  function highlightAt(charIndex) {
    if (!_phrases.length) return;
    computePhraseOffsets();
    let idx = 0;
    for (let i = 0; i < _phraseOffsets.length; i++) {
      if (charIndex >= _phraseOffsets[i]) idx = i;
    }
    setActivePhrase(idx);
  }
  function setActivePhrase(idx) {
    _phrases.forEach((sp, i) => sp.classList.toggle("active", i === idx));
  }

  /* ---------- TTS 语音朗读 ---------- */
  let subEnabled = true;

  function populateVoices() {
    const sel = $("voice-select");
    if (!sel || !window.speechSynthesis) return;
    const voices = speechSynthesis.getVoices();
    const zh = voices.filter((v) => (v.lang || "").toLowerCase().startsWith("zh"));
    const all = zh.length ? zh : voices;
    const cur = sel.value;
    sel.innerHTML = "";
    all.forEach((v) => {
      const o = document.createElement("option");
      o.value = v.name;
      o.textContent = v.name + "（" + v.lang + "）";
      sel.appendChild(o);
    });
    if (all.length === 0) {
      sel.innerHTML = '<option value="">未检测到中文语音</option>';
      return;
    }
    // 优先微软晓晓 / 微软云希 / Huihui / 普通话
    const prefer = cur || ["Xiaoxiao", "Xiaoyi", "Huihui", "Yunxi", "Yunyang", "普通话"].find((n) => voices.some((v) => v.name.includes(n))) || all[0].name;
    if ([...sel.options].some((o) => o.value === prefer)) sel.value = prefer;
  }

  function playTTS() {
    if (!window.speechSynthesis) { toast("当前浏览器不支持语音合成（Web Speech API）"); return; }
    const text = CHAPTER.slides[CUR].narration;
    if (!text) { toast("本页无旁白文本"); return; }

    stopTTS(true);
    // 统计：TTS 播放次数 + 朗读段起点（音色/语速/音量变更重播也如实计为一次新播）
    if (window.SlideStats) { SlideStats.trackTTS("play"); SlideStats.trackTTS("start"); }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    const vsel = $("voice-select");
    if (vsel && vsel.value) u.voice = speechSynthesis.getVoices().find((v) => v.name === vsel.value) || null;
    u.rate = parseFloat($("rate").value);
    u.pitch = parseFloat($("pitch").value);
    u.volume = parseFloat($("volume").value);

    computePhraseOffsets();
    let bCount = 0;

    u.onboundary = (e) => {
      bCount++;
      clearTimeout(u._fallback);
      const idx = e.charIndex != null ? e.charIndex : e.charLength != null ? e.charLength : 0;
      highlightAt(idx);
    };
    u.onstart = () => {
      speaking = true;
      syncTTSButtons();
      computePhraseOffsets();
      // 兜底：浏览器迟迟不派发 boundary 事件时，按字长估算高亮
      clearTimeout(u._fallback);
      u._fallback = setTimeout(() => {
        if (bCount === 0) fallbackHighlight(text, u.rate);
      }, 500);
    };
    u.onend = () => {
      if (window.SlideStats) SlideStats.trackTTS("stop");   // 自然读完结算朗读时长（幂等）
      speaking = false;
      clearTimeout(u._fallback);
      clearTimeout(fallbackHighlight._tEnd);
      setActivePhrase(-1);
      syncTTSButtons();
      if (autoNext.checked) setTimeout(next, 600);
    };
    u.onerror = (e) => {
      // 大多数浏览器在更换语音时抛 'interrupted'/'canceled'，忽略之
      if (e.error === "interrupted" || e.error === "canceled") return;
      speaking = false;
      syncTTSButtons();
      toast("语音播放出错：" + e.error);
    };

    speechSynthesis.speak(u);
  }

  function fallbackHighlight(text, rate) {
    clearTimeout(fallbackHighlight._tEnd);
    computePhraseOffsets();
    const total = text.length;
    const durPerChar = 1000 / 4 / (rate || 1); // 约每秒 4 字
    _phraseOffsets.forEach((off, i) => {
      const start = off * durPerChar;
      const len = (_phrases[i].dataset.len || 1) * durPerChar;
      setTimeout(() => setActivePhrase(i), start);
      setTimeout(() => { if (i < _phraseOffsets.length - 1) setActivePhrase(i + 1); }, start + len);
    });
    fallbackHighlight._tEnd = setTimeout(() => setActivePhrase(-1), (total + 2) * durPerChar);
  }

  function stopTTS(silent) {
    if (window.SlideStats) SlideStats.trackTTS("stop");   // 手动停止 + 自动翻页取消都结算（幂等，防计时泄漏）
    if (window.speechSynthesis) speechSynthesis.cancel();
    speaking = false;
    setActivePhrase(-1);
    if (!silent) syncTTSButtons();
  }
  function toggleTTS() {
    if (speaking) stopTTS(false);
    else playTTS();
  }
  function syncTTSButtons() {
    $("btn-tts").textContent = speaking ? "暂停" : "朗读";
    $("btn-tts").classList.toggle("primary", !speaking);
  }

  /* ---------- 全屏 ---------- */
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => toast("无法进入全屏"));
    if (window.SlideStats) SlideStats.trackFeature("fullscreen");
  }

  /* ---------- 录屏 ---------- */
  async function startRecording() {
    if (REC) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      toast("当前浏览器不支持屏幕录制");
      return;
    }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,   // 捕获标签页音频（含 TTS 朗读声）
      });

      // 共享源与音频提示：真实权衡——「此标签页」有 TTS 语音但顶部有提示条，屏幕/窗口反之
      const vTrack = display.getVideoTracks()[0];
      const surface = vTrack && vTrack.getSettings().displaySurface;
      const hasAudio = display.getAudioTracks().length > 0;
      if (surface === "browser") {
        toast(hasAudio
          ? "正在录「此标签页」：视频顶部会录进共享提示条"
          : "选了「此标签页」但没录到声音：请在弹窗中勾选『同时分享标签页中的音频』", 4500);
      } else if (!hasAudio) {
        toast("选的是「整个屏幕/窗口」：TTS 语音录不进来；要声音请勾选「混入麦克风」或改选「此标签页」", 4500);
      }

      let tracks = display.getTracks();
      let recStream = display;
      let ctx = null;

      // 可选混入麦克风
      if ($("mic").checked) {
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          const dest = ctx.createMediaStreamDestination();
          // 仅当共享流自带音频才接入（屏幕/窗口共享可能无音频轨，直接接入会抛异常导致麦克风也被跳过）
          if (display.getAudioTracks().length) {
            ctx.createMediaStreamSource(display).connect(dest);
          }
          ctx.createMediaStreamSource(mic).connect(dest);
          if (ctx.state === "suspended") ctx.resume().catch(() => {});
          tracks = [...mic.getAudioTracks(), ...display.getTracks()];
          recStream = dest.stream;
          display.getVideoTracks().forEach((t) => dest.stream.addTrack(t)); // 保留视频轨
        } catch {
          toast("无法获取麦克风，仅录制系统声音");
        }
      }

      const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m));
      const rec = new MediaRecorder(recStream, mime ? { mimeType: mime } : undefined);
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        saveBlob(new Blob(chunks, { type: mime || "video/webm" }));
        stopRecordingUI();
        tracks.forEach((t) => t.stop());
        if (ctx) ctx.close();
        REC = null;
      };
      REC = { rec, t0: Date.now(), timer: null };

      rec.start();
      if (window.SlideStats) SlideStats.trackFeature("recording");   // 成功启动录屏才计
      startRecordingUI();
      // 用户点击浏览器"停止共享"时自动收尾
      display.getVideoTracks()[0].addEventListener("ended", () => rec.stop());
      toast("录制中……");
    } catch {
      toast("已取消录屏或无法获取屏幕");
    }
  }

  function stopRec() {
    if (REC) REC.rec.stop();
  }
  function saveBlob(blob) {
    const a = document.createElement("a");
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    a.href = URL.createObjectURL(blob);
    a.download = "slide-" + CHAPTER.slug + "-" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + ".webm";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function startRecordingUI() {
    $("rec-indicator").classList.add("on");
    $("btn-record").textContent = "停止录屏";
    $("btn-record").classList.add("danger");
    $("btn-record").disabled = false;
    recTimer();
  }
  function stopRecordingUI() {
    $("rec-indicator").classList.remove("on");
    $("btn-record").textContent = "开始录屏";
    $("btn-record").classList.remove("danger");
    clearInterval(REC && REC.timer);
  }
  function recTimer() {
    clearInterval(REC && REC.timer);
    REC.timer = setInterval(() => {
      const s = Math.floor((Date.now() - REC.t0) / 1000);
      const pad = (n) => String(n).padStart(2, "0");
      $("rec-timer").textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor((s % 3600) / 60)) + ":" + pad(s % 60);
    }, 500);
  }

  /* ---------- 网格总览 ---------- */
  function openOverview() {
    if (window.SlideStats) SlideStats.trackFeature("overview");
    const ov = $("overview");
    const grid = $("ov-grid");
    grid.innerHTML = "";
    CHAPTER.slides.forEach((s, i) => {
      const b = document.createElement("button");
      b.className = "ov-card";
      b.innerHTML = '<span class="ov-idx">' + (i + 1) + "</span>" + esc(s.title);
      b.addEventListener("click", () => { closeOverview(); go(i); });
      grid.appendChild(b);
    });
    ov.style.display = "flex";
  }
  function closeOverview() {
    $("overview").style.display = "none";
  }

  /* ---------- 键盘 ---------- */
  function onKey(e) {
    if ($("overview").style.display === "flex") {
      if (e.key === "Escape" || e.key === "o" || e.key === "O") closeOverview();
      return;
    }
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea") return;

    switch (e.key) {
      case "ArrowRight": case "ArrowDown": case "PageDown": case " ": e.preventDefault(); next(); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp": e.preventDefault(); prev(); break;
      case "Home": go(0); break;
      case "End": go(CHAPTER.slides.length - 1); break;
      case "f": case "F": toggleFullscreen(); break;
      case "o": case "O": openOverview(); break;
      case "Enter": toggleTTS(); break;
      case "-": case "_": setZoom(-0.1); break;
      case "=": case "+": setZoom(0.1); break;
      case "0": ZOOM = 1; applyZoom(); if (window.SlideStats) SlideStats.trackFeature("zoom"); break;
      default: break;
    }
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    $("btn-prev").addEventListener("click", prev);
    $("btn-next").addEventListener("click", next);
    $("btn-back").addEventListener("click", () => { location.href = "index.html"; });
    $("btn-fullscreen").addEventListener("click", toggleFullscreen);
    $("btn-zoom-out").addEventListener("click", () => setZoom(-0.1));
    $("btn-zoom-in").addEventListener("click", () => setZoom(0.1));
    $("btn-theme").addEventListener("click", toggleTheme);
    $("btn-tts").addEventListener("click", toggleTTS);
    $("btn-stop").addEventListener("click", () => stopTTS(false));
    $("btn-record").addEventListener("click", () => REC ? stopRec() : startRecording());
    $("subtitle-toggle").addEventListener("change", (e) => {
      subEnabled = e.target.checked;
      $("subtitle").classList.toggle("visible", subEnabled);
    });
    $("rate").addEventListener("change", () => { if (speaking) playTTS(); });
    $("voice-select").addEventListener("change", () => { if (speaking) playTTS(); });
    $("overview").addEventListener("click", (e) => { if (e.target === $("overview")) closeOverview(); });

    // 进度条点击跳转
    $("progress").addEventListener("click", (e) => {
      const r = $("progress").getBoundingClientRect();
      const p = (e.clientX - r.left) / r.width;
      go(Math.floor(p * CHAPTER.slides.length));
    });

    // 舞台点击翻页（全屏时点击右半前进、左半后退）
    $("stage").addEventListener("click", (e) => {
      if (document.fullscreenElement && !e.target.closest("button,select,input,label,a")) {
        if (e.clientX > innerWidth / 2) next(); else prev();
      }
    });

    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", () => {
      $("btn-fullscreen").textContent = document.fullscreenElement ? "退出全屏" : "全屏";
    });
  }

  /* ---------- 主题 ---------- */
  function toggleTheme() {
    const html = document.documentElement;
    const dark = html.getAttribute("data-theme") === "dark";
    html.setAttribute("data-theme", dark ? "light" : "dark");
    $("btn-theme").textContent = dark ? "暗色" : "亮色";
    try { localStorage.setItem("slides-theme", dark ? "light" : "dark"); } catch {}
    if (window.SlideStats) SlideStats.trackFeature("theme");
  }
  function initTheme() {
    let t = "light";
    try { t = localStorage.getItem("slides-theme") || "light"; } catch {}
    document.documentElement.setAttribute("data-theme", t);
    $("btn-theme").textContent = t === "dark" ? "亮色" : "暗色";
  }

  /* ---------- 启动 ---------- */
  initTheme();
  initZoom();
  const autoNext = $("auto-next");
  const p = params();
  // 统计：播放器打开（含数据加载失败的情况）
  if (window.SlideStats) SlideStats.pageview("player", { slug: p.u || p.ch || null });
  if (p.u) loadUnit(p.u);
  else if (p.ch) loadChapter(p.ch);
  else {
    showError("缺少播放参数。请从 index.html 小节菜单选择小节进入，或使用 player.html?u=unit-01 直接打开。");
    document.querySelectorAll("#topbar button, #controls button").forEach((b) => (b.disabled = true));
  }
})();
