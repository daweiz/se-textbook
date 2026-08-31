// 查看提示词页 body 原文
const fs = require('fs');
function load(n) {
  const src = fs.readFileSync('slides/data/unit-' + String(n).padStart(2, '0') + '.js', 'utf8');
  const m = src.match(/window\.SLIDES\s*=\s*([\s\S]*?);\s*$/);
  return eval('(' + m[1] + ')');
}
for (const n of [2, 4, 8, 29, 30]) {
  const obj = load(n);
  for (const s of obj.slides) {
    if (s.body && s.body.includes('```')) {
      console.log('===== unit-' + n + ' | ' + s.title);
      console.log(s.body.replace(/\n/g, ' ').slice(0, 800));
      console.log('');
    }
  }
}
