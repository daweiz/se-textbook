// verify.js —— 校验幻灯片数据完整性
//
// 用法：node slides/tools/verify.js
// 校验内容：
//   1. 章节清单与数据文件一一对应（16 章）；每张幻灯片 id 唯一、type 合法、旁白非空
//   2. 小节清单共 37 节；每节数据字段一致、时长 ∈ [35,60]、含封面片、旁白完整
//   3. 数据中引用的每张图片在书稿 src/chapter-NN/images/ 下真实存在
//   4. 每节讲解 deck 页数 ≥ 30（内容片覆盖数由 tools/units.js 与章节数据动态对照，不重不漏）
// 全部通过输出"校验通过"并返回 0；否则输出问题清单并返回 1。
'use strict';

const fs = require('fs');
const path = require('path');
const units = require('./units');

const ROOT = path.resolve(__dirname, '..', '..'); // book/
const SRC = path.join(ROOT, 'src');
const DATA_DIR = path.join(ROOT, 'slides', 'data');

const problems = [];
let unitTotal = 0;
let imgChecked = 0;

/** 在 Node 沙箱中执行 JS 数据文件，返回 window.<name> */
function loadData(file, name) {
  const src = fs.readFileSync(file, 'utf8');
  const sandbox = {};
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('window', src + `;return window.${name};`);
    return fn(sandbox);
  } catch (e) {
    throw new Error(`解析失败：${e.message}`);
  }
}

function fail(msg) {
  problems.push(msg);
  console.log('  ✗ ' + msg);
}

/** 通用幻灯片结构校验（id 唯一、type 合法、标题存在、可选旁白非空） */
function checkSlides(label, d, needNarration) {
  const ids = new Set();
  const types = new Set(['title', 'section']);
  let noNarr = 0;
  for (const s of d.slides) {
    if (!s.id) fail(`${label}：存在无 id 的幻灯片`);
    else if (ids.has(s.id)) fail(`${label}：幻灯片 id 重复：${s.id}`);
    else ids.add(s.id);

    if (!types.has(s.type)) fail(`${label}：幻灯片 ${s.id} 的 type 非法：${s.type}`);
    if (typeof s.title !== 'string' || !s.title) fail(`${label}：幻灯片 ${s.id} 缺少标题`);
    if (needNarration && (typeof s.narration !== 'string' || !s.narration.trim())) noNarr++;
  }
  if (noNarr > 0) fail(`${label}：${noNarr} 张幻灯片旁白为空`);
  return noNarr;
}

/** 校验数据中引用的图片在书稿 images/ 下真实存在 */
function checkImages(label, d) {
  const re = /<img src="\.\.\/src\/(chapter-\d{2})\/images\/([^/"']+)"/g;
  for (const s of d.slides) {
    let m;
    while ((m = re.exec(s.body || ''))) {
      imgChecked++;
      const p = path.join(SRC, m[1], 'images', m[2]);
      if (!fs.existsSync(p)) fail(`${label} → 图片缺失：${m[1]}/images/${m[2]}`);
    }
  }
}

