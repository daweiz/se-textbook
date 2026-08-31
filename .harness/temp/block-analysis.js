// 分析：每节逻辑节内原始块（lead/list/table/img/h3组）数 vs 当前页数
// 目的：估算仅靠拆细能到多少页；若仍不足 30，则需在书稿补内容
const fs = require('fs');
const path = require('path');

// 加载 units.js 与生成器函数
const units = require(path.resolve('docs/tools/units.js'));

function loadUnitData(n) {
  const f = 'docs/data/unit-' + String(n).padStart(2, '0') + '.js';
  const src = fs.readFileSync(f, 'utf8');
  const m = src.match(/window\.SLIDES\s*=\s*([\s\S]*?);\s*$/);
  globalThis.__D = eval('(' + m[1] + ')');
  return globalThis.__D;
}

// 统计原始块：lead/list/table/img/h3 组
function countRawBlocks(html) {
  let leads = 0, lists = 0, tables = 0, imgs = 0, h3s = 0;
  const lines = String(html).split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith('<h3>')) h3s++;
    else if (line.startsWith('<p class="lead">')) leads++;
    else if (line.startsWith('<ul>')) lists++;
    else if (line.startsWith('<table>')) tables++;
    else if (line.startsWith('<div class="img-')) imgs++;
  }
  return { leads, lists, tables, imgs, h3s };
}

let sum = 0;
for (const u of units) {
  const obj = loadUnitData(u.num);
  const slides = obj.slides;
  let totalBlocks = 0;
  // 统计内容页的原始块（封面/小结除外）
  for (const s of slides) {
    if (s.type === 'title' || /-end$/.test(s.id)) continue;
    const c = countRawBlocks(s.body);
    totalBlocks += c.leads + c.lists + c.tables + c.imgs + c.h3s;
  }
  sum += totalBlocks;
  console.log('unit-' + String(u.num).padStart(2,'0') + ': 当前 ' + String(slides.length).padStart(2) + ' 页 | 原始块 ' + String(totalBlocks).padStart(2) + ' (lead/l' + 'ist/table/img/h3)');
}
console.log('原始块总计', sum);
