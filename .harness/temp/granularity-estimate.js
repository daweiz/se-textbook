// 细粒度估算：若拆细策略改为 导引1页/列表按条目拆/表格拆行/图1页，各节能到多少页
const fs = require('fs');
const path = require('path');
const units = require(path.resolve('slides/tools/units.js'));

function loadUnitData(n) {
  const f = 'slides/data/unit-' + String(n).padStart(2, '0') + '.js';
  const src = fs.readFileSync(f, 'utf8');
  const m = src.match(/window\.SLIDES\s*=\s*([\s\S]*?);\s*$/);
  globalThis.__D = eval('(' + m[1] + ')');
  return globalThis.__D;
}

function analyze(html) {
  // 统计 lead 数、list 条目数、table 行数、img 数、h3 数
  let leads = 0, items = 0, rows = 0, imgs = 0, h3s = 0;
  const lines = String(html).split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith('<h3>')) h3s++;
    else if (line.startsWith('<p class="lead">')) leads++;
    else if (line.startsWith('<ul>')) items += (line.match(/<li>/g) || []).length;
    else if (line.startsWith('<table>')) rows += (line.match(/<tr>/g) || []).length;
    else if (line.startsWith('<div class="img-')) imgs += 1;
  }
  return { leads, items, rows, imgs, h3s };
}

console.log('策略估算（不含封面/小结）：导引1页+列表每3条1页+表格每3行1页+图1页');
console.log('unit | 当前 | lead | list@3 | table@3row | img | h3 | 合计页数');
const rows_out = [];
for (const u of units) {
  const obj = loadUnitData(u.num);
  const slides = obj.slides;
  let A = { leads: 0, items: 0, rows: 0, imgs: 0, h3s: 0 };
  for (const s of slides) {
    if (s.type === 'title' || /-end$/.test(s.id)) continue;
    const c = analyze(s.body);
    A.leads += c.leads; A.items += c.items; A.rows += c.rows; A.imgs += c.imgs; A.h3s += c.h3s;
  }
  const pages = A.leads + Math.ceil(A.items / 3) + Math.ceil(A.rows / 3) + A.imgs + A.h3s;
  const withCover = pages + 2; // +封面+小结
  const mark = withCover >= 30 ? '' : ' <-- 不足30';
  rows_out.push({ n: u.num, cur: slides.length, est: withCover, mark });
  console.log('unit-' + String(u.num).padStart(2,'0') + ' | ' + String(slides.length).padStart(2) + ' | ' + A.leads + ' | ' + A.items + ' | ' + A.rows + ' | ' + A.imgs + ' | ' + A.h3s + ' | ≈' + withCover + mark);
}