function main() {
  const manifestFile = path.join(DATA_DIR, '_manifest.js');
  if (!fs.existsSync(manifestFile)) {
    console.error('缺少清单 _manifest.js，请先运行 node slides/tools/generate.js');
    process.exit(1);
  }

  console.log('校验幻灯片数据……\n');

  // —— 1. 章节 ——
  let manifest;
  try {
    manifest = loadData(manifestFile, 'CHAPTERS');
  } catch (e) {
    console.error('[清单] ' + e.message);
    process.exit(1);
  }
  if (manifest.length !== 16) fail(`章节清单应有 16 章，实际 ${manifest.length} 章`);

  for (const entry of manifest) {
    let d;
    try {
      d = loadData(path.join(ROOT, 'slides', entry.file), 'SLIDES');
    } catch (e) {
      fail(`章节数据无法解析：${entry.file}（${e.message}）`);
      continue;
    }
    if (d.slug !== entry.slug) fail(`第 ${entry.num} 章 slug 不一致：数据=${d.slug}，清单=${entry.slug}`);
    if (d.num !== entry.num) fail(`第 ${entry.num} 章章节号不一致：数据=${d.num}`);
    if (d.title !== entry.title) fail(`第 ${entry.num} 章标题不一致：数据=${d.title}，清单=${entry.title}`);
    if (typeof d.subtitle !== 'string') fail(`第 ${entry.num} 章缺少副标题 subtitle`);
    if (!Array.isArray(d.slides) || d.slides.length === 0) {
      fail(`第 ${entry.num} 章 slides 为空`);
      continue;
    }
    checkSlides(`第 ${entry.num} 章`, d, true);
    console.log(`  ✓ 第 ${entry.num} 章　${entry.title}　（${d.slides.length} 张）`);
  }

  // —— 2. 小节 ——
  let unitManifest;
  try {
    unitManifest = loadData(manifestFile, 'UNITS');
  } catch (e) {
    console.error('[小节清单] ' + e.message);
    process.exit(1);
  }
  if (unitManifest.length !== 37) fail(`小节清单应有 37 节，实际 ${unitManifest.length} 节`);

  for (const entry of unitManifest) {
    let d;
    try {
      d = loadData(path.join(ROOT, 'slides', entry.file), 'SLIDES');
    } catch (e) {
      fail(`小节数据无法解析：${entry.file}（${e.message}）`);
      continue;
    }
    if (d.slug !== entry.slug) fail(`第 ${entry.num} 节 slug 不一致：数据=${d.slug}，清单=${entry.slug}`);
    if (d.unit !== entry.num) fail(`第 ${entry.num} 节序号不一致：数据=${d.unit}`);
    if (d.title !== entry.title) fail(`第 ${entry.num} 节标题不一致：数据=${d.title}，清单=${entry.title}`);
    if (d.module !== entry.module) fail(`第 ${entry.num} 节模块不一致：数据=${d.module}`);
    if (d.minutes !== entry.minutes) fail(`第 ${entry.num} 节时长不一致：数据=${d.minutes}`);
    if (!(d.minutes >= 35 && d.minutes <= 60)) fail(`第 ${entry.num} 节时长 ${d.minutes} 不在 [35,60]`);
    if (!Array.isArray(d.slides) || d.slides.length === 0) {
      fail(`第 ${entry.num} 节 slides 为空`);
      continue;
    }
    if (d.count !== d.slides.length) fail(`第 ${entry.num} 节 count 字段不一致：${d.count} ≠ ${d.slides.length}`);
    const cover = d.slides.find((s) => s.id === entry.slug.replace('-', '') + '-cover');
    if (!cover) fail(`第 ${entry.num} 节缺少封面片 ${entry.slug.replace('-', '')}-cover`);
    else if (cover.type !== 'title') fail(`第 ${entry.num} 节封面片 type 非 title`);
    else if (!cover.narration || !cover.narration.trim()) fail(`第 ${entry.num} 节封面旁白为空（需 tools/narration/unit-covers.js）`);

    checkSlides(`第 ${entry.num} 节`, d, true);
    checkImages(`第 ${entry.num} 节`, d);
    unitTotal += d.slides.length;
    if (d.slides.length < 30) fail(`第 ${entry.num} 节仅有 ${d.slides.length} 页，要求每节 ≥ 30 页`);
    console.log(`  ✓ 第 ${entry.num} 节　${entry.title}　（${d.slides.length} 张 · ${d.minutes} 分钟${d.qa ? '·含' + d.qa : ''}）`);
  }

  // —— 3. 章节内容片覆盖：全部内容片逐一分配、不重不漏（对照 tools/units.js） ——
  const covered = new Map();
  let assigned = 0;
  for (const u of units) {
    for (const part of u.parts) {
      const chFile = path.join(DATA_DIR, `${part.ch}.js`);
      let d;
      try {
        d = loadData(chFile, 'SLIDES');
      } catch (e) {
        fail(`覆盖校验：${part.ch}.js 无法解析`);
        continue;
      }
      const maxIdx = d.slides.length - 1;
      if (part.from < 1 || part.to > maxIdx || part.from > part.to) {
        fail(`第 ${u.num} 节 ${part.ch} 范围 ${part.from}-${part.to} 超界（内容片 1–${maxIdx}）`);
        continue;
      }
      for (let i = part.from; i <= part.to; i++) {
        const k = `${part.ch}:${i}`;
        if (covered.has(k)) fail(`章节内容片重复分配：${k}（第 ${covered.get(k)} 节与第 ${u.num} 节）`);
        covered.set(k, u.num);
        assigned++;
      }
    }
  }
  let expectTotal = 0;
  for (const entry of manifest) {
    const d = loadData(path.join(ROOT, 'slides', entry.file), 'SLIDES');
    expectTotal += d.slides.length - 1;
  }
  if (assigned !== expectTotal) fail(`内容片覆盖总数 ${assigned} 应等于 ${expectTotal}`);

  // 汇总
  console.log('\n──────────────────────────────');
  console.log(`共 ${manifest.length} 章、${unitManifest.length} 节、${unitTotal} 张讲解幻灯片，覆盖 ${assigned} 张内容片，校验图片 ${imgChecked} 处。`);
  if (problems.length === 0) {
    console.log('✅ 校验通过：数据可解析、id 唯一、时长与覆盖完整、图片引用齐全、旁白完整。');
    process.exit(0);
  } else {
    console.log(`❌ 校验未通过，共 ${problems.length} 个问题：`);
    problems.forEach((p) => console.log('   ' + p));
    process.exit(1);
  }
}

main();
