// apply-narration.js —— 把人工撰写的旁白合并进数据文件
//
// 用法：
//   node docs/tools/apply-narration.js             # 全部章节 + 全部小节封面
//   node docs/tools/apply-narration.js chapter-05   # 仅第 5 章
//   node docs/tools/apply-narration.js unit-08      # 仅第 8 小节（封面）
//
// 说明：
//   - 章节旁白：tools/narration/chapter-NN.js（window.NARRATION，按 slide id 键控）
//   - 小节封面旁白：tools/narration/unit-covers.js（window.NARRATION，键名 unitNN-cover）
//   - 脚本按 slide id 合并到数据文件的 narration 字段；子页旁白为 generate.js 自动派生，不受影响
//   - 报告每章/每节覆盖情况（缺/多），便于检查遗漏
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'docs', 'data');
const NARR_DIR = path.join(__dirname, 'narration');
const UNIT_COVERS_FILE = path.join(NARR_DIR, 'unit-covers.js');

function chapterSlugs() {
  return fs
    .readdirSync(path.join(ROOT, 'src'))
    .filter((d) => /^chapter-\d{2}$/.test(d))
    .sort();
}

function unitSlugs() {
  const file = path.join(DATA_DIR, '_manifest.js');
  if (!fs.existsSync(file)) return [];
  const sandbox = {};
  Function('window', fs.readFileSync(file, 'utf8') + '\nreturn window.UNITS;')(sandbox);
  return (sandbox.UNITS || []).map((u) => u.slug);
}

function loadNarration(file) {
  if (!fs.existsSync(file)) return null;
  const sandbox = {};
  Function('window', fs.readFileSync(file, 'utf8') + '\nreturn window.NARRATION;')(sandbox);
  return sandbox.NARRATION || null;
}

function loadSlides(slug) {
  const dataFile = path.join(DATA_DIR, `${slug}.js`);
  if (!fs.existsSync(dataFile)) return { dataFile, slides: null };
  const sandbox = {};
  Function('window', fs.readFileSync(dataFile, 'utf8') + '\nreturn window.SLIDES;')(sandbox);
  return { dataFile, slides: sandbox.SLIDES };
}

/** 合并章节旁白：每张幻灯片都必须有对应旁白键 */
function applyChapter(slug) {
  const narr = loadNarration(path.join(NARR_DIR, `${slug}.js`));
  if (!narr) {
    console.log(`[跳过] ${slug}：无旁白文件 tools/narration/${slug}.js`);
    return false;
  }
  const { dataFile, slides } = loadSlides(slug);
  if (!slides) {
    console.log(`[错误] ${slug}：数据文件不存在或无法解析，请先运行 generate.js`);
    return false;
  }

  let missing = 0;
  for (const s of slides.slides) {
    if (narr[s.id] !== undefined && narr[s.id].trim() !== '') {
      s.narration = narr[s.id];
    } else {
      missing++;
      console.log(`  [缺] ${slug} / ${s.id}（${s.title}）`);
    }
  }
  const extra = Object.keys(narr).filter((k) => !slides.slides.some((s) => s.id === k));
  if (extra.length) {
    console.log(`  [多余键] ${slug}：${extra.join(', ')}`);
  }
  writeData(dataFile, slides);
  const total = slides.slides.length;
  console.log(`[合并] ${slug}：${total - missing}/${total} 张幻灯片旁白已注入${missing ? `（缺 ${missing}）` : ''}`);
  return missing === 0 && extra.length === 0;
}

/** 合并小节封面旁白：封面片必须有对应旁白键；子页沿用自动派生旁白 */
function applyUnit(slug) {
  const narr = loadNarration(UNIT_COVERS_FILE);
  if (!narr) {
    console.log(`[跳过] ${slug}：无封面旁白文件 tools/narration/unit-covers.js`);
    return false;
  }
  const { dataFile, slides } = loadSlides(slug);
  if (!slides) {
    console.log(`[错误] ${slug}：数据文件不存在或无法解析，请先运行 generate.js`);
    return false;
  }

  const prefix = slug.replace('-', '') + '-'; // unit05-
  let missing = 0;
  for (const s of slides.slides) {
    const key = narr[s.id];
    if (key !== undefined && key.trim() !== '') {
      s.narration = key;
    } else if (!s.narration || !s.narration.trim()) {
      missing++;
      console.log(`  [缺] ${slug} / ${s.id}（${s.title}）`);
    }
  }
  const extra = Object.keys(narr)
    .filter((k) => k.startsWith(prefix) && !slides.slides.some((s) => s.id === k));
  if (extra.length) {
    console.log(`  [多余键] ${slug}：${extra.join(', ')}`);
  }
  writeData(dataFile, slides);
  const total = slides.slides.length;
  console.log(`[合并] ${slug}：${total - missing}/${total} 张幻灯片旁白已注入${missing ? `（缺 ${missing}）` : ''}`);
  return missing === 0 && extra.length === 0;
}

function writeData(dataFile, slidesData) {
  const out = '// 由 docs/tools/generate.js 生成，旁白由 tools/apply-narration.js 合并\nwindow.SLIDES = ' + JSON.stringify(slidesData, null, 2) + ';\n';
  fs.writeFileSync(dataFile, out, 'utf8');
}

function main() {
  const only = process.argv.slice(2);
  const chapters = (only.length ? only : chapterSlugs()).filter((a) => /^chapter-\d{2}$/.test(a));
  const units = (only.length ? only : unitSlugs()).filter((a) => /^unit-\d{2}$/.test(a));
  const unknown = only.filter((a) => !/^chapter-\d{2}$/.test(a) && !/^unit-\d{2}$/.test(a));
  if (unknown.length) {
    console.error(`未知参数：${unknown.join(', ')}（应为 chapter-NN 或 unit-NN）`);
    process.exit(2);
  }

  let anyProblem = false;
  for (const slug of chapters) {
    if (!applyChapter(slug)) anyProblem = true;
  }
  for (const slug of units) {
    if (!applyUnit(slug)) anyProblem = true;
  }

  if (anyProblem) {
    console.log('\n注意：存在遗漏或多出键，请检查。');
    process.exit(1);
  }
  console.log('\n全部旁白合并完成。');
}

main();
