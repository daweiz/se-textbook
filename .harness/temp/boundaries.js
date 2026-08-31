// 提取每章薄弱节边界：薄弱节覆盖的最后一个内容片标题 + 下一节（第二个 unit）起始片标题
const fs = require('fs');
const path = require('path');
const units = require(path.resolve('slides/tools/units.js'));
const thin = new Set([1, 3, 5, 7, 10, 12, 14, 16, 18, 20, 22, 24, 28]);

function chSlides(ch) {
  const src = fs.readFileSync('slides/data/' + ch + '.js', 'utf8');
  const m = src.match(/window\.SLIDES\s*=\s*([\s\S]*?);\s*$/);
  return eval('(' + m[1] + ')').slides;
}

// 每章第二个 unit 的起始片
const secondStart = {};
for (const u of units) {
  if (thin.has(u.num)) continue;
  for (const p of u.parts) secondStart[p.ch] = p.from;
}
// 每章薄弱节最后一片的片号
const thinEnd = {};
for (const u of units) {
  if (!thin.has(u.num)) continue;
  for (const p of u.parts) thinEnd[p.ch] = Math.max(thinEnd[p.ch] || 0, p.to);
}

for (const ch of Object.keys(secondStart).sort()) {
  const s = chSlides(ch);
  const end = thinEnd[ch];
  const start = secondStart[ch];
  if (end === undefined) continue;
  console.log('### ' + ch);
  console.log('  薄弱节末片 #' + end + '：「' + s[end].title + '」');
  console.log('  下一节首片 #' + start + '：「' + s[start].title + '」');
  console.log('  该章共 ' + (s.length - 1) + ' 片');
}
