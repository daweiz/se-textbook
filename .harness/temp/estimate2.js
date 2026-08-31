// 合理细粒度估算：导引页=1页（不吸收后续列表）、列表每4条1页、表格整表1页、图1页、h3并入
const fs = require('fs');
const path = require('path');
const units = require(path.resolve('docs/tools/units.js'));

function loadUnitData(n) {
  const src = fs.readFileSync('docs/data/unit-' + String(n).padStart(2, '0') + '.js', 'utf8');
  const m = src.match(/window\.SLIDES\s*=\s*([\s\S]*?);\s*$/);
  globalThis.__D = eval('(' + m[1] + ')');
  return globalThis.__D;
}

function analyze(html) {
  let leads = 0, items = 0, tables = 0, imgs = 0;
  const lines = String(html).split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith('<p class="lead">')) leads++;
    else if (line.startsWith('<ul>')) items += (line.match(/<li>/g) || []).length;
    else if (line.startsWith('<table>')) tables++;
    else if (line.startsWith('<div class="img-')) imgs++;
  }
  return { leads, items, tables, imgs };
}

const needs = [];
for (const u of units) {
  const obj = loadUnitData(u.num);
  let A = { leads: 0, items: 0, tables: 0, imgs: 0 };
  for (const s of obj.slides) {
    if (s.type === 'title' || /-end$/.test(s.id)) continue;
    const c = analyze(s.body);
    A.leads += c.leads; A.items += c.items; A.tables += c.tables; A.imgs += c.imgs;
  }
  // 页数 = 导引页(lead) + 列表(每4条) + 表格整表 + 图示 + 封面1 + 小结1
  const pages = A.leads + Math.ceil(A.items / 4) + A.tables + A.imgs + 2;
  const status = pages >= 30 ? '' : '  ← 不足30，缺 ' + (30 - pages) + ' 页';
  if (pages < 30) needs.push(u.num);
  const chs = [...new Set(u.parts.map(p => p.ch))].join(',');
  console.log('unit-' + String(u.num).padStart(2,'0') + ' → ' + chs.padEnd(36) + ' | 当前' + String(obj.slides.length).padStart(2) + ' → 拆分后≈' + String(pages).padStart(2) + status);
}
console.log('\n需补内容的节: unit-' + needs.join(', unit-'));
