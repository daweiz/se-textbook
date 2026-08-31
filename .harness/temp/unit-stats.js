// 统计 32 节每节页数、导引页、封面、小结、提示词代码块等
const fs = require('fs');
const path = require('path');

function loadUnit(n) {
  const f = path.join('docs/data', 'unit-' + String(n).padStart(2, '0') + '.js');
  const src = fs.readFileSync(f, 'utf8').replace(/window\.SLIDES\s*=/, 'globalThis.__D =');
  const m = src.match(/globalThis\.__D =([\s\S]*);?\s*$/);
  eval(m[0]);
  return globalThis.__D;
}

let total = 0, totalGuides = 0, totalCovers = 0;
const below = [];
for (let n = 1; n <= 32; n++) {
  const obj = loadUnit(n);
  const slides = obj.slides;
  total += slides.length;
  let guides = 0, covers = 0, ends = 0, promptPages = 0, metaOutlines = 0;
  for (const s of slides) {
    if (s.type === 'title') covers++;
    if (s.title && s.title.includes('（导引）')) guides++;
    if (s.id && s.id.endsWith('-end')) ends++;
    if (s.body && s.body.includes('```text') ) promptPages++;
    if (s.body && s.body.includes('本讲导引')) metaOutlines++;
  }
  totalGuides += guides; totalCovers += covers;
  if (slides.length < 30) below.push('unit-' + n + '(' + slides.length + ')');
  console.log('unit-' + String(n).padStart(2,'0') + ': ' + String(slides.length).padStart(2) + ' 页 | 封面' + covers + ' 导引' + String(guides).padStart(2) + ' 小结' + ends + ' | 提示词页' + promptPages + ' 导引块' + metaOutlines);
}
console.log('总页数 ' + total + ' | 总导引页 ' + totalGuides + ' | 总封面 ' + totalCovers);
console.log('低于30页的节: ' + (below.join(', ') || '无'));
